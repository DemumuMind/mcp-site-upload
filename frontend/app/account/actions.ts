"use server";
import { getAccountPasswordSchema, getAccountProfileSchema, type AccountPasswordInput, type AccountProfileInput, } from "@/lib/account-profile-schema";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
type AccountProfileActionResult = {
    success: boolean;
    message: string;
    fieldErrors?: Partial<Record<keyof AccountProfileInput, string>>;
    profile?: AccountProfileInput;
};
type AccountPasswordActionResult = {
    success: boolean;
    message: string;
    fieldErrors?: Partial<Record<keyof AccountPasswordInput, string>>;
};
function getFirstFieldErrors<T extends string>(fieldErrors: Partial<Record<T, string[] | undefined>>): Partial<Record<T, string>> {
    const nextFieldErrors: Partial<Record<T, string>> = {};
    for (const [field, value] of Object.entries(fieldErrors) as [
        T,
        string[] | undefined
    ][]) {
        if (!Array.isArray(value) || value.length === 0) {
            continue;
        }
        nextFieldErrors[field] = value[0] ?? "";
    }
    return nextFieldErrors;
}
async function requireAuthenticatedUser() {
    const supabaseClient = await createSupabaseServerAuthClient();
    if (!supabaseClient) {
        return { supabaseClient: null, user: null };
    }
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data.user) {
        return { supabaseClient, user: null };
    }
    return { supabaseClient, user: data.user };
}
export async function updateAccountProfileAction(input: AccountProfileInput): Promise<AccountProfileActionResult> {
    const locale = await getLocale();
    const profileSchema = getAccountProfileSchema(locale);
    const parsedInput = profileSchema.safeParse(input);
    if (!parsedInput.success) {
        return {
            success: false,
            message: tr(locale, "Please check the highlighted profile fields.", "Please check the highlighted profile fields."),
            fieldErrors: getFirstFieldErrors(parsedInput.error.flatten().fieldErrors),
        };
    }
    const { supabaseClient, user } = await requireAuthenticatedUser();
    if (!supabaseClient) {
        return {
            success: false,
            message: tr(locale, "Auth is not configured. Set Supabase environment variables.", "Auth is not configured. Set Supabase environment variables."),
        };
    }
    if (!user) {
        return {
            success: false,
            message: tr(locale, "You need to sign in before editing your profile.", "You need to sign in before editing your profile."),
        };
    }
    const normalizedProfile = parsedInput.data;
    const currentMetadata = user.user_metadata && typeof user.user_metadata === "object" && !Array.isArray(user.user_metadata)
        ? (user.user_metadata as Record<string, unknown>)
        : {};
    const { error } = await supabaseClient.auth.updateUser({
        data: {
            ...currentMetadata,
            full_name: normalizedProfile.fullName || null,
            username: normalizedProfile.username || null,
            avatar_url: normalizedProfile.avatarUrl || null,
            website: normalizedProfile.website || null,
            bio: normalizedProfile.bio || null,
        },
    });
    if (error) {
        return {
            success: false,
            message: tr(locale, "Could not save profile changes right now.", "Could not save profile changes right now."),
        };
    }
    return {
        success: true,
        message: tr(locale, "Profile updated.", "Profile updated."),
        profile: normalizedProfile,
    };
}
export async function updateAccountPasswordAction(input: AccountPasswordInput): Promise<AccountPasswordActionResult> {
    const locale = await getLocale();
    const passwordSchema = getAccountPasswordSchema(locale);
    const parsedInput = passwordSchema.safeParse(input);
    if (!parsedInput.success) {
        return {
            success: false,
            message: tr(locale, "Please check the password fields.", "Please check the password fields."),
            fieldErrors: getFirstFieldErrors(parsedInput.error.flatten().fieldErrors),
        };
    }
    const { supabaseClient, user } = await requireAuthenticatedUser();
    if (!supabaseClient) {
        return {
            success: false,
            message: tr(locale, "Auth is not configured. Set Supabase environment variables.", "Auth is not configured. Set Supabase environment variables."),
        };
    }
    if (!user) {
        return {
            success: false,
            message: tr(locale, "You need to sign in before changing password.", "You need to sign in before changing password."),
        };
    }
    const { error } = await supabaseClient.auth.updateUser({
        password: parsedInput.data.newPassword,
    });
    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }
    return {
        success: true,
        message: tr(locale, "Password updated.", "Password updated."),
    };
}
