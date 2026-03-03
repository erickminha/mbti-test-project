import type { MBTIResult } from "@/types/mbti";
import { isSupabaseDirectEnabled, supabase } from "./supabase";

export interface MBTIQuestion {
  id: number;
  q: string;
  a: string;
  b: string;
  dichotomy: "e/i" | "s/n" | "t/f" | "j/p";
}

export interface StoredResult extends MBTIResult {
  id: string;
  userId: string;
  createdAt: string;
}

const USER_ID_KEY = "mbti_user_id";

const mapResultRow = (row: any): StoredResult => ({
  id: row.id,
  userId: row.user_id,
  createdAt: row.created_at,
  type: row.type,
  scores: row.scores,
  percentages: row.percentages,
});

export const ensureGuestUser = async () => {
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const guestId = `guest_${crypto.randomUUID()}`;

  if (isSupabaseDirectEnabled && supabase) {
    const { error } = await supabase.from("app_users").upsert({ user_id: guestId, plan: "free" }, { onConflict: "user_id" });
    if (!error) {
      localStorage.setItem(USER_ID_KEY, guestId);
      return guestId;
    }
  }

  const res = await fetch("/api/auth/guest", { method: "POST" });
  const data = await res.json();
  localStorage.setItem(USER_ID_KEY, data.userId);
  return data.userId as string;
};

export const getUserId = () => localStorage.getItem(USER_ID_KEY);

export const fetchQuestions = async () => {
  if (isSupabaseDirectEnabled && supabase) {
    const { data, error } = await supabase.from("mbti_questions").select("id,q,a,b,dichotomy").eq("active", true).order("id", { ascending: true });
    if (!error && data) {
      return data as MBTIQuestion[];
    }
  }

  const res = await fetch("/api/questions");
  if (!res.ok) throw new Error("Não foi possível carregar perguntas");
  const data = await res.json();
  return data.items as MBTIQuestion[];
};

export const saveResult = async (payload: MBTIResult & { userId: string }) => {
  if (isSupabaseDirectEnabled && supabase) {
    const { data, error } = await supabase
      .from("mbti_results")
      .insert({
        user_id: payload.userId,
        type: payload.type,
        scores: payload.scores,
        percentages: payload.percentages,
      })
      .select("id,user_id,type,scores,percentages,created_at")
      .single();

    if (!error && data) {
      return mapResultRow(data);
    }
  }

  const res = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Não foi possível salvar resultado");
  return (await res.json()) as StoredResult;
};

export const fetchHistory = async (userId: string) => {
  if (isSupabaseDirectEnabled && supabase) {
    const { data, error } = await supabase
      .from("mbti_results")
      .select("id,user_id,type,scores,percentages,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map(mapResultRow);
    }
  }

  const res = await fetch(`/api/results/${userId}`);
  if (!res.ok) throw new Error("Não foi possível carregar histórico");
  const data = await res.json();
  return data.items as StoredResult[];
};

export const fetchPlan = async (userId: string) => {
  if (isSupabaseDirectEnabled && supabase) {
    const { data, error } = await supabase.from("app_users").select("plan").eq("user_id", userId).maybeSingle();
    if (!error && data?.plan) return data.plan as "free" | "premium";
    return "free" as const;
  }

  const res = await fetch(`/api/subscription/status/${userId}`);
  const data = await res.json();
  return data.plan as "free" | "premium";
};

export const startCheckout = async (userId: string) => {
  if (isSupabaseDirectEnabled) {
    return {
      checkoutUrl: `/checkout/mock?userId=${encodeURIComponent(userId)}`,
      message: "Modo Supabase direto: checkout mock local.",
    };
  }

  const res = await fetch("/api/payments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
};

export const activatePremiumMock = async (userId: string) => {
  if (isSupabaseDirectEnabled && supabase) {
    const { error } = await supabase.from("app_users").upsert({ user_id: userId, plan: "premium" }, { onConflict: "user_id" });
    if (!error) {
      return { userId, plan: "premium" as const };
    }
  }

  const res = await fetch("/api/payments/mock/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
};
