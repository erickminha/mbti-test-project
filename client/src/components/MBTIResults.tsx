import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";

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

interface MBTIResultsProps {
  result: {
    type: string;
    scores: Record<string, number>;
    percentages: Record<string, number>;
  };
  onRestart: () => void;
}

export default function MBTIResults({ result, onRestart }: MBTIResultsProps) {
  const typeInfo = MBTI_TYPES[result.type] || { title: "Unknown", desc: "Unknown type" };
  
  const chartData = [
    { name: "E/I", E: result.percentages.e, I: result.percentages.i },
    { name: "S/N", S: result.percentages.s, N: result.percentages.n },
    { name: "T/F", T: result.percentages.t, F: result.percentages.f },
    { name: "J/P", J: result.percentages.j, P: result.percentages.p },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-4xl">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-purple-500/30 bg-slate-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Extroversion</p>
                <p className="text-3xl font-bold text-purple-400">{result.percentages.e}%</p>
                <p className="text-xs text-slate-500 mt-2">E vs I</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-slate-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Sensing</p>
                <p className="text-3xl font-bold text-orange-400">{result.percentages.s}%</p>
                <p className="text-xs text-slate-500 mt-2">S vs N</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-slate-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Thinking</p>
                <p className="text-3xl font-bold text-cyan-400">{result.percentages.t}%</p>
                <p className="text-xs text-slate-500 mt-2">T vs F</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-slate-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Judging</p>
                <p className="text-3xl font-bold text-green-400">{result.percentages.j}%</p>
                <p className="text-xs text-slate-500 mt-2">J vs P</p>
              </div>
            </CardContent>
          </Card>
        </div>

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
