import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Answer = "a" | "b";
type Dimension = "ei" | "sn" | "tf" | "jp";
type ReliabilityLevel = "poor" | "moderate" | "good";

interface Participant {
  participantId: string;
  timestamp: string;
  responses: {
    full: Answer[];
    short: Answer[];
    adaptive: Answer[];
  };
  retest: {
    timestamp: string;
    full: Answer[];
  };
  clarityFeedback: {
    rating: number;
    comment: string;
  };
}

const GOALS = {
  alphaOverall: 0.7,
  alphaByDimension: 0.6,
  testRetest: 0.75,
  shortVsFull: 0.8,
  adaptiveVsFull: 0.8,
  maxDimensionError: 0.2,
  minProfileConfidence: 0.68,
  minSampleSize: 30,
};

interface CalibrationReport {
  generatedAt: string;
  sampleSize: number;
  sampleWarning: string | null;
  goals: typeof GOALS;
  clarity: { average: number; min: number; max: number };
  reliability: {
    alphaOverall: number;
    alphaByDimension: Record<Dimension, number>;
    alphaOverallBootstrap95CI: [number, number];
    testRetestCorrelation: number;
    testRetestBootstrap95CI: [number, number];
    shortVsFullCorrelation: number;
    adaptiveVsFullCorrelation: number;
  };
  modelComparison: {
    rulesMeanDimensionError: number;
    adaptiveMeanDimensionError: number;
    preferredModel: "rules" | "adaptive";
  };
  premiumGate: { decision: "GO" | "NO-GO"; breakdown: Record<string, boolean> };
}

const FULL_DIMENSIONS: Dimension[] = ["ei", "sn", "sn", "tf", "tf", "jp", "jp", "ei", "sn", "sn"];
const SHORT_TO_FULL_INDEX = [0, 1, 3, 5, 7, 8, 4, 6, 2, 9];
const ADAPTIVE_DIMENSIONS: Dimension[] = ["ei", "sn", "tf", "jp", "ei", "sn"];

function assertValidParticipant(p: Participant) {
  if (p.responses.full.length !== FULL_DIMENSIONS.length || p.retest.full.length !== FULL_DIMENSIONS.length) {
    throw new Error(`Participant ${p.participantId}: full/retest length inválido`);
  }
  if (p.responses.short.length < 4 || p.responses.adaptive.length !== ADAPTIVE_DIMENSIONS.length) {
    throw new Error(`Participant ${p.participantId}: short/adaptive length inválido`);
  }
  if (p.clarityFeedback.rating < 1 || p.clarityFeedback.rating > 5) {
    throw new Error(`Participant ${p.participantId}: rating de clareza fora do intervalo 1..5`);
  }
}

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / Math.max(values.length, 1);
const variance = (values: number[]) => {
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / Math.max(values.length, 1);
};

function toBinary(answers: Answer[]): number[] {
  return answers.map((a) => (a === "a" ? 1 : 0));
}

function pearson(a: number[], b: number[]): number {
  const ma = mean(a);
  const mb = mean(b);
  const cov = a.reduce((sum, v, i) => sum + (v - ma) * (b[i] - mb), 0);
  const da = Math.sqrt(a.reduce((sum, v) => sum + (v - ma) ** 2, 0));
  const db = Math.sqrt(b.reduce((sum, v) => sum + (v - mb) ** 2, 0));
  if (!da || !db) return 0;
  return cov / (da * db);
}

function cronbachAlpha(matrix: number[][]): number {
  const k = matrix[0]?.length ?? 0;
  if (k <= 1) return 0;
  const itemVars = Array.from({ length: k }, (_, i) => variance(matrix.map((row) => row[i])));
  const totals = matrix.map((row) => row.reduce((sum, x) => sum + x, 0));
  const totalVar = variance(totals);
  if (!totalVar) return 0;
  return (k / (k - 1)) * (1 - itemVars.reduce((sum, v) => sum + v, 0) / totalVar);
}

const sampleWithReplacement = <T>(arr: T[]) => Array.from({ length: arr.length }, () => arr[Math.floor(Math.random() * arr.length)]);

function bootstrapCIForMatrix(matrix: number[][], metricFn: (sampleMatrix: number[][]) => number, n = 500): [number, number] {
  const idx = [...matrix.keys()];
  const estimates = Array.from({ length: n }, () => metricFn(sampleWithReplacement(idx).map((i) => matrix[i]))).sort((a, b) => a - b);
  return [Number((estimates[Math.floor(0.025 * n)] ?? 0).toFixed(3)), Number((estimates[Math.floor(0.975 * n)] ?? 0).toFixed(3))];
}

function bootstrapCIForPairs(a: number[], b: number[], metricFn: (x: number[], y: number[]) => number, n = 500): [number, number] {
  const idx = [...a.keys()];
  const estimates = Array.from({ length: n }, () => {
    const sampled = sampleWithReplacement(idx);
    return metricFn(sampled.map((i) => a[i]), sampled.map((i) => b[i]));
  }).sort((x, y) => x - y);
  return [Number((estimates[Math.floor(0.025 * n)] ?? 0).toFixed(3)), Number((estimates[Math.floor(0.975 * n)] ?? 0).toFixed(3))];
}

function scoreByDimension(answers: Answer[], map: Dimension[]): Record<Dimension, number> {
  const score: Record<Dimension, number> = { ei: 0, sn: 0, tf: 0, jp: 0 };
  answers.forEach((answer, index) => {
    score[map[index]] += answer === "a" ? 1 : -1;
  });
  return score;
}

function expandShortToFull(shortAnswers: Answer[]): Answer[] {
  const safe = [...shortAnswers];
  while (safe.length < 4) safe.push("a");
  return SHORT_TO_FULL_INDEX.map((idx) => safe[idx % safe.length]);
}

function profileConfidenceFromFull(answers: Answer[]): number {
  const pairs: Array<[number, number]> = [[0, 7], [1, 2], [3, 4], [5, 6]];
  return mean(
    pairs.map(([a, b]) => {
      const left = Number(answers[a] === "a") + Number(answers[b] === "a");
      return 0.5 + Math.abs(left - (2 - left)) / 4;
    }),
  );
}

function dimensionError(reference: Record<Dimension, number>, compared: Record<Dimension, number>) {
  return mean((["ei", "sn", "tf", "jp"] as Dimension[]).map((d) => Math.abs(reference[d] - compared[d]) / 5));
}

function levelFromAlpha(alpha: number): ReliabilityLevel {
  if (alpha >= 0.75) return "good";
  if (alpha >= 0.6) return "moderate";
  return "poor";
}

const sample = JSON.parse(readFileSync("data/calibration/pilot-sample.json", "utf-8")) as Participant[];
sample.forEach(assertValidParticipant);

const fullBinary = sample.map((p) => toBinary(p.responses.full));
const retestBinary = sample.map((p) => toBinary(p.retest.full));
const shortBinaryExpanded = sample.map((p) => toBinary(expandShortToFull(p.responses.short)));
const adaptiveBinaryExpanded = sample.map((p) => {
  const adaptiveScore = scoreByDimension(p.responses.adaptive, ADAPTIVE_DIMENSIONS);
  return toBinary(FULL_DIMENSIONS.map((dim) => (adaptiveScore[dim] >= 0 ? "a" : "b")));
});

const fullTotals = fullBinary.map((r) => r.reduce((sum, x) => sum + x, 0));
const retestTotals = retestBinary.map((r) => r.reduce((sum, x) => sum + x, 0));
const shortTotals = shortBinaryExpanded.map((r) => r.reduce((sum, x) => sum + x, 0));
const adaptiveTotals = adaptiveBinaryExpanded.map((r) => r.reduce((sum, x) => sum + x, 0));

const alphaOverall = cronbachAlpha(fullBinary);
const alphaByDimension: Record<Dimension, number> = {
  ei: cronbachAlpha(fullBinary.map((row) => [row[0], row[7]])),
  sn: cronbachAlpha(fullBinary.map((row) => [row[1], row[2], row[8], row[9]])),
  tf: cronbachAlpha(fullBinary.map((row) => [row[3], row[4]])),
  jp: cronbachAlpha(fullBinary.map((row) => [row[5], row[6]])),
};

const testRetestCorrelation = pearson(fullTotals, retestTotals);
const shortVsFullCorrelation = pearson(shortTotals, fullTotals);
const adaptiveVsFullCorrelation = pearson(adaptiveTotals, fullTotals);

const rulesMeanDimensionError = mean(
  sample.map((p) => dimensionError(scoreByDimension(p.responses.full, FULL_DIMENSIONS), scoreByDimension(expandShortToFull(p.responses.short), FULL_DIMENSIONS))),
);
const adaptiveMeanDimensionError = mean(
  sample.map((p) => dimensionError(scoreByDimension(p.responses.full, FULL_DIMENSIONS), scoreByDimension(p.responses.adaptive, ADAPTIVE_DIMENSIONS))),
);

const meanProfileConfidence = mean(sample.map((p) => profileConfidenceFromFull(p.responses.full)));
const clarityRatings = sample.map((p) => p.clarityFeedback.rating);

const premiumBreakdown = {
  alphaOverall: alphaOverall >= GOALS.alphaOverall,
  alphaByDimension: Object.values(alphaByDimension).every((alpha) => alpha >= GOALS.alphaByDimension),
  testRetest: testRetestCorrelation >= GOALS.testRetest,
  shortVsFull: shortVsFullCorrelation >= GOALS.shortVsFull,
  adaptiveVsFull: adaptiveVsFullCorrelation >= GOALS.adaptiveVsFull,
  dimensionError: Math.min(rulesMeanDimensionError, adaptiveMeanDimensionError) <= GOALS.maxDimensionError,
  profileConfidence: meanProfileConfidence >= GOALS.minProfileConfidence,
  sampleSize: sample.length >= GOALS.minSampleSize,
};

const report: CalibrationReport = {
  generatedAt: new Date().toISOString(),
  sampleSize: sample.length,
  sampleWarning: sample.length < GOALS.minSampleSize ? `Amostra pequena (${sample.length}). Recomendada >= ${GOALS.minSampleSize}.` : null,
  goals: GOALS,
  clarity: { average: Number(mean(clarityRatings).toFixed(2)), min: Math.min(...clarityRatings), max: Math.max(...clarityRatings) },
  reliability: {
    alphaOverall: Number(alphaOverall.toFixed(3)),
    alphaByDimension: {
      ei: Number(alphaByDimension.ei.toFixed(3)),
      sn: Number(alphaByDimension.sn.toFixed(3)),
      tf: Number(alphaByDimension.tf.toFixed(3)),
      jp: Number(alphaByDimension.jp.toFixed(3)),
    },
    alphaOverallBootstrap95CI: bootstrapCIForMatrix(fullBinary, cronbachAlpha),
    testRetestCorrelation: Number(testRetestCorrelation.toFixed(3)),
    testRetestBootstrap95CI: bootstrapCIForPairs(fullTotals, retestTotals, pearson),
    shortVsFullCorrelation: Number(shortVsFullCorrelation.toFixed(3)),
    adaptiveVsFullCorrelation: Number(adaptiveVsFullCorrelation.toFixed(3)),
  },
  modelComparison: {
    rulesMeanDimensionError: Number(rulesMeanDimensionError.toFixed(3)),
    adaptiveMeanDimensionError: Number(adaptiveMeanDimensionError.toFixed(3)),
    preferredModel: adaptiveMeanDimensionError <= rulesMeanDimensionError ? "adaptive" : "rules",
  },
  premiumGate: {
    decision: Object.values(premiumBreakdown).every(Boolean) ? "GO" : "NO-GO",
    breakdown: premiumBreakdown,
  },
};

mkdirSync("docs/calibration", { recursive: true });
writeFileSync("docs/calibration/latest-report.json", JSON.stringify(report, null, 2));

console.log("=== Calibration summary ===");
console.log(JSON.stringify(report, null, 2));
console.log("\n=== Reliability interpretation ===");
console.log(Object.entries(report.reliability.alphaByDimension).map(([d, a]) => `${d.toUpperCase()}: ${a} (${levelFromAlpha(a)})`).join("\n"));
