import type { CandidateVerificationHints } from "./types.ts";

export function buildTrustScore(
  hints: CandidateVerificationHints,
  corroboratingSources: string[],
): { trustScore: number; reasons: string[] } {
  let trustScore = 0;
  const reasons: string[] = [];

  if (hints.repoMatch) {
    trustScore += 25;
    reasons.push("repo match");
  }
  if (hints.packageExists) {
    trustScore += 15;
    reasons.push("package exists");
  }
  if (corroboratingSources.length >= 2) {
    trustScore += 20;
    reasons.push(`corroborated by ${corroboratingSources.length} sources`);
  }
  if (hints.providerVerified || hints.smitheryVerified) {
    trustScore += 10;
    reasons.push("provider verified");
  }
  if (hints.registryCorroborated) {
    trustScore += 5;
    reasons.push("registry corroborated");
  }
  if (hints.trustedPublishing) {
    trustScore += 10;
    reasons.push("trusted publishing");
  }
  if (hints.provenance) {
    trustScore += 10;
    reasons.push("provenance");
  }
  if (hints.readmePresent) {
    trustScore += 3;
    reasons.push("README present");
  }
  if (hints.docsPresent) {
    trustScore += 2;
    reasons.push("docs present");
  }
  if (hints.healthStatus === "healthy") {
    trustScore += 5;
    reasons.push("healthy endpoint");
  } else if (hints.healthStatus === "down") {
    trustScore -= 10;
    reasons.push("health probe down");
  }

  return {
    trustScore: Math.max(0, Math.min(100, trustScore)),
    reasons,
  };
}
