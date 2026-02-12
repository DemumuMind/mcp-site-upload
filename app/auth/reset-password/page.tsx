import type { Metadata } from "next";
import { AuthResetPasswordPanel } from "@/components/auth-reset-password-panel";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "Reset password", "Reset password"),
        description: tr(locale, "Set a new password for your account after opening the recovery email link.", "Set a new password for your account after opening the recovery email link."),
    };
}
export default function AuthResetPasswordPage() {
    return (<div className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-center px-4 py-12 sm:px-6">
      <AuthResetPasswordPanel />
    </div>);
}
