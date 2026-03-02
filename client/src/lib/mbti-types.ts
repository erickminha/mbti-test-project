import type { DimensionConfidence } from "@/lib/psychometrics";

export interface MBTIResult {
  type: string;
  scores: Record<string, number>;
  percentages: Record<string, number>;
  dimensionConfidence: DimensionConfidence[];
  profileConfidence: {
    average: number;
    minimum: DimensionConfidence;
  };
}
