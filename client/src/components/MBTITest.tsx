import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MBTI_QUESTIONS = [
  { q: "At a party do you:", a: "Interact with many, including strangers", b: "Interact with a few, known to you", dichotomy: "e/i" },
  { q: "Are you more:", a: "Realistic than speculative", b: "Speculative than realistic", dichotomy: "s/n" },
  { q: "Is it worse to:", a: "Have your head in the clouds", b: "Be in a rut", dichotomy: "s/n" },
  { q: "Are you more impressed by:", a: "Principles", b: "Emotions", dichotomy: "t/f" },
  { q: "Are more drawn toward the:", a: "Convincing", b: "Touching", dichotomy: "t/f" },
  { q: "Do you prefer to work:", a: "To deadlines", b: "Just whenever", dichotomy: "j/p" },
  { q: "Do you tend to choose:", a: "Rather carefully", b: "Somewhat impulsively", dichotomy: "j/p" },
  { q: "At parties do you:", a: "Stay late, with increasing energy", b: "Leave early with decreased energy", dichotomy: "e/i" },
  { q: "Are you more attracted to:", a: "Sensible people", b: "Imaginative people", dichotomy: "s/n" },
  { q: "Are you more interested in:", a: "What is actual", b: "What is possible", dichotomy: "s/n" },
];

interface MBTITestProps {
  onComplete: (result: any) => void;
}

export default function MBTITest({ onComplete }: MBTITestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const progress = useMemo(() => {
    return ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100;
  }, [currentQuestion]);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = calculateMBTIResult(newAnswers);
      onComplete(result);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateMBTIResult = (answers: Record<number, string>) => {
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

    const type =
      (scores.e > scores.i ? "E" : "I") +
      (scores.s > scores.n ? "S" : "N") +
      (scores.t > scores.f ? "T" : "F") +
      (scores.j > scores.p ? "J" : "P");

    const percentages = {
      e: Math.round((scores.e / (scores.e + scores.i)) * 100),
      i: Math.round((scores.i / (scores.e + scores.i)) * 100),
      s: Math.round((scores.s / (scores.s + scores.n)) * 100),
      n: Math.round((scores.n / (scores.s + scores.n)) * 100),
      t: Math.round((scores.t / (scores.t + scores.f)) * 100),
      f: Math.round((scores.f / (scores.t + scores.f)) * 100),
      j: Math.round((scores.j / (scores.j + scores.p)) * 100),
      p: Math.round((scores.p / (scores.j + scores.p)) * 100),
    };

    return { type, scores, percentages };
  };

  const question = MBTI_QUESTIONS[currentQuestion];
  const isAnswered = currentQuestion in answers;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-purple-300">
              Question {currentQuestion + 1} of {MBTI_QUESTIONS.length}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
        </div>

        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
              {question.q}
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => handleAnswer("a")}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                  answers[currentQuestion] === "a"
                    ? "border-purple-500 bg-purple-500/20 text-purple-100"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === "a"
                        ? "border-purple-500 bg-purple-500"
                        : "border-slate-500"
                    }`}
                  >
                    {answers[currentQuestion] === "a" && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span>{question.a}</span>
                </div>
              </button>

              <button
                onClick={() => handleAnswer("b")}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                  answers[currentQuestion] === "b"
                    ? "border-blue-500 bg-blue-500/20 text-blue-100"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === "b"
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-500"
                    }`}
                  >
                    {answers[currentQuestion] === "b" && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span>{question.b}</span>
                </div>
              </button>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={() => handleAnswer(answers[currentQuestion] || "a")}
                disabled={!isAnswered}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === MBTI_QUESTIONS.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
