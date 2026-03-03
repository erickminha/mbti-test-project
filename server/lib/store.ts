import { randomUUID } from "crypto";
import { isSupabaseConfigured, supabase } from "./supabase";

export type Plan = "free" | "premium";

export interface StoredResult {
  id: string;
  userId: string;
  type: string;
  scores: Record<string, number>;
  percentages: Record<string, number>;
  createdAt: string;
}

const userPlans = new Map<string, Plan>();
const results = new Map<string, StoredResult[]>();

const mapRow = (row: any): StoredResult => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  scores: row.scores,
  percentages: row.percentages,
  createdAt: row.created_at,
});

export const createGuestUser = async () => {
  const id = `guest_${randomUUID()}`;

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("app_users").insert({ user_id: id, plan: "free" });
    if (!error) return { userId: id, plan: "free" as Plan };
  }

  userPlans.set(id, "free");
  return { userId: id, plan: "free" as Plan };
};

export const getPlan = async (userId: string): Promise<Plan> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("app_users").select("plan").eq("user_id", userId).maybeSingle();
    if (!error && data?.plan) return data.plan as Plan;
  }

  return userPlans.get(userId) || "free";
};

export const activatePremium = async (userId: string) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("app_users").upsert({ user_id: userId, plan: "premium" }, { onConflict: "user_id" });
    if (!error) return { userId, plan: "premium" as Plan };
  }

  userPlans.set(userId, "premium");
  return { userId, plan: "premium" as Plan };
};

export const saveResult = async (payload: Omit<StoredResult, "id" | "createdAt">) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("mbti_results")
      .insert({ user_id: payload.userId, type: payload.type, scores: payload.scores, percentages: payload.percentages })
      .select("id,user_id,type,scores,percentages,created_at")
      .single();

    if (!error && data) {
      return mapRow(data);
    }
  }

  const row: StoredResult = { ...payload, id: randomUUID(), createdAt: new Date().toISOString() };
  const list = results.get(payload.userId) || [];
  list.unshift(row);
  results.set(payload.userId, list);
  return row;
};

export const getHistory = async (userId: string) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("mbti_results")
      .select("id,user_id,type,scores,percentages,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) return data.map(mapRow);
  }

  return results.get(userId) || [];
};

export const getResultById = async (resultId: string) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("mbti_results")
      .select("id,user_id,type,scores,percentages,created_at")
      .eq("id", resultId)
      .maybeSingle();

    if (!error && data) return mapRow(data);
  }

  for (const list of Array.from(results.values())) {
    const found = list.find((r: StoredResult) => r.id === resultId);
    if (found) return found;
  }
  return null;
};
