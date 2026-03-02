import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  b2bUsagePolicy,
  getLegalDisclaimer,
  type LegalSurface,
} from "@shared/content/legal";

interface LegalDisclaimerProps {
  surface: LegalSurface;
}

export default function LegalDisclaimer({ surface }: LegalDisclaimerProps) {
  const content = getLegalDisclaimer(surface);

  return (
    <Card className="border-amber-500/30 bg-amber-500/10 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber-200 text-lg">
          {content.title} • {content.surfaceLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-amber-50/90">
        <p>{content.intro}</p>
        <ul className="list-disc pl-5 space-y-1">
          {content.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="pt-2 border-t border-amber-400/30">
          <p className="font-semibold mb-1">{b2bUsagePolicy.title}</p>
          <ul className="list-disc pl-5 space-y-1">
            {b2bUsagePolicy.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
