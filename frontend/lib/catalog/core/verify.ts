import type { VerificationLevel } from "@/lib/types";
import { buildTrustScore } from "./score.ts";
import type { NormalizedCandidate, VerificationResult } from "./types.ts";

type VerifyInput = {
  candidate: NormalizedCandidate;
  corroboratingSources: string[];
};

function toVerificationLevel(trustScore: number): VerificationLevel {
  if (trustScore >= 80) {
    return "official";
  }
  if (trustScore >= 60) {
    return "partner";
  }
  return "community";
}

function hasStrongIdentityAnchor(candidate: NormalizedCandidate): boolean {
  return Boolean(
    candidate.identity.repoUrlNormalized ||
      (candidate.identity.packageType && candidate.identity.packageName) ||
      candidate.identity.homepageUrlNormalized ||
      candidate.identity.serverUrlNormalized,
  );
}

export function verifyCatalogCandidate(input: VerifyInput): VerificationResult {
  const riskyFlags = input.candidate.verificationHints.riskyFlags.map((flag) => flag.toLowerCase());
  if (riskyFlags.some((flag) => flag.includes("test") || flag.includes("staging") || flag.includes("archived"))) {
    return {
      decision: "reject",
      trustScore: 0,
      verificationLevel: "community",
      reasons: [`rejected due to risky flags: ${riskyFlags.join(", ")}`],
      signals: {
        riskyFlags,
      },
    };
  }

  const { trustScore, reasons } = buildTrustScore(input.candidate.verificationHints, input.corroboratingSources);
  const strongIdentityAnchor = hasStrongIdentityAnchor(input.candidate);
  const providerVerified = Boolean(
    input.candidate.verificationHints.providerVerified || input.candidate.verificationHints.smitheryVerified,
  );
  const corroborated = input.corroboratingSources.length >= 2;

  let decision: VerificationResult["decision"] = "quarantine";
  if (strongIdentityAnchor && (corroborated || providerVerified) && trustScore >= 60) {
    decision = "publish";
  } else if (!strongIdentityAnchor && trustScore < 35) {
    decision = "reject";
  }

  return {
    decision,
    trustScore,
    verificationLevel: toVerificationLevel(trustScore),
    reasons,
    signals: {
      corroboratingSources: input.corroboratingSources,
      strongIdentityAnchor,
      providerVerified,
      repoMatch: input.candidate.verificationHints.repoMatch,
      packageExists: input.candidate.verificationHints.packageExists,
      trustedPublishing: input.candidate.verificationHints.trustedPublishing,
      provenance: input.candidate.verificationHints.provenance,
    },
  };
}
