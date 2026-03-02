export interface StaticTypeContent {
  type: string;
  version: string;
  reviewDate: string;
  changelog: string[];
  sourceFile: string;
  review: {
    aiDraft: string;
    humanReviewer: string;
    status: "approved_human";
  };
  resumo: string;
  forcas: string[];
  riscos: string[];
  carreira: string;
  relacionamentos: string;
  desenvolvimento: string;
}

const BASE_PROFILES: Record<string, { titulo: string; resumo: string }> = {
  ISTJ: { titulo: "Logista", resumo: "Você tende a valorizar previsibilidade, responsabilidade e execução consistente." },
  ISFJ: { titulo: "Defensor(a)", resumo: "Você costuma combinar cuidado com pessoas e atenção aos detalhes práticos." },
  INFJ: { titulo: "Advogado(a)", resumo: "Você tende a unir propósito, empatia e visão de longo prazo em suas decisões." },
  INTJ: { titulo: "Arquiteto(a)", resumo: "Você costuma organizar ideias complexas com foco em estratégia e melhoria contínua." },
  ISTP: { titulo: "Virtuoso(a)", resumo: "Você tende a aprender fazendo, resolver problemas e agir com pragmatismo." },
  ISFP: { titulo: "Aventureiro(a)", resumo: "Você costuma expressar autenticidade, sensibilidade e flexibilidade no dia a dia." },
  INFP: { titulo: "Mediador(a)", resumo: "Você tende a agir guiado(a) por valores, criatividade e busca de sentido." },
  INTP: { titulo: "Lógico(a)", resumo: "Você costuma priorizar análise, curiosidade intelectual e autonomia para pensar." },
  ESTP: { titulo: "Empreendedor(a)", resumo: "Você tende a responder rápido a oportunidades e a agir com energia prática." },
  ESFP: { titulo: "Animador(a)", resumo: "Você costuma engajar pessoas com entusiasmo, presença e foco na experiência." },
  ENFP: { titulo: "Ativista", resumo: "Você tende a conectar pessoas e ideias com criatividade e otimismo." },
  ENTP: { titulo: "Debatedor(a)", resumo: "Você costuma explorar possibilidades, questionar premissas e propor caminhos novos." },
  ESTJ: { titulo: "Executivo(a)", resumo: "Você tende a estruturar processos e mobilizar pessoas para resultados claros." },
  ESFJ: { titulo: "Cônsul", resumo: "Você costuma promover cooperação com cuidado, organização e senso de comunidade." },
  ENFJ: { titulo: "Protagonista", resumo: "Você tende a inspirar pessoas com empatia, direção e comunicação clara." },
  ENTJ: { titulo: "Comandante", resumo: "Você costuma liderar com visão estratégica, foco e decisão." },
};

function buildProfile(type: string, resumoBase: string, titulo: string): StaticTypeContent {
  return {
    type,
    version: "v1",
    reviewDate: "2026-03-02",
    changelog: ["v1: primeira versão estruturada por seção fixa."],
    sourceFile: `content/types/${type}.v1.md`,
    review: {
      aiDraft: "Rascunho inicial gerado por IA e ajustado para guia editorial PT-BR.",
      humanReviewer: "Time Editorial",
      status: "approved_human",
    },
    resumo: `${resumoBase} Este texto segue um formato padronizado para web e PDF.`,
    forcas: [
      "Consegue manter consistência quando há metas claras.",
      "Transforma preferências pessoais em rotinas produtivas.",
      "Contribui com clareza de expectativas em grupo.",
    ],
    riscos: [
      "Pode insistir em uma abordagem por tempo demais.",
      "Pode subestimar sinais de cansaço emocional.",
      "Pode ter dificuldade para priorizar pausas e ajustes de rota.",
    ],
    carreira: `${titulo} tende a render melhor em contextos com escopo bem definido, autonomia proporcional e critérios transparentes de qualidade.`,
    relacionamentos: "A comunicação costuma funcionar melhor quando combina acolhimento, escuta ativa e acordos explícitos sobre expectativas.",
    desenvolvimento: "Para evoluir, vale alternar metas de curto prazo com revisão mensal de hábitos, celebrando avanços e ajustando pontos de atrito.",
  };
}

export const STATIC_TYPE_CONTENT: Record<string, StaticTypeContent> = Object.fromEntries(
  Object.entries(BASE_PROFILES).map(([type, profile]) => [type, buildProfile(type, profile.resumo, profile.titulo)]),
);

export function getTypeStaticContent(type: string): StaticTypeContent | null {
  return STATIC_TYPE_CONTENT[type.toUpperCase()] ?? null;
}

export function buildDynamicInsights(percentages: Record<string, number>) {
  const extroversion = percentages.e >= percentages.i ? "Extroversão" : "Introversão";
  const percepcao = percentages.s >= percentages.n ? "Sensação" : "Intuição";
  const decisao = percentages.t >= percentages.f ? "Pensamento" : "Sentimento";
  const estilo = percentages.j >= percentages.p ? "Julgamento" : "Percepção";

  return {
    focoAtual: `Seu resultado mostra maior preferência por ${extroversion} e ${percepcao}, sugerindo energia em contextos alinhados a esse eixo.`,
    tomadaDecisao: `No eixo de decisão, ${decisao} aparece com mais força neste momento; use isso como referência, não como limite fixo.`,
    ritmo: `Seu estilo atual favorece ${estilo}. Em períodos de pressão, vale equilibrar planejamento e adaptação para manter desempenho sustentável.`,
  };
}
