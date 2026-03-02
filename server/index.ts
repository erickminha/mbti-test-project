import { legalApiPayload } from "../shared/content/legal";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { MBTI_QUESTIONS } from "./data/questions";
import { activatePremium, createGuestUser, getHistory, getPlan, getResultById, saveResult } from "./lib/store";
import { isSupabaseConfigured } from "./lib/supabase";

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
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true, supabase: isSupabaseConfigured }));

  app.post("/api/auth/guest", async (_req, res) => {
    res.json(await createGuestUser());
  });

  app.get("/api/questions", (_req, res) => {
    res.json({ total: MBTI_QUESTIONS.length, items: MBTI_QUESTIONS });
  });

  app.get("/api/subscription/status/:userId", async (req, res) => {
    res.json({ userId: req.params.userId, plan: await getPlan(req.params.userId) });
  });

  app.post("/api/payments/checkout", (req, res) => {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: "userId é obrigatório" });
    res.json({
      checkoutUrl: `/checkout/mock?userId=${encodeURIComponent(userId)}`,
      message: "Integre aqui Stripe/Mercado Pago no ambiente de produção.",
    });
  });

  app.post("/api/payments/mock/confirm", async (req, res) => {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: "userId é obrigatório" });
    res.json(await activatePremium(userId));
  });

  app.post("/api/results", async (req, res) => {
    const { userId, type, scores, percentages } = req.body || {};
    if (!userId || !type || !scores || !percentages) {
      return res.status(400).json({ message: "Payload inválido para salvar resultado" });
    }
    const row = await saveResult({ userId, type, scores, percentages });
    res.status(201).json(row);
  });

  app.get("/api/results/:userId", async (req, res) => {
    res.json({ items: await getHistory(req.params.userId) });
  });

  app.get("/api/reports/:resultId/pdf", async (req, res) => {
    const result = await getResultById(req.params.resultId);
    if (!result) return res.status(404).json({ message: "Resultado não encontrado" });

    const plan = await getPlan(result.userId);
    if (plan !== "premium") {
      return res.status(402).json({ message: "Recurso premium. Faça upgrade para baixar PDF." });
    }

    const content = `Tipo ${result.type} | E:${result.percentages.e}% I:${result.percentages.i}% S:${result.percentages.s}% N:${result.percentages.n}% T:${result.percentages.t}% F:${result.percentages.f}% J:${result.percentages.j}% P:${result.percentages.p}%`;
    const pdf = createSimplePdfBuffer("Relatório MBTI", content);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=mbti-${result.id}.pdf`);
    res.send(pdf);
  });

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
