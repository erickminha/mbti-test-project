export type DimensionKey = "ei" | "sn" | "tf" | "jp";

export interface DimensionConfidence {
  dimension: DimensionKey;
  label: string;
  dominant: string;
  opposite: string;
  dominantScore: number;
  oppositeScore: number;
  confidence: number;
  level: "low" | "medium" | "high";
}

const DIMENSION_META: Record<DimensionKey, { label: string; dominant: string; opposite: string }> = {
  ei: { label: "E vs I", dominant: "E", opposite: "I" },
  sn: { label: "S vs N", dominant: "S", opposite: "N" },
  tf: { label: "T vs F", dominant: "T", opposite: "F" },
  jp: { label: "J vs P", dominant: "J", opposite: "P" },
};

function classifyConfidence(confidence: number): "low" | "medium" | "high" {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.55) return "medium";
  return "low";
}

export function computeDimensionConfidence(scores: Record<string, number>): DimensionConfidence[] {
  const pairs: Array<[DimensionKey, string, string]> = [
    ["ei", "e", "i"],
    ["sn", "s", "n"],
    ["tf", "t", "f"],
    ["jp", "j", "p"],
  ];

  return pairs.map(([dimension, left, right]) => {
    const leftScore = scores[left] ?? 0;
    const rightScore = scores[right] ?? 0;
    const total = Math.max(leftScore + rightScore, 1);
    const normalizedMargin = Math.abs(leftScore - rightScore) / total;
    const confidence = Number((0.5 + normalizedMargin / 2).toFixed(2));

    const dominant = leftScore >= rightScore ? left.toUpperCase() : right.toUpperCase();
    const opposite = dominant === left.toUpperCase() ? right.toUpperCase() : left.toUpperCase();

    return {
      dimension,
      label: DIMENSION_META[dimension].label,
      dominant,
      opposite,
      dominantScore: Math.max(leftScore, rightScore),
      oppositeScore: Math.min(leftScore, rightScore),
      confidence,
      level: classifyConfidence(confidence),
    };
  });
}

export function getProfileConfidence(confidences: DimensionConfidence[]) {
  if (confidences.length === 0) {
    throw new Error("At least one dimension confidence value is required");
  }

  const average = confidences.reduce((acc, item) => acc + item.confidence, 0) / confidences.length;
  const minDimension = confidences.reduce((worst, current) =>
    current.confidence < worst.confidence ? current : worst,
  );

  return {
    average: Number(average.toFixed(2)),
    minimum: minDimension,
  };
}
