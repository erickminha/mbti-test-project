export interface AnalyticsScriptConfig {
  src: string;
  websiteId: string;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildAnalyticsScriptConfig(endpoint?: string, websiteId?: string): AnalyticsScriptConfig | null {
  if (!endpoint || !websiteId) {
    return null;
  }

  const normalizedEndpoint = endpoint.trim().replace(/\/$/, "");
  const normalizedWebsiteId = websiteId.trim();

  if (!isHttpUrl(normalizedEndpoint) || normalizedWebsiteId.length === 0) {
    return null;
  }

  return {
    src: `${normalizedEndpoint}/umami`,
    websiteId: normalizedWebsiteId,
  };
}

export function injectAnalyticsScript(config: AnalyticsScriptConfig | null): void {
  if (!config) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = config.src;
  script.setAttribute("data-website-id", config.websiteId);
  document.body.appendChild(script);
}
