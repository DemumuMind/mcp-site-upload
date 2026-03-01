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
