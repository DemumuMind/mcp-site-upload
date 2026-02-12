"use client";
import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { updateAccountPasswordAction, updateAccountProfileAction, } from "@/app/account/actions";
import { ACCOUNT_PASSWORD_MIN_LENGTH, getAccountPasswordSchema, getAccountProfileSchema, type AccountPasswordInput, type AccountProfileInput, } from "@/lib/account-profile-schema";
import { tr, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
type AccountProfileFormsProps = {
    locale: Locale;
    initialProfile: AccountProfileInput;
};
function ErrorText({ message }: {
    message?: string;
}) {
    if (!message) {
        return null;
    }
    return <p className="mt-1 text-xs text-rose-300">{message}</p>;
}
export function AccountProfileForms({ locale, initialProfile }: AccountProfileFormsProps) {
    const [isProfilePending, startProfileTransition] = useTransition();
    const [isPasswordPending, startPasswordTransition] = useTransition();
    const profileSchema = useMemo(() => getAccountProfileSchema(locale), [locale]);
    const passwordSchema = useMemo(() => getAccountPasswordSchema(locale), [locale]);
    const profileForm = useForm<AccountProfileInput>({
        resolver: zodResolver(profileSchema),
        defaultValues: initialProfile,
    });
    const passwordForm = useForm<AccountPasswordInput>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });
    const bioValue = useWatch({
        control: profileForm.control,
        name: "bio",
    });
    const bioLength = bioValue?.length ?? 0;
    function submitProfile(values: AccountProfileInput) {
        startProfileTransition(async () => {
            const result = await updateAccountProfileAction(values);
            if (!result.success) {
                if (result.fieldErrors) {
                    for (const [fieldName, errorMessage] of Object.entries(result.fieldErrors)) {
                        if (errorMessage) {
                            profileForm.setError(fieldName as keyof AccountProfileInput, {
                                message: errorMessage,
                            });
                        }
                    }
                }
                toast.error(result.message);
                return;
            }
            profileForm.reset(result.profile ?? values);
            toast.success(result.message);
        });
    }
    function submitPassword(values: AccountPasswordInput) {
        startPasswordTransition(async () => {
            const result = await updateAccountPasswordAction(values);
            if (!result.success) {
                if (result.fieldErrors) {
                    for (const [fieldName, errorMessage] of Object.entries(result.fieldErrors)) {
                        if (errorMessage) {
                            passwordForm.setError(fieldName as keyof AccountPasswordInput, {
                                message: errorMessage,
                            });
                        }
                    }
                }
                toast.error(result.message);
                return;
            }
            passwordForm.reset({
                newPassword: "",
                confirmPassword: "",
            });
            toast.success(result.message);
        });
    }
    return (<div className="space-y-5">
      <Card className="border-white/10 bg-indigo-900/72">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl text-violet-50">
            <UserRound className="size-5 text-blue-300"/>
            {tr(locale, "Profile details", "Profile details")}
          </CardTitle>
          <p className="text-sm text-violet-200">
            {tr(locale, "Update how your profile appears in the account section.", "Update how your profile appears in the account section.")}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={profileForm.handleSubmit(submitProfile)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{tr(locale, "Full name", "Full name")}</Label>
                <Input id="fullName" autoComplete="name" placeholder={tr(locale, "Jane Doe", "Jane Doe")} className="border-white/10 bg-indigo-950/80" {...profileForm.register("fullName")}/>
                <ErrorText message={profileForm.formState.errors.fullName?.message}/>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username">{tr(locale, "Username", "Username")}</Label>
                <Input id="username" autoComplete="username" placeholder={tr(locale, "jane_doe", "jane_doe")} className="border-white/10 bg-indigo-950/80" {...profileForm.register("username")}/>
                <ErrorText message={profileForm.formState.errors.username?.message}/>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">{tr(locale, "Avatar URL", "Avatar URL")}</Label>
              <Input id="avatarUrl" type="url" autoComplete="url" placeholder="https://example.com/avatar.jpg" className="border-white/10 bg-indigo-950/80" {...profileForm.register("avatarUrl")}/>
              <ErrorText message={profileForm.formState.errors.avatarUrl?.message}/>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">{tr(locale, "Website", "Website")}</Label>
              <Input id="website" type="url" autoComplete="url" placeholder="https://example.com" className="border-white/10 bg-indigo-950/80" {...profileForm.register("website")}/>
              <ErrorText message={profileForm.formState.errors.website?.message}/>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="bio">{tr(locale, "Bio", "Bio")}</Label>
                <span className="text-xs text-violet-300">{bioLength}/240</span>
              </div>
              <Textarea id="bio" rows={4} placeholder={tr(locale, "Tell others what you build or focus on.", "Tell others what you build or focus on.")} className="border-white/10 bg-indigo-950/80" {...profileForm.register("bio")}/>
              <ErrorText message={profileForm.formState.errors.bio?.message}/>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isProfilePending} className="bg-blue-500 hover:bg-blue-400">
                {isProfilePending ? <LoaderCircle className="size-4 animate-spin"/> : null}
                {tr(locale, "Save profile", "Save profile")}
              </Button>
              <p className="text-xs text-violet-300">
                {tr(locale, "Changes are saved to your account metadata.", "Changes are saved to your account metadata.")}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-indigo-900/72">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl text-violet-50">
            <LockKeyhole className="size-5 text-blue-300"/>
            {tr(locale, "Security", "Security")}
          </CardTitle>
          <p className="text-sm text-violet-200">
            {tr(locale, "Set a new password for your account.", "Set a new password for your account.")}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">{tr(locale, "New password", "New password")}</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" placeholder={tr(locale, `Minimum ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`, `Minimum ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`)} className="border-white/10 bg-indigo-950/80" {...passwordForm.register("newPassword")}/>
                <ErrorText message={passwordForm.formState.errors.newPassword?.message}/>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">
                  {tr(locale, "Confirm password", "Confirm password")}
                </Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder={tr(locale, "Repeat password", "Repeat password")} className="border-white/10 bg-indigo-950/80" {...passwordForm.register("confirmPassword")}/>
                <ErrorText message={passwordForm.formState.errors.confirmPassword?.message}/>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="outline" disabled={isPasswordPending} className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]">
                {isPasswordPending ? <LoaderCircle className="size-4 animate-spin"/> : null}
                {tr(locale, "Update password", "Update password")}
              </Button>
              <p className="text-xs text-violet-300">
                {tr(locale, "Use a unique password you don't use anywhere else.", "Use a unique password you don't use anywhere else.")}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);
}
