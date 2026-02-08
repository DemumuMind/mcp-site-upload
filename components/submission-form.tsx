"use client";

import { useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { submitServerAction } from "@/app/actions";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { tr } from "@/lib/i18n";
import { getSubmissionSchema, type SubmissionInput } from "@/lib/submission-schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const defaultFormValues: SubmissionInput = {
  name: "",
  serverUrl: "",
  category: "",
  authType: "oauth",
  description: "",
  maintainerName: "",
  maintainerEmail: "",
  repoUrl: "",
};

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-rose-300">{message}</p>;
}

export function SubmissionForm() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const submissionSchema = useMemo(() => getSubmissionSchema(locale), [locale]);

  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: defaultFormValues,
  });

  function onSubmit(values: SubmissionInput) {
    startTransition(async () => {
      let accessToken: string | null = null;
      const supabaseClient = createSupabaseBrowserClient();

      if (supabaseClient) {
        const { data } = await supabaseClient.auth.getSession();
        accessToken = data.session?.access_token ?? null;
      }

      const result = await submitServerAction(values, accessToken);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [fieldName, errorMessage] of Object.entries(
            result.fieldErrors,
          )) {
            if (errorMessage) {
              form.setError(fieldName as keyof SubmissionInput, {
                message: errorMessage,
              });
            }
          }
        }

        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset(defaultFormValues);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:grid-cols-2 sm:p-6"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">{tr(locale, "Server name", "Название сервера")}</Label>
        <Input
          id="name"
          placeholder={tr(locale, "Linear MCP", "Linear MCP")}
          className="border-white/10 bg-slate-950/80"
          {...form.register("name")}
        />
        <ErrorText message={form.formState.errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">{tr(locale, "Category", "Категория")}</Label>
        <Input
          id="category"
          placeholder={tr(locale, "Project Management", "Управление проектами")}
          className="border-white/10 bg-slate-950/80"
          {...form.register("category")}
        />
        <ErrorText message={form.formState.errors.category?.message} />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="serverUrl">{tr(locale, "Server URL", "URL сервера")}</Label>
        <Input
          id="serverUrl"
          placeholder="https://mcp.example.com/sse"
          className="border-white/10 bg-slate-950/80"
          {...form.register("serverUrl")}
        />
        <ErrorText message={form.formState.errors.serverUrl?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="authType">{tr(locale, "Authentication", "Авторизация")}</Label>
        <Controller
          control={form.control}
          name="authType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="authType" className="border-white/10 bg-slate-950/80">
                <SelectValue placeholder={tr(locale, "Select auth type", "Выберите тип авторизации")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oauth">OAuth</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="none">{tr(locale, "Open / No Auth", "Открытый / Без авторизации")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <ErrorText message={form.formState.errors.authType?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="repoUrl">{tr(locale, "Repository URL (optional)", "URL репозитория (опционально)")}</Label>
        <Input
          id="repoUrl"
          placeholder="https://github.com/org/repo"
          className="border-white/10 bg-slate-950/80"
          {...form.register("repoUrl")}
        />
        <ErrorText message={form.formState.errors.repoUrl?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maintainerName">{tr(locale, "Maintainer name", "Имя мейнтейнера")}</Label>
        <Input
          id="maintainerName"
          placeholder={tr(locale, "Jane Doe", "Jane Doe")}
          className="border-white/10 bg-slate-950/80"
          {...form.register("maintainerName")}
        />
        <ErrorText message={form.formState.errors.maintainerName?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maintainerEmail">{tr(locale, "Maintainer email", "Email мейнтейнера")}</Label>
        <Input
          id="maintainerEmail"
          placeholder="maintainer@example.com"
          className="border-white/10 bg-slate-950/80"
          {...form.register("maintainerEmail")}
        />
        <ErrorText message={form.formState.errors.maintainerEmail?.message} />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="description">{tr(locale, "Description", "Описание")}</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder={tr(
            locale,
            "Describe server capabilities, supported tools, and setup notes.",
            "Опишите возможности сервера, доступные инструменты и заметки по настройке.",
          )}
          className="border-white/10 bg-slate-950/80"
          {...form.register("description")}
        />
        <ErrorText message={form.formState.errors.description?.message} />
      </div>

      <div className="sm:col-span-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 hover:bg-blue-400 sm:w-auto"
        >
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {tr(locale, "Submit for moderation", "Отправить на модерацию")}
        </Button>
      </div>
    </form>
  );
}
