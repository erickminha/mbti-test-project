export type OfferVariant = "single_price" | "anchor" | "bundle";

export type FunnelEventName =
  | "landing_view"
  | "test_started"
  | "test_completed"
  | "checkout_started"
  | "payment_approved"
  | "post_purchase_feedback"
  | "refund_requested";

export interface FunnelEvent {
  id: string;
  event: FunnelEventName;
  variant: OfferVariant;
  sessionId: string;
  timestamp: number;
  amount?: number;
  satisfactionScore?: number;
}

const SESSION_KEY = "mbti_session_id";
const VARIANT_KEY = "mbti_offer_variant";
const EVENTS_KEY = "mbti_funnel_events";

const variants: OfferVariant[] = ["single_price", "anchor", "bundle"];

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const sessionId = generateId("session");
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function getOrAssignVariant(): OfferVariant {
  const existing = localStorage.getItem(VARIANT_KEY) as OfferVariant | null;
  if (existing && variants.includes(existing)) return existing;
  const randomIndex = Math.floor(Math.random() * variants.length);
  const selected = variants[randomIndex];
  localStorage.setItem(VARIANT_KEY, selected);
  return selected;
}

export function readEvents(): FunnelEvent[] {
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FunnelEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistEvents(events: FunnelEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function trackEvent(
  event: FunnelEventName,
  data: Partial<Pick<FunnelEvent, "amount" | "satisfactionScore">> = {},
) {
  const events = readEvents();
  const payload: FunnelEvent = {
    id: generateId(event),
    event,
    sessionId: getOrCreateSessionId(),
    variant: getOrAssignVariant(),
    timestamp: Date.now(),
    ...data,
  };

  events.push(payload);
  persistEvents(events);
}

export interface VariantMetrics {
  variant: OfferVariant;
  sessions: number;
  payments: number;
  conversionRate: number;
  rpv: number;
  refundRate: number;
  avgSatisfaction: number;
}

export interface ExperimentSummary {
  minimumSampleReached: boolean;
  samplePerVariant: number;
  windowDays: number;
  byVariant: VariantMetrics[];
  bestVariant: OfferVariant | null;
}

export function buildExperimentSummary(minSample = 100, windowDays = 14): ExperimentSummary {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const inWindow = readEvents().filter((event) => event.timestamp >= cutoff);

  const byVariant = variants.map((variant) => {
    const scoped = inWindow.filter((event) => event.variant === variant);
    const sessions = new Set(scoped.filter((event) => event.event === "landing_view").map((event) => event.sessionId)).size;
    const payments = scoped.filter((event) => event.event === "payment_approved");
    const refunds = scoped.filter((event) => event.event === "refund_requested").length;
    const feedback = scoped.filter((event) => event.event === "post_purchase_feedback" && typeof event.satisfactionScore === "number");

    const gross = payments.reduce((sum, event) => sum + (event.amount || 0), 0);

    return {
      variant,
      sessions,
      payments: payments.length,
      conversionRate: sessions > 0 ? (payments.length / sessions) * 100 : 0,
      rpv: sessions > 0 ? gross / sessions : 0,
      refundRate: payments.length > 0 ? (refunds / payments.length) * 100 : 0,
      avgSatisfaction:
        feedback.length > 0
          ? feedback.reduce((sum, event) => sum + (event.satisfactionScore || 0), 0) / feedback.length
          : 0,
    };
  });

  const minimumSampleReached = byVariant.every((item) => item.sessions >= minSample);

  const bestVariant = [...byVariant]
    .sort((a, b) => {
      if (b.rpv !== a.rpv) return b.rpv - a.rpv;
      return b.conversionRate - a.conversionRate;
    })
    .at(0)?.variant;

  return {
    minimumSampleReached,
    samplePerVariant: minSample,
    windowDays,
    byVariant,
    bestVariant: bestVariant ?? null,
  };
}
