import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { marketingLegalReview } from "@shared/content/legal";
import MBTITest from "@/components/MBTITest";
import MBTIResults from "@/components/MBTIResults";

export default function Home() {
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState<any>(null);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleTestComplete = (result: any) => {
    setMbtiResult(result);
    setTestCompleted(true);
  };

  const handleRestart = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setMbtiResult(null);
  };

  if (testCompleted && mbtiResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <MBTIResults result={mbtiResult} onRestart={handleRestart} />
      </div>
    );
  }

  if (testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <MBTITest onComplete={handleTestComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">MBTI</span>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Teste de Personalidade MBTI
            </CardTitle>
            <CardDescription className="text-lg text-slate-300">
              Descubra tendências do seu perfil de personalidade através de perguntas de autorreflexão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">70 Questões Autênticas</h3>
                  <p className="text-sm">Inspiradas em modelos de tipologia para apoiar autoconhecimento</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Análise Profunda</h3>
                  <p className="text-sm">Receba insights detalhados sobre seus 4 dicotomias principais</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Resultados Instantâneos</h3>
                  <p className="text-sm">Veja seu tipo de personalidade e descrição detalhada imediatamente</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-purple-300">Tempo estimado:</span> 10-15 minutos
              </p>
            </div>

            <LegalDisclaimer surface="onboarding" />

            <div className="bg-slate-950/40 border border-slate-700 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-white">{marketingLegalReview.title}</p>
              <p className="text-xs text-slate-300">
                Termos sensíveis para evitar sem validação formal: {marketingLegalReview.avoidClaims.join(", ")}.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
                {marketingLegalReview.guidance.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleStartTest}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Teste
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
