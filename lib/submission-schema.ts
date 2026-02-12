import { z } from "zod";
import type { Locale } from "@/lib/i18n";
export type SubmissionInput = {
    name: string;
    serverUrl: string;
    category: string;
    authType: "oauth" | "api_key" | "none";
    description: string;
    maintainerName: string;
    maintainerEmail: string;
    repoUrl?: string;
};
function isHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    catch {
        return false;
    }
}
function getHttpUrlSchema(errorMessage: string) {
    return z.string().trim().url(errorMessage).refine(isHttpUrl, errorMessage);
}
export function getSubmissionSchema(locale: Locale) {
    void locale;
    return z.object({
        name: z.string().trim().min(2, "Name is required"),
        serverUrl: getHttpUrlSchema("Enter a valid URL (http/https)"),
        category: z.string().trim().min(2, "Category is required"),
        authType: z.enum(["oauth", "api_key", "none"], {
            error: "Choose an authentication type",
        }),
        description: z.string().trim().min(20, "Description must be at least 20 characters"),
        maintainerName: z.string().trim().min(2, "Maintainer name is required"),
        maintainerEmail: z.email("Enter a valid email"),
        repoUrl: z
            .union([getHttpUrlSchema("Enter a valid repository URL (http/https)"), z.literal("")])
            .optional()
            .default(""),
    });
}
