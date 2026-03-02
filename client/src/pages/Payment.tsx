import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";

export default function Payment() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Pagamento</CardTitle>
            <CardDescription className="text-slate-300">
              Finalize sua compra com segurança para acessar o relatório completo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm">
            Esta é uma superfície de checkout para demonstrar a aplicação consistente dos textos legais.
          </CardContent>
        </Card>

        <LegalDisclaimer surface="payment" />
      </div>
    </div>
  );
}
