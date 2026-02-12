import type { Locale } from "@/lib/i18n";
export type LocalizedText = {
    en: string;
};
export type LegalSection = {
    id: string;
    title: LocalizedText;
    paragraph?: LocalizedText;
    bullets?: LocalizedText[];
};
export const legalEmail = "demumumind@gmail.com";
export const legalGmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(legalEmail)}`;
const legalLastUpdatedIso = "2026-02-08T14:17:00Z";
const enMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;
function pad2(value: number): string {
    return String(value).padStart(2, "0");
}
export function getLegalLastUpdatedValue(locale: Locale): string {
    void locale;
    const timestamp = new Date(legalLastUpdatedIso);
    const day = timestamp.getUTCDate();
    const month = timestamp.getUTCMonth() + 1;
    const year = timestamp.getUTCFullYear();
    const wordsEn = `${enMonths[month - 1]} ${day}, ${year}`;
    const usNumeric = `${pad2(month)}/${pad2(day)}/${year}`;
    return `${usNumeric} (${wordsEn})`;
}
export const privacySections: LegalSection[] = [
    {
        id: "scope",
        title: {
            en: "1. Scope",
        },
        paragraph: {
            en: "This Privacy Policy explains how DemumuMind handles information when you use our website, sign in, and submit MCP servers.",
        },
    },
    {
        id: "collect",
        title: {
            en: "2. Information We Collect",
        },
        bullets: [
            {
                en: "Account data: name, email, and authentication details.",
            },
            {
                en: "Usage and device data: pages viewed, approximate location, device/browser details, and cookies.",
            },
            {
                en: "Submission data: descriptions and other text you provide in forms and tools.",
            },
            {
                en: "Payment metadata (if paid features are enabled): handled by payment providers, without full card data.",
            },
            {
                en: "Communications: support requests and feedback.",
            },
        ],
    },
    {
        id: "use",
        title: {
            en: "3. How We Use Information",
        },
        bullets: [
            {
                en: "Provide and improve the catalog, moderation, and MCP workflows.",
            },
            {
                en: "Process authentication, submissions, and optional billing operations.",
            },
            {
                en: "Prevent abuse, fraud, and security incidents.",
            },
            {
                en: "Analyze aggregated usage metrics to improve product quality.",
            },
        ],
    },
    {
        id: "sharing",
        title: {
            en: "4. Data Sharing",
        },
        paragraph: {
            en: "We do not sell personal data. We share limited data with service providers (for example hosting, auth, analytics, and payment providers) under contractual protections.",
        },
    },
    {
        id: "cookies",
        title: {
            en: "5. Cookies and Analytics",
        },
        paragraph: {
            en: "We use cookies and analytics to operate and improve the service, including locale and theme preferences.",
        },
    },
    {
        id: "retention",
        title: {
            en: "6. Retention",
        },
        bullets: [
            {
                en: "Account data is retained while the account is active and for a limited period after verified deletion requests.",
            },
            {
                en: "Submission and moderation records can be retained for anti-fraud and dispute handling.",
            },
            {
                en: "Operational and security logs are retained for a limited period unless longer retention is legally required.",
            },
        ],
    },
    {
        id: "rights",
        title: {
            en: "7. Your Rights",
        },
        paragraph: {
            en: "Depending on your location, you may have rights to access, correct, delete, or export your data and to object to certain processing.",
        },
    },
    {
        id: "security",
        title: {
            en: "8. Security",
        },
        paragraph: {
            en: "We apply reasonable technical and organizational safeguards to protect information.",
        },
    },
];
export const termsSections: LegalSection[] = [
    {
        id: "acceptance",
        title: {
            en: "1. Acceptance of Terms",
        },
        paragraph: {
            en: "By using DemumuMind MCP, you agree to these Terms of Service.",
        },
    },
    {
        id: "eligibility",
        title: {
            en: "2. Eligibility and Account",
        },
        bullets: [
            {
                en: "You must have legal capacity to accept these terms.",
            },
            {
                en: "You are responsible for your account credentials and security.",
            },
        ],
    },
    {
        id: "service",
        title: {
            en: "3. Service Description",
        },
        paragraph: {
            en: "DemumuMind MCP provides catalog and workflow tools for discovering and managing MCP integrations.",
        },
    },
    {
        id: "aup",
        title: {
            en: "4. Acceptable Use",
        },
        bullets: [
            {
                en: "No illegal activity, fraud, or rights violations.",
            },
            {
                en: "No malware, exploit payloads, or deliberate service disruption.",
            },
            {
                en: "No unauthorized access attempts or bypass of technical protections.",
            },
        ],
    },
    {
        id: "content",
        title: {
            en: "5. User Submissions",
        },
        bullets: [
            {
                en: "You retain ownership of your content.",
            },
            {
                en: "You grant us a non-exclusive license to host and moderate submitted content for service operation.",
            },
        ],
    },
    {
        id: "third-party",
        title: {
            en: "6. Third-Party Services",
        },
        paragraph: {
            en: "Some functionality depends on third-party providers governed by their own policies.",
        },
    },
    {
        id: "fees",
        title: {
            en: "7. Fees and Billing",
        },
        paragraph: {
            en: "If paid features are enabled, pricing and billing terms are shown before purchase.",
        },
    },
    {
        id: "ip",
        title: {
            en: "8. Intellectual Property",
        },
        paragraph: {
            en: "The platform, brand, and software are protected by intellectual property laws.",
        },
    },
    {
        id: "liability",
        title: {
            en: "9. Disclaimer and Limitation of Liability",
        },
        bullets: [
            {
                en: "The service is provided as-is and as-available.",
            },
            {
                en: "To the extent permitted by law, we are not liable for indirect or consequential damages.",
            },
        ],
    },
    {
        id: "termination",
        title: {
            en: "10. Suspension and Termination",
        },
        paragraph: {
            en: "We may suspend access for violations, abuse, or security risks.",
        },
    },
    {
        id: "changes",
        title: {
            en: "11. Changes to Terms",
        },
        paragraph: {
            en: "We may update these Terms and publish changes with an updated date.",
        },
    },
];
