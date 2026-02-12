export type TermsV2Section = {
  id: string;
  title: string;
  summary: string;
  paragraphs?: string[];
  bullets?: string[];
};

export const termsV2LastUpdatedIso = "2026-02-12T00:00:00Z";

export const termsV2Sections: readonly TermsV2Section[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    summary: "Using DemumuMind MCP means you agree to these Terms.",
    paragraphs: [
      "These Terms of Service form a binding agreement between you and DemumuMind. If you do not agree, do not use the service.",
      "If you use the platform on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility and Legal Capacity",
    summary: "You must be legally able to enter into this agreement.",
    bullets: [
      "You must have legal capacity to accept these Terms in your jurisdiction.",
      "You may not use the service if you are prohibited by applicable law.",
      "You are responsible for ensuring your use is lawful in your location.",
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts and Access",
    summary: "You are responsible for account security and activity.",
    bullets: [
      "You must provide accurate account information and keep it current.",
      "You are responsible for safeguarding your credentials and access tokens.",
      "You must notify us promptly if you suspect unauthorized access.",
      "You remain responsible for activity performed through your account.",
    ],
  },
  {
    id: "service-scope",
    title: "4. Service Scope and Availability",
    summary: "We provide MCP catalog and workflow tools on an as-available basis.",
    paragraphs: [
      "DemumuMind MCP helps users discover, evaluate, and submit MCP servers and related operational information.",
      "Service capabilities may change over time. We may update, suspend, or discontinue features when needed for reliability, security, or product direction.",
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use",
    summary: "Do not abuse, disrupt, or misuse the platform.",
    bullets: [
      "No illegal conduct, fraud, or rights violations.",
      "No malware, exploit payloads, credential theft, or service disruption attempts.",
      "No scraping or automated behavior that bypasses technical controls.",
      "No impersonation or false representation of ownership, affiliation, or trust signals.",
    ],
  },
  {
    id: "submissions",
    title: "6. User Content and Server Submissions",
    summary: "You keep ownership of content, and grant us rights to operate the service.",
    paragraphs: [
      "You retain ownership of content you submit. You grant DemumuMind a non-exclusive, worldwide, royalty-free license to host, process, moderate, display, and distribute submitted content solely for operating and improving the service.",
      "You represent that you have the necessary rights to submit all provided data, links, and materials.",
    ],
    bullets: [
      "We may review, reject, delist, or remove submissions that violate policy or create platform risk.",
      "Moderation decisions may include temporary holds while we verify authenticity and safety signals.",
    ],
  },
  {
    id: "third-party",
    title: "7. Third-Party Services",
    summary: "Some features depend on third-party providers.",
    paragraphs: [
      "The platform may integrate with third-party services such as hosting, authentication, analytics, payment, or communication providers.",
      "Your use of third-party services is governed by those providers' own terms and policies.",
    ],
  },
  {
    id: "fees",
    title: "8. Fees, Billing, and Taxes",
    summary: "Paid features, if enabled, are presented before purchase.",
    bullets: [
      "Any paid tier, subscription, or add-on will show pricing terms before checkout.",
      "You are responsible for applicable taxes unless stated otherwise.",
      "Failure to pay may result in feature restrictions or suspension.",
    ],
  },
  {
    id: "termination",
    title: "9. Suspension and Termination",
    summary: "We may suspend access for violations or risk.",
    paragraphs: [
      "We may suspend or terminate access if we reasonably believe your use violates these Terms, threatens service integrity, or introduces security, legal, or operational risk.",
      "You may stop using the service at any time.",
    ],
  },
  {
    id: "disclaimers",
    title: "10. Disclaimers",
    summary: "The service is provided without broad warranties.",
    paragraphs: [
      "DemumuMind MCP is provided on an 'as is' and 'as available' basis, to the maximum extent permitted by law.",
      "We do not guarantee uninterrupted availability, error-free operation, or suitability for a specific purpose.",
    ],
  },
  {
    id: "liability",
    title: "11. Limitation of Liability",
    summary: "Liability is limited to the extent allowed by law.",
    paragraphs: [
      "To the maximum extent permitted by applicable law, DemumuMind and its affiliates will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages.",
      "Where liability cannot be excluded, it is limited to the amount you paid for the service in the twelve months preceding the event giving rise to the claim.",
    ],
  },
  {
    id: "indemnity",
    title: "12. Indemnification",
    summary: "You agree to cover claims caused by your misuse or violations.",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless DemumuMind and its affiliates from claims, losses, and expenses arising from your content, your misuse of the service, or your violation of these Terms.",
    ],
  },
  {
    id: "governing-law",
    title: "13. Governing Law and Venue",
    summary: "These Terms follow U.S. law (Delaware), with venue in Delaware.",
    paragraphs: [
      "These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-laws principles.",
      "You agree that courts located in Delaware, U.S.A., have exclusive jurisdiction over disputes arising from or related to these Terms, unless applicable law requires otherwise.",
    ],
  },
  {
    id: "changes-contact",
    title: "14. Changes to Terms and Contact",
    summary: "We may update these Terms and publish an updated date.",
    paragraphs: [
      "We may modify these Terms from time to time. Material changes become effective when posted, unless a later effective date is stated.",
      "Continued use after an update means you accept the revised Terms.",
    ],
  },
];
