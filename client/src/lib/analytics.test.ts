import { describe, expect, it } from "vitest";
import { buildAnalyticsScriptConfig } from "./analytics";

describe("buildAnalyticsScriptConfig", () => {
  it("returns null when env is missing", () => {
    expect(buildAnalyticsScriptConfig(undefined, "abc")).toBeNull();
    expect(buildAnalyticsScriptConfig("https://analytics.example.com", undefined)).toBeNull();
  });

  it("returns null for non-http endpoint", () => {
    expect(buildAnalyticsScriptConfig("javascript:alert(1)", "id")).toBeNull();
  });

  it("normalizes endpoint and returns config when valid", () => {
    expect(buildAnalyticsScriptConfig("https://analytics.example.com/", "site-id")).toEqual({
      src: "https://analytics.example.com/umami",
      websiteId: "site-id",
    });
  });
});
