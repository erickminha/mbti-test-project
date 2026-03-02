import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Share2, ShieldAlert, Download, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";

const MBTI_TYPES: Record<string, { title: string; desc: string }> = {
  ISTJ: { title: "Logístico", desc: "Prático, confiável e orientado a responsabilidades." },
  ISFJ: { title: "Defensor", desc: "Atencioso, dedicado e comprometido com as pessoas." },
  INFJ: { title: "Advogado", desc: "Idealista, profundo e guiado por valores." },
  INTJ: { title: "Arquiteto", desc: "Estratégico, independente e focado no longo prazo." },
  ISTP: { title: "Virtuoso", desc: "Analítico, objetivo e adaptável." },
  ISFP: { title: "Aventureiro", desc: "Sensível, criativo e espontâneo." },
  INFP: { title: "Mediador", desc: "Empático, imaginativo e orientado por propósito." },
  INTP: { title: "Lógico", desc: "Curioso, racional e voltado a ideias complexas." },
  ESTP: { title: "Empreendedor", desc: "Prático, energético e orientado à ação." },
  ESFP: { title: "Animador", desc: "Comunicativo, entusiasta e sociável." },
  ENFP: { title: "Ativista", desc: "Criativo, inspirador e conectado a pessoas." },
  ENTP: { title: "Inovador", desc: "Inventivo, questionador e estratégico." },
  ESTJ: { title: "Executivo", desc: "Organizado, direto e focado em resultados." },
  ESFJ: { title: "Cônsul", desc: "Prestativo, cooperativo e orientado ao grupo." },
  ENFJ: { title: "Protagonista", desc: "Carismático, empático e mobilizador." },
  ENTJ: { title: "Comandante", desc: "Decisivo, visionário e orientado a liderança." },
};

const getSafePercentage = (percentages: Partial<Record<MBTILetter, number>>, key: MBTILetter) => {
  const value = percentages[key];
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

export default function MBTIResults({ result, onRestart }: { result: MBTIResult; onRestart: () => void }) {
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [history, setHistory] = useState<StoredResult[]>([]);

  useEffect(() => {
    const load = async () => {
      const userId = getUserId();
      if (!userId) return;
      const [currentPlan, list] = await Promise.all([fetchPlan(userId), fetchHistory(userId)]);
      setPlan(currentPlan);
      setHistory(list.slice(0, 5));
    };
    load().catch(() => undefined);
  }, []);

  const typeInfo = MBTI_TYPES[result.type] || { title: "Perfil não identificado", desc: "Não foi possível identificar o tipo com segurança." };
  const percentages = {
    e: getSafePercentage(result.percentages, "e"),
    i: getSafePercentage(result.percentages, "i"),
    s: getSafePercentage(result.percentages, "s"),
    n: getSafePercentage(result.percentages, "n"),
    t: getSafePercentage(result.percentages, "t"),
    f: getSafePercentage(result.percentages, "f"),
    j: getSafePercentage(result.percentages, "j"),
    p: getSafePercentage(result.percentages, "p"),
  };

  const upgrade = async () => {
    const userId = getUserId();
    if (!userId) return;
    await startCheckout(userId);
    await activatePremiumMock(userId);
    setPlan("premium");
  };

  const downloadPdf = () => {
    if (!result.id) return;
    window.open(`/api/reports/${result.id}/pdf`, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-5xl">
        <Card className="mb-6 border-purple-500/30 bg-slate-900/50 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mb-4 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg"><span className="text-3xl font-bold tracking-tight text-white md:text-5xl">{result.type}</span></div></div>
            <CardTitle className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">{typeInfo.title}</CardTitle>
            <p className="text-lg text-slate-300">{typeInfo.desc}</p>
          </CardHeader>
        </Card>

        <Card className="mb-6 border-purple-500/30 bg-slate-900/50 shadow-2xl backdrop-blur-sm">
          <CardHeader><CardTitle className="text-2xl text-white">Detalhamento do seu perfil</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}><BarChart data={[{ name: "E/I", E: percentages.e, I: percentages.i }, { name: "S/N", S: percentages.s, N: percentages.n }, { name: "T/F", T: percentages.t, F: percentages.f }, { name: "J/P", J: percentages.j, P: percentages.p }]}><CartesianGrid strokeDasharray="3 3" stroke="#475569" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" domain={[0, 100]} /><Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} /><Legend /><Bar dataKey="E" fill="#a855f7" /><Bar dataKey="I" fill="#3b82f6" /><Bar dataKey="S" fill="#f59e0b" /><Bar dataKey="N" fill="#8b5cf6" /><Bar dataKey="T" fill="#06b6d4" /><Bar dataKey="F" fill="#ec4899" /><Bar dataKey="J" fill="#10b981" /><Bar dataKey="P" fill="#f97316" /></BarChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mb-6 border-amber-400/30 bg-amber-500/10"><CardContent className="pt-6"><div className="mb-2 flex items-center gap-2 text-amber-300"><ShieldAlert className="h-4 w-4" /><p className="text-sm font-semibold">Interpretação responsável</p></div><p className="text-sm text-slate-300">Ferramenta de autoconhecimento. Não substitui diagnóstico ou avaliação psicológica profissional.</p></CardContent></Card>

        <Card className="mb-6 border-blue-400/30 bg-blue-500/10"><CardContent className="pt-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-blue-300">Plano atual: {plan.toUpperCase()}</p><p className="text-sm text-slate-300">Premium libera PDF e histórico completo.</p></div>{plan === "free" ? <Button onClick={upgrade}><Lock className="mr-2 h-4 w-4" />Fazer upgrade (mock)</Button> : <Button onClick={downloadPdf}><Download className="mr-2 h-4 w-4" />Baixar PDF</Button>}</div></CardContent></Card>

        <Card className="mb-6 border-purple-500/30 bg-slate-900/50"><CardHeader><CardTitle className="text-lg text-white">Histórico recente</CardTitle></CardHeader><CardContent><div className="space-y-2 text-slate-300">{history.length === 0 ? <p className="text-sm">Sem histórico ainda.</p> : history.map((item) => <p key={item.id} className="text-sm">{new Date(item.createdAt).toLocaleString("pt-BR")} — <strong>{item.type}</strong></p>)}</div></CardContent></Card>

        <LegalDisclaimer surface="results" />

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
