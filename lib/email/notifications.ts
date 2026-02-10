import type { Locale } from "@/lib/i18n";

type SendEmailResult = {
  sent: boolean;
  skipped: boolean;
  reason?: string;
};

type SubmissionEmailPayload = {
  locale: Locale;
  recipientEmail: string;
  serverName: string;
  serverSlug: string;
  category: string;
  authType: "oauth" | "api_key" | "none";
};

function isEmailNotificationsEnabled(): boolean {
  const value = process.env.EMAIL_NOTIFICATIONS_ENABLED?.trim().toLowerCase();
  if (!value) {
    return false;
  }

  return value === "1" || value === "true" || value === "yes";
}

function parseRecipientList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAuthTypeLabel(authType: SubmissionEmailPayload["authType"], locale: Locale): string {
  if (authType === "oauth") {
    return "OAuth";
  }

  if (authType === "api_key") {
    return "API Key";
  }

  return locale === "ru" ? "Открытый / Без авторизации" : "Open / No Auth";
}

async function sendEmailViaResend({
  to,
  subject,
  html,
  text,
}: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  if (!isEmailNotificationsEnabled()) {
    return {
      sent: false,
      skipped: true,
      reason: "EMAIL_NOTIFICATIONS_ENABLED is disabled.",
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim();

  if (!resendApiKey || !fromEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "RESEND_API_KEY or EMAIL_FROM is not configured.",
    };
  }

  if (to.length === 0) {
    return {
      sent: false,
      skipped: true,
      reason: "Recipient list is empty.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    return {
      sent: false,
      skipped: false,
      reason: `Resend API error (${response.status}): ${errorText}`,
    };
  }

  return {
    sent: true,
    skipped: false,
  };
}

export async function sendSubmissionReceivedEmail(
  payload: SubmissionEmailPayload,
): Promise<SendEmailResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const accountUrl = `${siteUrl.replace(/\/$/, "")}/account`;
  const authTypeLabel = getAuthTypeLabel(payload.authType, payload.locale);
  const isRu = payload.locale === "ru";

  const userSubject = isRu
    ? `Заявка «${payload.serverName}» получена`
    : `Submission "${payload.serverName}" received`;

  const userText = isRu
    ? [
        `Мы получили вашу заявку на сервер ${payload.serverName}.`,
        `Категория: ${payload.category}`,
        `Тип авторизации: ${authTypeLabel}`,
        `Slug: ${payload.serverSlug}`,
        `Статус: На модерации`,
        `Личный кабинет: ${accountUrl}`,
      ].join("\n")
    : [
        `We received your server submission for ${payload.serverName}.`,
        `Category: ${payload.category}`,
        `Authentication: ${authTypeLabel}`,
        `Slug: ${payload.serverSlug}`,
        `Status: Pending moderation`,
        `Account page: ${accountUrl}`,
      ].join("\n");

  const userHtml = isRu
    ? `<div><p>Мы получили вашу заявку на сервер <strong>${payload.serverName}</strong>.</p><p>Категория: ${payload.category}<br/>Тип авторизации: ${authTypeLabel}<br/>Slug: ${payload.serverSlug}<br/>Статус: На модерации</p><p><a href="${accountUrl}">Открыть личный кабинет</a></p></div>`
    : `<div><p>We received your server submission for <strong>${payload.serverName}</strong>.</p><p>Category: ${payload.category}<br/>Authentication: ${authTypeLabel}<br/>Slug: ${payload.serverSlug}<br/>Status: Pending moderation</p><p><a href="${accountUrl}">Open account page</a></p></div>`;

  const userEmailResult = await sendEmailViaResend({
    to: [payload.recipientEmail],
    subject: userSubject,
    html: userHtml,
    text: userText,
  });

  const adminRecipients = parseRecipientList(process.env.EMAIL_ADMIN_TO);
  if (adminRecipients.length > 0) {
    const adminSubject = isRu
      ? `Новая заявка: ${payload.serverName}`
      : `New server submission: ${payload.serverName}`;

    const adminText = [
      isRu ? "Новая заявка от пользователя" : "New submission received",
      `Server: ${payload.serverName}`,
      `Category: ${payload.category}`,
      `Auth: ${authTypeLabel}`,
      `Slug: ${payload.serverSlug}`,
      `User email: ${payload.recipientEmail}`,
      `Account page: ${accountUrl}`,
    ].join("\n");

    const adminHtml = `<div><p>${isRu ? "Новая заявка от пользователя" : "New submission received"}</p><p><strong>Server:</strong> ${payload.serverName}<br/><strong>Category:</strong> ${payload.category}<br/><strong>Auth:</strong> ${authTypeLabel}<br/><strong>Slug:</strong> ${payload.serverSlug}<br/><strong>User email:</strong> ${payload.recipientEmail}</p><p><a href="${accountUrl}">Open account page</a></p></div>`;

    const adminEmailResult = await sendEmailViaResend({
      to: adminRecipients,
      subject: adminSubject,
      html: adminHtml,
      text: adminText,
    });

    if (!adminEmailResult.sent && !adminEmailResult.skipped) {
      console.error("[email] Failed to send admin notification:", adminEmailResult.reason);
    }
  }

  return userEmailResult;
}
