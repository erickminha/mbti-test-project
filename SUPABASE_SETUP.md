# Supabase setup

Crie um arquivo `.env` na raiz do projeto com:

```env
SUPABASE_URL=https://ndrxwburuyqlqwsknlyu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnh3YnVydXlxbHF3c2tubHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzY0MjcsImV4cCI6MjA4ODA1MjQyN30.U6wBcFwX0_bajWUBvyhHJxI1GbCkAOBNice141-vWpI
```

Depois execute:

```bash
pnpm install
pnpm build
pnpm start
```

Teste:

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:

```json
{"ok":true,"supabase":true}
```


## Modo direto no client (sem backend Node para dados)

Adicione também no `.env`:

```env
VITE_SUPABASE_URL=https://ndrxwburuyqlqwsknlyu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnh3YnVydXlxbHF3c2tubHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzY0MjcsImV4cCI6MjA4ODA1MjQyN30.U6wBcFwX0_bajWUBvyhHJxI1GbCkAOBNice141-vWpI
```

E execute o SQL de schema + RLS em `supabase-rls.sql`.

Com isso, `client/src/lib/api.ts` consulta Supabase diretamente (PostgREST), com fallback para `/api` se as variáveis VITE não estiverem configuradas.
