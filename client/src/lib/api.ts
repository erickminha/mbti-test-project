import type { MBTIResult } from "@/types/mbti";

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

export const ensureGuestUser = async () => {
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const res = await fetch("/api/auth/guest", { method: "POST" });
  const data = await res.json();
  localStorage.setItem(USER_ID_KEY, data.userId);
  return data.userId as string;
};

export const getUserId = () => localStorage.getItem(USER_ID_KEY);

export const fetchQuestions = async () => {
  const res = await fetch("/api/questions");
  if (!res.ok) throw new Error("Não foi possível carregar perguntas");
  const data = await res.json();
  return data.items as MBTIQuestion[];
};

export const saveResult = async (payload: MBTIResult & { userId: string }) => {
  const res = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Não foi possível salvar resultado");
  return (await res.json()) as StoredResult;
};

export const fetchHistory = async (userId: string) => {
  const res = await fetch(`/api/results/${userId}`);
  if (!res.ok) throw new Error("Não foi possível carregar histórico");
  const data = await res.json();
  return data.items as StoredResult[];
};

export const fetchPlan = async (userId: string) => {
  const res = await fetch(`/api/subscription/status/${userId}`);
  const data = await res.json();
  return data.plan as "free" | "premium";
};

export const startCheckout = async (userId: string) => {
  const res = await fetch("/api/payments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
};

export const activatePremiumMock = async (userId: string) => {
  const res = await fetch("/api/payments/mock/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
};
