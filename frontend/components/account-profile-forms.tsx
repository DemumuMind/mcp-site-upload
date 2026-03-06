"use client";
import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { updateAccountPasswordAction, updateAccountProfileAction } from "@/app/account/actions";
import { ACCOUNT_PASSWORD_MIN_LENGTH, getAccountPasswordSchema, getAccountProfileSchema, type AccountPasswordInput, type AccountProfileInput } from "@/lib/account-profile-schema";
import { tr, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AccountProfileFormsProps = { locale: Locale; initialProfile: AccountProfileInput; };
function ErrorText({ message }: { message?: string }) { return message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null; }

export function AccountProfileForms({ locale, initialProfile }: AccountProfileFormsProps) {
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const profileSchema = useMemo(() => getAccountProfileSchema(locale), [locale]);
  const passwordSchema = useMemo(() => getAccountPasswordSchema(locale), [locale]);
  const profileForm = useForm<AccountProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: initialProfile });
  const passwordForm = useForm<AccountPasswordInput>({ resolver: zodResolver(passwordSchema), defaultValues: { newPassword: "", confirmPassword: "" } });
  const bioValue = useWatch({ control: profileForm.control, name: "bio" });
  const bioLength = bioValue?.length ?? 0;

  function submitProfile(values: AccountProfileInput) {
    startProfileTransition(async () => {
      const result = await updateAccountProfileAction(values);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [fieldName, errorMessage] of Object.entries(result.fieldErrors)) {
            if (errorMessage) profileForm.setError(fieldName as keyof AccountProfileInput, { message: errorMessage });
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
            if (errorMessage) passwordForm.setError(fieldName as keyof AccountPasswordInput, { message: errorMessage });
          }
        }
        toast.error(result.message);
        return;
      }
      passwordForm.reset({ newPassword: "", confirmPassword: "" });
      toast.success(result.message);
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="space-y-2 border-b border-border/60 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-foreground"><UserRound className="size-5 text-primary" />{tr(locale, "Profile details", "Profile details")}</CardTitle>
          <p className="text-sm leading-7 text-muted-foreground">{tr(locale, "Update how your profile appears in the account section.", "Update how your profile appears in the account section.")}</p>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={profileForm.handleSubmit(submitProfile)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="fullName">{tr(locale, "Full name", "Full name")}</Label><Input id="fullName" autoComplete="name" placeholder={tr(locale, "Jane Doe", "Jane Doe")} {...profileForm.register("fullName")} /><ErrorText message={profileForm.formState.errors.fullName?.message} /></div>
              <div className="space-y-1.5"><Label htmlFor="username">{tr(locale, "Username", "Username")}</Label><Input id="username" autoComplete="username" placeholder={tr(locale, "jane_doe", "jane_doe")} {...profileForm.register("username")} /><ErrorText message={profileForm.formState.errors.username?.message} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="avatarUrl">{tr(locale, "Avatar URL", "Avatar URL")}</Label><Input id="avatarUrl" type="url" autoComplete="url" placeholder="https://example.com/avatar.jpg" {...profileForm.register("avatarUrl")} /><ErrorText message={profileForm.formState.errors.avatarUrl?.message} /></div>
            <div className="space-y-1.5"><Label htmlFor="website">{tr(locale, "Website", "Website")}</Label><Input id="website" type="url" autoComplete="url" placeholder="https://example.com" {...profileForm.register("website")} /><ErrorText message={profileForm.formState.errors.website?.message} /></div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3"><Label htmlFor="bio">{tr(locale, "Bio", "Bio")}</Label><span className="text-xs text-muted-foreground">{bioLength}/240</span></div>
              <Textarea id="bio" rows={4} placeholder={tr(locale, "Tell others what you build or focus on.", "Tell others what you build or focus on.")} {...profileForm.register("bio")} />
              <ErrorText message={profileForm.formState.errors.bio?.message} />
            </div>
            <div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={isProfilePending} className="px-6">{isProfilePending ? <LoaderCircle className="size-4 animate-spin" /> : null}{tr(locale, "Save profile", "Save profile")}</Button><p className="text-xs text-muted-foreground">{tr(locale, "Changes are saved to your account metadata.", "Changes are saved to your account metadata.")}</p></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2 border-b border-border/60 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-foreground"><LockKeyhole className="size-5 text-primary" />{tr(locale, "Security", "Security")}</CardTitle>
          <p className="text-sm leading-7 text-muted-foreground">{tr(locale, "Set a new password for your account.", "Set a new password for your account.")}</p>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="newPassword">{tr(locale, "New password", "New password")}</Label><Input id="newPassword" type="password" autoComplete="new-password" placeholder={tr(locale, `Minimum ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`, `Minimum ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`)} {...passwordForm.register("newPassword")} /><ErrorText message={passwordForm.formState.errors.newPassword?.message} /></div>
              <div className="space-y-1.5"><Label htmlFor="confirmPassword">{tr(locale, "Confirm password", "Confirm password")}</Label><Input id="confirmPassword" type="password" autoComplete="new-password" placeholder={tr(locale, "Repeat password", "Repeat password")} {...passwordForm.register("confirmPassword")} /><ErrorText message={passwordForm.formState.errors.confirmPassword?.message} /></div>
            </div>
            <div className="flex flex-wrap items-center gap-3"><Button type="submit" variant="outline" disabled={isPasswordPending} className="px-6">{isPasswordPending ? <LoaderCircle className="size-4 animate-spin" /> : null}{tr(locale, "Update password", "Update password")}</Button><p className="text-xs text-muted-foreground">{tr(locale, "Use a unique password you don't use anywhere else.", "Use a unique password you don't use anywhere else.")}</p></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
