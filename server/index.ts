import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { buildDynamicInsights, getTypeStaticContent } from "./contentProfiles";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());

  app.get("/api/types/:type", (req, res) => {
    const profile = getTypeStaticContent(req.params.type);

    if (!profile) {
      return res.status(404).json({ error: "Tipo MBTI não encontrado." });
    }

    return res.json(profile);
  });

  app.post("/api/insights", (req, res) => {
    const { type, percentages } = req.body ?? {};
    const profile = getTypeStaticContent(type ?? "");

    if (!profile) {
      return res.status(404).json({ error: "Tipo MBTI não encontrado." });
    }

    if (!percentages || typeof percentages !== "object") {
      return res.status(400).json({ error: "Percentuais inválidos para geração de insights." });
    }

    return res.json({
      staticContent: profile,
      dynamicInsights: buildDynamicInsights(percentages),
    });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
