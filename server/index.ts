import { legalApiPayload } from "../shared/content/legal";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { buildDynamicInsights, getTypeStaticContent } from "./contentProfiles";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createSimplePdfBuffer = (title: string, content: string) => {
  const safe = `${title}\n\n${content}`.replace(/[()]/g, "");
  const stream = `BT /F1 12 Tf 50 760 Td (${safe}) Tj ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf-8");
};

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

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("/api/legal-content", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=300");
    res.json(legalApiPayload);
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
