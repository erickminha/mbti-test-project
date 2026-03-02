import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { computeDimensionConfidence, getProfileConfidence } from "@/lib/psychometrics";
import type { MBTIResult } from "@/lib/mbti-types";

type QuestionOption = "a" | "b";

interface MBTITestProps {
  onComplete: (result: MBTIResult) => void;
}

const getAxisPercentage = (left: number, right: number) => {
  const total = left + right;
  if (total <= 0) return [50, 50] as const;
  const leftPercentage = Math.round((left / total) * 100);
  return [leftPercentage, 100 - leftPercentage] as const;
};

export default function MBTITest({ onComplete }: MBTITestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, QuestionOption>>({});
  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        await ensureGuestUser();
        const items = await fetchQuestions();
        setQuestions(items);
      } catch {
        setError("Falha ao carregar perguntas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = useMemo(() => (questions.length ? (answeredCount / questions.length) * 100 : 0), [answeredCount, questions.length]);

  const calculateMBTIResult = (currentAnswers: Record<number, QuestionOption>): MBTIResult => {
    const scores: Record<MBTILetter, number> = { e: 0, i: 0, s: 0, n: 0, t: 0, f: 0, j: 0, p: 0 };

  const calculateMBTIResult = (answers: Record<number, string>): MBTIResult => {
    const scores = { e: 0, i: 0, s: 0, n: 0, t: 0, f: 0, j: 0, p: 0 };

    Object.entries(answers).forEach(([index, answer]) => {
      const question = MBTI_QUESTIONS[parseInt(index)];
      const [first, second] = question.dichotomy.split("/");
      
      if (answer === "a") {
        scores[first as keyof typeof scores]++;
      } else {
        scores[second as keyof typeof scores]++;
      }
    });

    const [e, i] = getAxisPercentage(scores.e, scores.i);
    const [s, n] = getAxisPercentage(scores.s, scores.n);
    const [t, f] = getAxisPercentage(scores.t, scores.f);
    const [j, p] = getAxisPercentage(scores.j, scores.p);

    return {
      type: (scores.e >= scores.i ? "E" : "I") + (scores.s >= scores.n ? "S" : "N") + (scores.t >= scores.f ? "T" : "F") + (scores.j >= scores.p ? "J" : "P"),
      scores,
      percentages: { e, i, s, n, t, f, j, p },
    };
  };

    const dimensionConfidence = computeDimensionConfidence(scores);
    const profileConfidence = getProfileConfidence(dimensionConfidence);

    return { type, scores, percentages, dimensionConfidence, profileConfidence };
  };

  if (loading) return <div className="p-8 text-center text-slate-200">Carregando perguntas...</div>;
  if (error) return <div className="p-8 text-center text-red-300">{error}</div>;
  if (!question) return <div className="p-8 text-center text-slate-200">Sem perguntas disponíveis.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-purple-300">Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
        </div>

        <Card className="border-purple-500/30 bg-slate-900/50 shadow-2xl backdrop-blur-sm">
          <CardContent className="pb-8 pt-8">
            <h2 className="mb-8 text-2xl font-bold leading-relaxed text-white">{question.q}</h2>
            <div className="space-y-3">
              {(["a", "b"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion]: option }))}
                  className={`w-full rounded-lg border-2 p-4 text-left font-medium transition-all duration-200 ${
                    selectedAnswer === option
                      ? option === "a"
                        ? "border-purple-500 bg-purple-500/20 text-purple-100"
                        : "border-blue-500 bg-blue-500/20 text-blue-100"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {option === "a" ? question.a : question.b}
                </button>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <Button onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))} disabled={currentQuestion === 0} variant="outline" className="flex-1 border-slate-600 text-slate-300">
                <ChevronLeft className="mr-2 h-4 w-4" />Anterior
              </Button>
              <Button onClick={handleNext} disabled={!selectedAnswer || submitting} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                {submitting ? "Finalizando..." : currentQuestion === questions.length - 1 ? "Finalizar" : "Próxima"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
