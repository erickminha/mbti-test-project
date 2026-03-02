import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { buildAnalyticsScriptConfig, injectAnalyticsScript } from "./lib/analytics";

const analyticsConfig = buildAnalyticsScriptConfig(
  import.meta.env.VITE_ANALYTICS_ENDPOINT,
  import.meta.env.VITE_ANALYTICS_WEBSITE_ID,
);

injectAnalyticsScript(analyticsConfig);

createRoot(document.getElementById("root")!).render(<App />);
