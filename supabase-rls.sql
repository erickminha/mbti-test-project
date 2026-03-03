-- Execute no SQL Editor do Supabase

create extension if not exists pgcrypto;

-- Tipos
DO $$ BEGIN
  CREATE TYPE public.plan_type AS ENUM ('free', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.mbti_dichotomy AS ENUM ('e/i', 's/n', 't/f', 'j/p');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabelas
create table if not exists public.app_users (
  user_id text primary key,
  plan public.plan_type not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mbti_questions (
  id int primary key,
  q text not null,
  a text not null,
  b text not null,
  dichotomy public.mbti_dichotomy not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mbti_results (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.app_users(user_id) on delete cascade,
  type text not null check (char_length(type) = 4),
  scores jsonb not null,
  percentages jsonb not null,
  created_at timestamptz not null default now()
);

-- Habilitar RLS
alter table public.app_users enable row level security;
alter table public.mbti_questions enable row level security;
alter table public.mbti_results enable row level security;

-- Policies anon para fluxo guest por user_id
-- app_users
DROP POLICY IF EXISTS app_users_select_own ON public.app_users;
CREATE POLICY app_users_select_own ON public.app_users
FOR SELECT TO anon
USING (user_id LIKE 'guest_%');

DROP POLICY IF EXISTS app_users_insert_guest ON public.app_users;
CREATE POLICY app_users_insert_guest ON public.app_users
FOR INSERT TO anon
WITH CHECK (user_id LIKE 'guest_%' AND plan IN ('free','premium'));

DROP POLICY IF EXISTS app_users_update_guest_plan ON public.app_users;
CREATE POLICY app_users_update_guest_plan ON public.app_users
FOR UPDATE TO anon
USING (user_id LIKE 'guest_%')
WITH CHECK (user_id LIKE 'guest_%' AND plan IN ('free','premium'));

-- questions leitura pública
DROP POLICY IF EXISTS questions_read_all ON public.mbti_questions;
CREATE POLICY questions_read_all ON public.mbti_questions
FOR SELECT TO anon
USING (active = true);

-- results
DROP POLICY IF EXISTS results_select_guest ON public.mbti_results;
CREATE POLICY results_select_guest ON public.mbti_results
FOR SELECT TO anon
USING (user_id LIKE 'guest_%');

DROP POLICY IF EXISTS results_insert_guest ON public.mbti_results;
CREATE POLICY results_insert_guest ON public.mbti_results
FOR INSERT TO anon
WITH CHECK (user_id LIKE 'guest_%');

-- seed 70 perguntas
insert into public.mbti_questions (id, q, a, b, dichotomy, active)
select
  gs as id,
  case (gs - 1) % 4
    when 0 then format('Em ambientes sociais, você prefere (%s)?', gs)
    when 1 then format('Ao aprender algo novo, você confia mais em (%s)?', gs)
    when 2 then format('Em decisões difíceis, você prioriza (%s)?', gs)
    else format('No dia a dia, você funciona melhor com (%s)?', gs)
  end as q,
  case (gs - 1) % 4
    when 0 then 'interagir com várias pessoas'
    when 1 then 'fatos concretos e exemplos práticos'
    when 2 then 'critérios lógicos e consistentes'
    else 'planejamento e prazos definidos'
  end as a,
  case (gs - 1) % 4
    when 0 then 'manter conversas com poucas pessoas conhecidas'
    when 1 then 'conceitos e possibilidades futuras'
    when 2 then 'impacto humano e harmonia'
    else 'flexibilidade e adaptação espontânea'
  end as b,
  case (gs - 1) % 4
    when 0 then 'e/i'::public.mbti_dichotomy
    when 1 then 's/n'::public.mbti_dichotomy
    when 2 then 't/f'::public.mbti_dichotomy
    else 'j/p'::public.mbti_dichotomy
  end as dichotomy,
  true as active
from generate_series(1, 70) gs
on conflict (id) do update
set q = excluded.q,
    a = excluded.a,
    b = excluded.b,
    dichotomy = excluded.dichotomy,
    active = excluded.active;
