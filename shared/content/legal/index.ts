export const LEGAL_CONTENT_VERSION = "2026-03-02.2";

export const LEGAL_SURFACES = ["onboarding", "results", "pdf", "payment"] as const;

export type LegalSurface = (typeof LEGAL_SURFACES)[number];

export interface LegalDisclaimerContent {
  title: string;
  surfaceLabel: string;
  intro: string;
  points: readonly string[];
}

export interface LegalPolicy {
  title: string;
  points: readonly string[];
}

export interface MarketingLegalReview {
  title: string;
  avoidClaims: readonly string[];
  guidance: readonly string[];
}

const baseDisclaimer = {
  title: "Aviso importante",
  intro: "Este teste é uma ferramenta de autoconhecimento e desenvolvimento pessoal.",
  points: [
    "Não é um diagnóstico clínico, psiquiátrico ou psicológico.",
    "Não substitui avaliação, orientação ou acompanhamento com psicólogo(a) ou outro profissional de saúde mental.",
  ],
} satisfies Omit<LegalDisclaimerContent, "surfaceLabel">;

export const legalDisclaimersBySurface: Record<LegalSurface, LegalDisclaimerContent> = {
  onboarding: {
    ...baseDisclaimer,
    surfaceLabel: "Onboarding",
  },
  results: {
    ...baseDisclaimer,
    surfaceLabel: "Tela de resultado",
  },
  pdf: {
    ...baseDisclaimer,
    surfaceLabel: "Relatório em PDF",
  },
  payment: {
    ...baseDisclaimer,
    surfaceLabel: "Página de pagamento",
  },
};

export const b2bUsagePolicy: LegalPolicy = {
  title: "Política de uso para empresas (B2B)",
  points: [
    "O uso para recrutamento, seleção, promoção ou desligamento deve ser complementar a outros instrumentos e critérios.",
    "É proibido utilizar este teste como critério único para decisão de contratação, promoção, remuneração ou desligamento.",
    "Recomendamos revisão por RH e equipe jurídica antes de aplicar os resultados em processos corporativos.",
  ],
};

export const marketingLegalReview: MarketingLegalReview = {
  title: "Revisão jurídica de claims de marketing",
  avoidClaims: ["precisão", "científico", "validado"],
  guidance: [
    "Evite promessas absolutas ou linguagem que possa ser interpretada como validação científica formal sem documentação técnica e jurídica.",
    "Prefira linguagem de apoio ao autoconhecimento (ex.: insights, reflexão, tendências comportamentais).",
    "Submeta materiais de campanha e landing pages para revisão jurídica antes da publicação.",
  ],
};

export interface LegalApiPayload {
  version: string;
  reviewedAt: string;
  reviewedBy: string;
  disclaimersBySurface: Record<LegalSurface, LegalDisclaimerContent>;
  b2bUsagePolicy: LegalPolicy;
  marketingLegalReview: MarketingLegalReview;
}

export const legalApiPayload: LegalApiPayload = {
  version: LEGAL_CONTENT_VERSION,
  reviewedAt: "2026-03-02",
  reviewedBy: "Equipe Jurídica + Produto",
  disclaimersBySurface: legalDisclaimersBySurface,
  b2bUsagePolicy,
  marketingLegalReview,
};

export function getLegalDisclaimer(surface: LegalSurface): LegalDisclaimerContent {
  return legalDisclaimersBySurface[surface];
}
