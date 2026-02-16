import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tr, type Locale } from "@/lib/i18n";
import type { SubmissionInput } from "@/lib/submission-schema";

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-rose-300">{message}</p>;
}

type SubmitStepTechnicalProps = {
  form: UseFormReturn<SubmissionInput>;
  locale: Locale;
};

export function SubmitStepTechnical({ form, locale }: SubmitStepTechnicalProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="serverUrl">{tr(locale, "Server URL", "Server URL")}</Label>
        <Input
          id="serverUrl"
          type="url"
          autoComplete="url"
          spellCheck={false}
          placeholder="https://mcp.example.com/sse"
          className="border-blacksmith bg-card"
          {...form.register("serverUrl")}
        />
        <ErrorText message={form.formState.errors.serverUrl?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="authType">{tr(locale, "Authentication", "Authentication")}</Label>
        <Controller
          control={form.control}
          name="authType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="authType" className="border-blacksmith bg-card">
                <SelectValue placeholder={tr(locale, "Select auth type", "Select auth type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oauth">OAuth</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="none">{tr(locale, "Open / No Auth", "Open / No Auth")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <ErrorText message={form.formState.errors.authType?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="repoUrl">{tr(locale, "Repository URL (optional)", "Repository URL (optional)")}</Label>
        <Input
          id="repoUrl"
          type="url"
          autoComplete="url"
          spellCheck={false}
          placeholder="https://github.com/org/repo"
          className="border-blacksmith bg-card"
          {...form.register("repoUrl")}
        />
        <ErrorText message={form.formState.errors.repoUrl?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maintainerName">{tr(locale, "Maintainer name", "Maintainer name")}</Label>
        <Input
          id="maintainerName"
          autoComplete="name"
          placeholder={tr(locale, "Jane Doe", "Jane Doe")}
          className="border-blacksmith bg-card"
          {...form.register("maintainerName")}
        />
        <ErrorText message={form.formState.errors.maintainerName?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maintainerEmail">{tr(locale, "Maintainer email", "Maintainer email")}</Label>
        <Input
          id="maintainerEmail"
          type="email"
          autoComplete="email"
          placeholder="maintainer@example.com"
          className="border-blacksmith bg-card"
          {...form.register("maintainerEmail")}
        />
        <ErrorText message={form.formState.errors.maintainerEmail?.message} />
      </div>
    </div>
  );
}

