import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ShieldAlert } from "lucide-react";
import MBTITest from "@/components/MBTITest";
import MBTIResults from "@/components/MBTIResults";
import type { MBTIResult } from "@/types/mbti";

export default function Home() {
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState<MBTIResult | null>(null);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleTestComplete = (result: MBTIResult) => {
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-purple-500/30 bg-slate-900/50 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                <span className="text-2xl font-bold text-white">MBTI</span>
              </div>
            </div>
            <CardTitle className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
              Teste de Personalidade MBTI
            </CardTitle>
            <CardDescription className="text-lg text-slate-300">
              Descubra seu tipo de personalidade com uma experiência rápida, clara e focada em autoconhecimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Perguntas diretas e objetivas</h3>
                  <p className="text-sm">Fluxo simples para responder sem pressa e com mais clareza.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500">
                  <span className="text-sm font-bold text-white">2</span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Análise em 4 dimensões</h3>
                  <p className="text-sm">Veja o equilíbrio entre os eixos E/I, S/N, T/F e J/P.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Resultado imediato</h3>
                  <p className="text-sm">Receba seu perfil e resumo interpretativo logo ao final.</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-300">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">Aviso importante</p>
              </div>
              <p className="text-sm text-slate-300">
                Este teste é uma ferramenta de autoconhecimento e não constitui diagnóstico clínico,
                avaliação psicológica formal ou aconselhamento profissional.
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-purple-300">Tempo estimado:</span> 4-6 minutos
              </p>
            </div>

            <Button
              onClick={handleStartTest}
              className="w-full transform rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-6 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-blue-700"
            >
              Iniciar teste
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
