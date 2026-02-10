import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import { logoutAdminAction, moderateServerStatusAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getPendingServers } from "@/lib/servers";

export const metadata: Metadata = {
  title: "Moderation",
  description: "Admin moderation dashboard for pending server submissions.",
};

type AdminPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getFeedbackMessage({
  locale,
  success,
  error,
}: {
  locale: "en" | "ru";
  success?: string;
  error?: string;
}) {
  if (success === "active") {
    return {
      tone: "success" as const,
      text: tr(locale, "Server approved and moved to active.", "Сервер одобрен и переведён в активный статус."),
    };
  }

  if (success === "rejected") {
    return {
      tone: "success" as const,
      text: tr(locale, "Server rejected successfully.", "Сервер успешно отклонён."),
    };
  }

  if (error) {
    return {
      tone: "error" as const,
      text:
        error === "supabase"
          ? tr(locale, "Supabase admin mode is not configured.", "Админ-режим Supabase не настроен.")
          : error,
    };
  }

  return null;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const locale = await getLocale();
  const pendingServers = await getPendingServers();
  const { success, error } = await searchParams;
  const feedback = getFeedbackMessage({ locale, success, error });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{tr(locale, "Moderation", "Модерация")}</h1>
          <p className="text-sm text-slate-300">
            {tr(
              locale,
              "Review pending MCP server submissions and decide approval status.",
              "Проверьте ожидающие заявки MCP-серверов и примите решение о статусе.",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
          >
            <Link href="/admin/blog">
              <FileText className="size-4" />
              {tr(locale, "Blog studio", "Студия блога")}
            </Link>
          </Button>

          <form action={logoutAdminAction}>
            <Button
              type="submit"
              variant="outline"
              className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
            >
              {tr(locale, "Logout", "Выйти")}
            </Button>
          </form>
        </div>
      </div>

      {feedback ? (
        <div
          className={`mb-4 rounded-md border px-3 py-2 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
              : "border-rose-400/35 bg-rose-500/10 text-rose-200"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {pendingServers.length === 0 ? (
        <Card className="border-white/10 bg-slate-900/55">
          <CardHeader>
            <CardTitle className="text-slate-100">{tr(locale, "No pending submissions", "Нет ожидающих заявок")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            {tr(
              locale,
              "New servers submitted through the public form will appear here.",
              "Новые серверы, отправленные через публичную форму, появятся здесь.",
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingServers.map((mcpServer) => (
            <Card key={mcpServer.id} className="border-white/10 bg-slate-900/70">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base text-slate-100">{mcpServer.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/15 text-blue-300">{mcpServer.category}</Badge>
                  <Badge variant="secondary" className="bg-white/8 text-slate-300">
                    {mcpServer.authType}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">{mcpServer.description}</p>
                <p className="truncate text-xs text-slate-400">{mcpServer.serverUrl}</p>

                <div className="flex gap-2">
                  <form action={moderateServerStatusAction} className="w-full">
                    <input type="hidden" name="serverId" value={mcpServer.id} />
                    <input type="hidden" name="status" value="active" />
                    <Button
                      type="submit"
                      className="w-full bg-emerald-500/80 text-white hover:bg-emerald-400"
                    >
                      {tr(locale, "Approve", "Одобрить")}
                    </Button>
                  </form>

                  <form action={moderateServerStatusAction} className="w-full">
                    <input type="hidden" name="serverId" value={mcpServer.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                    >
                      {tr(locale, "Reject", "Отклонить")}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
