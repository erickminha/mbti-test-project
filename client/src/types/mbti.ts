export type MBTILetter = "e" | "i" | "s" | "n" | "t" | "f" | "j" | "p";

export interface MBTIResult {
  id?: string;
  userId?: string;
  createdAt?: string;
  type: string;
  scores: Record<MBTILetter, number>;
  percentages: Record<MBTILetter, number>;
}
