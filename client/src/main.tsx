import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { buildAnalyticsScriptConfig, injectAnalyticsScript } from "./lib/analytics";

const analyticsConfig = buildAnalyticsScriptConfig(
  import.meta.env.VITE_ANALYTICS_ENDPOINT,
  import.meta.env.VITE_ANALYTICS_WEBSITE_ID,
);

injectAnalyticsScript(analyticsConfig);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento #root não encontrado. Verifique o client/index.html.");
}

initAnalytics();
createRoot(rootElement).render(<App />);
