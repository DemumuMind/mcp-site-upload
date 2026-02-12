import { z } from "zod";
import { tr, type Locale } from "@/lib/i18n";
export const ACCOUNT_PASSWORD_MIN_LENGTH = 8;
export type AccountProfileInput = {
    fullName: string;
    username: string;
    avatarUrl: string;
    website: string;
    bio: string;
};
export type AccountPasswordInput = {
    newPassword: string;
    confirmPassword: string;
};
function isValidHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    }
    catch {
        return false;
    }
}
export function getAccountProfileSchema(locale: Locale) {
    return z.object({
        fullName: z
            .string()
            .trim()
            .max(80, tr(locale, "Name must be at most 80 characters.", "Name must be at most 80 characters.")),
        username: z
            .string()
            .trim()
            .max(32, tr(locale, "Username must be at most 32 characters.", "Username must be at most 32 characters."))
            .refine((value) => value.length === 0 || /^[a-zA-Z0-9_.-]+$/.test(value), tr(locale, "Username can contain only letters, numbers, dot, underscore and hyphen.", "Username can contain only letters, numbers, dot, underscore and hyphen.")),
        avatarUrl: z
            .string()
            .trim()
            .max(300, tr(locale, "Avatar URL is too long.", "Avatar URL is too long."))
            .refine((value) => value.length === 0 || isValidHttpUrl(value), tr(locale, "Enter a valid avatar URL starting with http:// or https://.", "Enter a valid avatar URL starting with http:// or https://.")),
        website: z
            .string()
            .trim()
            .max(200, tr(locale, "Website URL is too long.", "Website URL is too long."))
            .refine((value) => value.length === 0 || isValidHttpUrl(value), tr(locale, "Enter a valid URL starting with http:// or https://.", "Enter a valid URL starting with http:// or https://.")),
        bio: z
            .string()
            .trim()
            .max(240, tr(locale, "Bio must be at most 240 characters.", "Bio must be at most 240 characters.")),
    });
}
export function getAccountPasswordSchema(locale: Locale) {
    return z
        .object({
        newPassword: z
            .string()
            .min(ACCOUNT_PASSWORD_MIN_LENGTH, tr(locale, `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters.`, `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters.`))
            .max(72, tr(locale, "Password is too long.", "Password is too long.")),
        confirmPassword: z.string().min(1, tr(locale, "Please confirm your password.", "Please confirm your password.")),
    })
        .superRefine((data, context) => {
        if (data.newPassword !== data.confirmPassword) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: tr(locale, "Passwords do not match.", "Passwords do not match."),
            });
        }
    });
}
