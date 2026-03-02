import { describe, expect, it } from "vitest";
import {
  LEGAL_SURFACES,
  b2bUsagePolicy,
  getLegalDisclaimer,
  legalApiPayload,
  marketingLegalReview,
} from "./index";

describe("legal content", () => {
  it("keeps all required legal surfaces available", () => {
    LEGAL_SURFACES.forEach((surface) => {
      const content = getLegalDisclaimer(surface);
      expect(content.title).toBe("Aviso importante");
      expect(content.points.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("enforces B2B prohibition and risky claims list", () => {
    expect(b2bUsagePolicy.points.join(" ")).toContain("critério único");
    expect(marketingLegalReview.avoidClaims).toEqual(
      expect.arrayContaining(["precisão", "científico", "validado"]),
    );
  });

  it("exposes metadata in API payload", () => {
    expect(legalApiPayload.version).toBeTruthy();
    expect(legalApiPayload.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(legalApiPayload.reviewedBy.length).toBeGreaterThan(0);
  });
});
