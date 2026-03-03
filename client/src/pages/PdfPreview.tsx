import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";

export default function PdfPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Pré-visualização do PDF</CardTitle>
            <CardDescription className="text-slate-300">
              Esta página representa o conteúdo legal que também deve acompanhar o relatório exportado.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm">
            No pipeline de geração de PDF, reutilize os textos versionados em <code>shared/content/legal</code>.
          </CardContent>
        </Card>

        <LegalDisclaimer surface="pdf" />
      </div>
    </div>
  );
}
