import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { buildExperimentSummary, getOrAssignVariant, OfferVariant, trackEvent } from "@/lib/funnelAnalytics";

interface MBTIResultsProps {
  result: MBTIResult;
  onRestart: () => void;
}

interface TypeContent {
  type: string;
  version: string;
  reviewDate: string;
  resumo: string;
  forcas: string[];
  riscos: string[];
  carreira: string;
  relacionamentos: string;
  desenvolvimento: string;
}

interface DynamicInsights {
  focoAtual: string;
  tomadaDecisao: string;
  ritmo: string;
}

export default function MBTIResults({ result, onRestart }: MBTIResultsProps) {
  const [content, setContent] = useState<TypeContent | null>(null);
  const [insights, setInsights] = useState<DynamicInsights | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: result.type, percentages: result.percentages }),
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar conteúdo do tipo MBTI.");
      }

      const payload = await response.json();
      setContent(payload.staticContent);
      setInsights(payload.dynamicInsights);
    };

    loadContent().catch(console.error);
  }, [result.type, result.percentages]);

  const chartData = useMemo(
    () => [
      { name: "E/I", E: result.percentages.e, I: result.percentages.i },
      { name: "S/N", S: result.percentages.s, N: result.percentages.n },
      { name: "T/F", T: result.percentages.t, F: result.percentages.f },
      { name: "J/P", J: result.percentages.j, P: result.percentages.p },
    ],
    [result.percentages],
  );

  const beginCheckout = () => {
    trackEvent("checkout_started");
    setCheckoutOpen(true);
  };

  const approvePayment = () => {
    if (!selectedPrice) return;
    trackEvent("payment_approved", { amount: selectedPrice });
    setPaymentDone(true);
  };

  const sendFeedback = (score: number) => {
    trackEvent("post_purchase_feedback", { satisfactionScore: score });
    setFeedbackSent(true);
  };

  const askRefund = () => {
    trackEvent("refund_requested");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-5xl">
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl mb-6">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">{result.type}</span>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Resultado MBTI
            </CardTitle>
            <p className="text-lg text-slate-300">{content?.resumo ?? "Carregando conteúdo editorial..."}</p>
          </CardHeader>
        </Card>

        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Seu gráfico de preferências</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="E" fill="#a855f7" />
                <Bar dataKey="I" fill="#3b82f6" />
                <Bar dataKey="S" fill="#f59e0b" />
                <Bar dataKey="N" fill="#8b5cf6" />
                <Bar dataKey="T" fill="#06b6d4" />
                <Bar dataKey="F" fill="#ec4899" />
                <Bar dataKey="J" fill="#10b981" />
                <Bar dataKey="P" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {content && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-purple-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Forças</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="list-disc ml-5 space-y-2">
                  {content.forcas.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Riscos</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="list-disc ml-5 space-y-2">
                  {content.riscos.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Carreira</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">{content.carreira}</CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Relacionamentos</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">{content.relacionamentos}</CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-slate-900/50 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Desenvolvimento</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">{content.desenvolvimento}</CardContent>
            </Card>
          </div>
        )}

        {insights && (
          <Card className="border-blue-500/30 bg-slate-900/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Insights dinâmicos (sessão atual)</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-2">
              <p>{insights.focoAtual}</p>
              <p>{insights.tomadaDecisao}</p>
              <p>{insights.ritmo}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg rounded-lg shadow-lg transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Refazer teste
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 font-semibold py-6 text-lg rounded-lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  );
}
