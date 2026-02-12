import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tr, type Locale } from "@/lib/i18n";
import type { SubmissionInput } from "@/lib/submission-schema";

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-rose-300">{message}</p>;
}

type SubmitStepBasicsProps = {
  form: UseFormReturn<SubmissionInput>;
  locale: Locale;
};

export function SubmitStepBasics({ form, locale }: SubmitStepBasicsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="name">{tr(locale, "Server name", "Server name")}</Label>
        <Input
          id="name"
          placeholder={tr(locale, "Acme MCP Gateway", "Acme MCP Gateway")}
          autoComplete="organization"
          className="border-white/10 bg-indigo-950/80"
          {...form.register("name")}
        />
        <ErrorText message={form.formState.errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">{tr(locale, "Category", "Category")}</Label>
        <Input
          id="category"
          placeholder={tr(locale, "Developer Tools", "Developer Tools")}
          autoComplete="off"
          className="border-white/10 bg-indigo-950/80"
          {...form.register("category")}
        />
        <ErrorText message={form.formState.errors.category?.message} />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="description">{tr(locale, "Description", "Description")}</Label>
        <Textarea
          id="description"
          rows={6}
          autoComplete="off"
          placeholder={tr(
            locale,
            "Describe core capabilities, tools exposed by your server, and when teams should use it.",
            "Describe core capabilities, tools exposed by your server, and when teams should use it.",
          )}
          className="border-white/10 bg-indigo-950/80"
          {...form.register("description")}
        />
        <ErrorText message={form.formState.errors.description?.message} />
      </div>
    </div>
  );
}
