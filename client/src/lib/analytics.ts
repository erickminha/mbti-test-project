const ANALYTICS_SCRIPT_ID = "umami-analytics-script";

const normalizeEndpoint = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("%VITE_ANALYTICS_ENDPOINT%")) {
    return null;
  }

  return trimmed.replace(/\/$/, "");
};

const normalizeWebsiteId = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("%VITE_ANALYTICS_WEBSITE_ID%")) {
    return null;
  }

  return trimmed;
};

export const initAnalytics = () => {
  if (typeof document === "undefined") {
    return;
  }

  const endpoint = normalizeEndpoint(import.meta.env.VITE_ANALYTICS_ENDPOINT);
  const websiteId = normalizeWebsiteId(import.meta.env.VITE_ANALYTICS_WEBSITE_ID);

  if (!endpoint || !websiteId) {
    if (import.meta.env.DEV) {
      console.info("[analytics] Umami desativado: variáveis de ambiente ausentes.");
    }
    return;
  }

  if (document.getElementById(ANALYTICS_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = ANALYTICS_SCRIPT_ID;
  script.defer = true;
  script.src = `${endpoint}/umami`;
  script.setAttribute("data-website-id", websiteId);
  document.body.appendChild(script);
};
