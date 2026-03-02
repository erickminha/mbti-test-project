import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { buildExperimentSummary, getOrAssignVariant, OfferVariant, trackEvent } from "@/lib/funnelAnalytics";

const MBTI_TYPES: Record<string, any> = {
  ISTJ: { title: "The Logistician", desc: "Practical, fact-oriented, reliable, and responsible" },
  ISFJ: { title: "The Defender", desc: "Warm, conscientious, and dedicated to serving others" },
  INFJ: { title: "The Advocate", desc: "Insightful, principled, and passionate about their values" },
  INTJ: { title: "The Architect", desc: "Strategic, independent, and focused on long-term goals" },
  ISTP: { title: "The Virtuoso", desc: "Practical, logical, and adaptable" },
  ISFP: { title: "The Adventurer", desc: "Artistic, sensitive, and adventurous" },
  INFP: { title: "The Mediator", desc: "Idealistic, creative, and compassionate" },
  INTP: { title: "The Logician", desc: "Analytical, innovative, and curious" },
  ESTP: { title: "The Entrepreneur", desc: "Energetic, pragmatic, and action-oriented" },
  ESFP: { title: "The Entertainer", desc: "Spontaneous, friendly, and outgoing" },
  ENFP: { title: "The Campaigner", desc: "Enthusiastic, creative, and people-oriented" },
  ENTP: { title: "The Debater", desc: "Innovative, curious, and argumentative" },
  ESTJ: { title: "The Executive", desc: "Organized, logical, and leadership-oriented" },
  ESFJ: { title: "The Consul", desc: "Warm, responsible, and people-focused" },
  ENFJ: { title: "The Protagonist", desc: "Charismatic, empathetic, and inspiring" },
  ENTJ: { title: "The Commander", desc: "Strategic, decisive, and commanding" },
};

const offerDefinition: Record<
  OfferVariant,
  {
    name: string;
    valueCopy: string;
    checkoutLabel: string;
    options: { label: string; description: string; price: number; featured?: boolean }[];
  }
> = {
  single_price: {
    name: "Preço Único",
    valueCopy: "Receba insight acionável do seu tipo MBTI com plano pessoal de desenvolvimento.",
    checkoutLabel: "Liberar relatório completo por R$39",
    options: [{ label: "Relatório Completo", description: "Análise + plano pessoal", price: 39 }],
  },
  anchor: {
    name: "Ancoragem Básico/Premium",
    valueCopy: "Escolha entre básico e premium para transformar o insight acionável em execução real.",
    checkoutLabel: "Escolher plano",
    options: [
      { label: "Básico", description: "Relatório essencial", price: 29 },
      { label: "Premium", description: "Relatório + plano pessoal aprofundado", price: 79, featured: true },
    ],
  },
  bundle: {
    name: "Bundle Comparativo",
    valueCopy: "Compare seu perfil com times e parceiros e receba um plano pessoal orientado por contexto.",
    checkoutLabel: "Comprar bundle",
    options: [
      { label: "Solo", description: "Relatório individual", price: 35 },
      { label: "Bundle Duo", description: "2 relatórios + comparativo", price: 59, featured: true },
      { label: "Bundle Time", description: "5 relatórios + comparativo", price: 129 },
    ],
  },
};

interface MBTIResultsProps {
  result: {
    type: string;
    scores: Record<string, number>;
    percentages: Record<string, number>;
  };
  onRestart: () => void;
}

export default function MBTIResults({ result, onRestart }: MBTIResultsProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sampleInput, setSampleInput] = useState(120);
  const [windowInput, setWindowInput] = useState(14);

  const activeVariant = getOrAssignVariant();
  const variantConfig = offerDefinition[activeVariant];
  const summary = useMemo(() => buildExperimentSummary(sampleInput, windowInput), [sampleInput, windowInput, paymentDone, feedbackSent]);

  const winnerVariant = summary.bestVariant || activeVariant;
  const dynamicValueCopy = offerDefinition[winnerVariant].valueCopy;

  const typeInfo = MBTI_TYPES[result.type] || { title: "Unknown", desc: "Unknown type" };

  const chartData = [
    { name: "E/I", E: result.percentages.e, I: result.percentages.i },
    { name: "S/N", S: result.percentages.s, N: result.percentages.n },
    { name: "T/F", T: result.percentages.t, F: result.percentages.f },
    { name: "J/P", J: result.percentages.j, P: result.percentages.p },
  ];

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
              {typeInfo.title}
            </CardTitle>
            <p className="text-lg text-slate-300">{typeInfo.desc}</p>
            <p className="text-purple-300 text-sm">Copy de valor ativa: {dynamicValueCopy}</p>
          </CardHeader>
        </Card>

        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Your Personality Breakdown</CardTitle>
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

        <Card className="border-emerald-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Oferta atual: {variantConfig.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              {variantConfig.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setSelectedPrice(option.price)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selectedPrice === option.price
                      ? "border-purple-400 bg-purple-500/20"
                      : "border-slate-700 hover:border-purple-500/50"
                  } ${option.featured ? "ring-1 ring-amber-300/60" : ""}`}
                >
                  <p className="text-white font-semibold">{option.label}</p>
                  <p className="text-slate-400 text-sm">{option.description}</p>
                  <p className="text-purple-300 mt-2 font-bold">R${option.price}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={beginCheckout} className="bg-emerald-600 hover:bg-emerald-700">
                {variantConfig.checkoutLabel}
              </Button>
              {checkoutOpen && (
                <Button onClick={approvePayment} disabled={!selectedPrice} className="bg-purple-600 hover:bg-purple-700">
                  Simular pagamento aprovado
                </Button>
              )}
            </div>
            {paymentDone && (
              <div className="space-y-3 border border-purple-500/30 rounded-md p-4">
                <p className="text-green-300 text-sm">Pagamento aprovado e funil registrado.</p>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-slate-300 text-sm">Satisfação pós-compra:</span>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <Button key={score} size="sm" variant="outline" onClick={() => sendFeedback(score)}>
                      {score}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline" onClick={askRefund}>
                    Solicitar reembolso
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Painel de experimento A/B/n</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div className="flex gap-3 flex-wrap">
              <label className="text-sm">Amostra mínima por variante:
                <input className="ml-2 bg-slate-800 border border-slate-600 rounded px-2 py-1 w-20" type="number" value={sampleInput} onChange={(e) => setSampleInput(Number(e.target.value) || 0)} />
              </label>
              <label className="text-sm">Janela (dias):
                <input className="ml-2 bg-slate-800 border border-slate-600 rounded px-2 py-1 w-20" type="number" value={windowInput} onChange={(e) => setWindowInput(Number(e.target.value) || 1)} />
              </label>
            </div>
            <p className="text-sm text-slate-400">
              Status: {summary.minimumSampleReached ? "Amostra atingida" : "Aguardando volume mínimo por variante"}.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="py-2">Variante</th>
                    <th>Sessões</th>
                    <th>Conversão</th>
                    <th>RPV</th>
                    <th>Reembolso</th>
                    <th>Satisfação</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byVariant.map((line) => (
                    <tr key={line.variant} className="border-b border-slate-800">
                      <td className="py-2">{offerDefinition[line.variant].name}</td>
                      <td>{line.sessions}</td>
                      <td>{line.conversionRate.toFixed(1)}%</td>
                      <td>R${line.rpv.toFixed(2)}</td>
                      <td>{line.refundRate.toFixed(1)}%</td>
                      <td>{line.avgSatisfaction.toFixed(2)}/5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-purple-300">
              Melhor variante atual por RPV e conversão: {summary.bestVariant ? offerDefinition[summary.bestVariant].name : "sem dados"}.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg rounded-lg shadow-lg transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Take Test Again
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 font-semibold py-6 text-lg rounded-lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Result
          </Button>
        </div>
      </div>
    </div>
  );
}
