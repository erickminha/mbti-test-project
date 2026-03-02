import { randomUUID } from "crypto";

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

export const createGuestUser = () => {
  const id = `guest_${randomUUID()}`;
  userPlans.set(id, "free");
  return { userId: id, plan: "free" as Plan };
};

export const getPlan = (userId: string): Plan => userPlans.get(userId) || "free";

export const activatePremium = (userId: string) => {
  userPlans.set(userId, "premium");
  return { userId, plan: "premium" as Plan };
};

export const saveResult = (payload: Omit<StoredResult, "id" | "createdAt">) => {
  const row: StoredResult = { ...payload, id: randomUUID(), createdAt: new Date().toISOString() };
  const list = results.get(payload.userId) || [];
  list.unshift(row);
  results.set(payload.userId, list);
  return row;
};

export const getHistory = (userId: string) => results.get(userId) || [];

export const getResultById = (resultId: string) => {
  for (const list of Array.from(results.values())) {
    const found = list.find((r: StoredResult) => r.id === resultId);
    if (found) return found;
  }
  return null;
};
