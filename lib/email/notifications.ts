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
type SecurityAlertPayload = {
    locale: Locale;
    recipientEmail: string;
    alertType: "failed_logins" | "new_ip_login";
    failedAttemptsInWindow?: number;
    windowMinutes?: number;
    ipAddress?: string | null;
};
function getEmailProvider(): "resend" | "smtp" {
    const value = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
    if (value === "smtp") {
        return "smtp";
    }
    return "resend";
}
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
    void locale;
    if (authType === "oauth") {
        return "OAuth";
    }
    if (authType === "api_key") {
        return "API Key";
    }
    return "Open / No Auth";
}
async function sendEmailViaResend({ to, subject, html, text, }: {
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
async function sendEmailViaSmtp({ to, subject, html, text, }: {
    to: string[];
    subject: string;
    html: string;
    text: string;
}): Promise<SendEmailResult> {
    const fromEmail = process.env.EMAIL_FROM?.trim();
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPortRaw = process.env.SMTP_PORT?.trim() ?? "587";
    const smtpSecureRaw = process.env.SMTP_SECURE?.trim().toLowerCase();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    const smtpPort = Number(smtpPortRaw);
    const smtpSecure = smtpSecureRaw === "1" || smtpSecureRaw === "true" || smtpSecureRaw === "yes";
    if (!fromEmail || !smtpHost || !smtpUser || !smtpPass || !Number.isFinite(smtpPort) || smtpPort <= 0) {
        return {
            sent: false,
            skipped: true,
            reason: "SMTP is not fully configured (EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).",
        };
    }
    if (to.length === 0) {
        return {
            sent: false,
            skipped: true,
            reason: "Recipient list is empty.",
        };
    }
    try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        await transporter.sendMail({
            from: fromEmail,
            to,
            subject,
            text,
            html,
        });
        return {
            sent: true,
            skipped: false,
        };
    } catch (error) {
        return {
            sent: false,
            skipped: false,
            reason: `SMTP send error: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
async function sendEmail({ to, subject, html, text, }: {
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
    const provider = getEmailProvider();
    if (provider === "smtp") {
        return sendEmailViaSmtp({ to, subject, html, text });
    }
    return sendEmailViaResend({ to, subject, html, text });
}
export async function sendSubmissionReceivedEmail(payload: SubmissionEmailPayload): Promise<SendEmailResult> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
    const accountUrl = `${siteUrl.replace(/\/$/, "")}/account`;
    const authTypeLabel = getAuthTypeLabel(payload.authType, payload.locale);
    const userSubject = `Submission "${payload.serverName}" received`;
    const userText = [
        `We received your server submission for ${payload.serverName}.`,
        `Category: ${payload.category}`,
        `Authentication: ${authTypeLabel}`,
        `Slug: ${payload.serverSlug}`,
        "Status: Pending moderation",
        `Account page: ${accountUrl}`,
    ].join("\n");
    const userHtml = `<div><p>We received your server submission for <strong>${payload.serverName}</strong>.</p><p>Category: ${payload.category}<br/>Authentication: ${authTypeLabel}<br/>Slug: ${payload.serverSlug}<br/>Status: Pending moderation</p><p><a href="${accountUrl}">Open account page</a></p></div>`;
    const userEmailResult = await sendEmail({
        to: [payload.recipientEmail],
        subject: userSubject,
        html: userHtml,
        text: userText,
    });
    const adminRecipients = parseRecipientList(process.env.EMAIL_ADMIN_TO);
    if (adminRecipients.length > 0) {
        const adminSubject = `New server submission: ${payload.serverName}`;
        const adminText = [
            "New submission received",
            `Server: ${payload.serverName}`,
            `Category: ${payload.category}`,
            `Auth: ${authTypeLabel}`,
            `Slug: ${payload.serverSlug}`,
            `User email: ${payload.recipientEmail}`,
            `Account page: ${accountUrl}`,
        ].join("\n");
        const adminHtml = `<div><p>New submission received</p><p><strong>Server:</strong> ${payload.serverName}<br/><strong>Category:</strong> ${payload.category}<br/><strong>Auth:</strong> ${authTypeLabel}<br/><strong>Slug:</strong> ${payload.serverSlug}<br/><strong>User email:</strong> ${payload.recipientEmail}</p><p><a href="${accountUrl}">Open account page</a></p></div>`;
        const adminEmailResult = await sendEmail({
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
export async function sendSecurityAlertEmail(payload: SecurityAlertPayload): Promise<SendEmailResult> {
    if (!isEmailNotificationsEnabled()) {
        return {
            sent: false,
            skipped: true,
            reason: "EMAIL_NOTIFICATIONS_ENABLED is disabled.",
        };
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
    const accountSecurityUrl = `${siteUrl.replace(/\/$/, "")}/account`;
    let subject = "Security alert";
    let text = "Security activity detected on your account.";
    let html = "<div><p>Security activity detected on your account.</p></div>";
    if (payload.alertType === "failed_logins") {
        const attempts = payload.failedAttemptsInWindow ?? 0;
        const minutes = payload.windowMinutes ?? 15;
        subject = "Security alert: failed login attempts";
        text = [
            `We detected ${attempts} failed login attempts in the last ${minutes} minutes.`,
            "If this was not you, reset your password immediately.",
            `Review account activity: ${accountSecurityUrl}`,
        ].join("\n");
        html = `<div><p>We detected <strong>${attempts}</strong> failed login attempts in the last ${minutes} minutes.</p><p>If this was not you, reset your password immediately.</p><p><a href="${accountSecurityUrl}">Review account activity</a></p></div>`;
    }
    if (payload.alertType === "new_ip_login") {
        const ipText = payload.ipAddress ? ` from IP ${payload.ipAddress}` : "";
        subject = "Security alert: new login location";
        text = [
            `We detected a successful login${ipText}.`,
            "If this was not you, reset your password immediately.",
            `Review account activity: ${accountSecurityUrl}`,
        ].join("\n");
        html = `<div><p>We detected a successful login${ipText ? ` from <strong>${payload.ipAddress}</strong>` : ""}.</p><p>If this was not you, reset your password immediately.</p><p><a href="${accountSecurityUrl}">Review account activity</a></p></div>`;
    }
    const userResult = await sendEmail({
        to: [payload.recipientEmail],
        subject,
        text,
        html,
    });
    const adminRecipients = parseRecipientList(process.env.EMAIL_ADMIN_TO);
    if (adminRecipients.length > 0) {
        const adminResult = await sendEmail({
            to: adminRecipients,
            subject: `[Admin] ${subject} (${payload.recipientEmail})`,
            text,
            html,
        });
        if (!adminResult.sent && !adminResult.skipped) {
            console.error("[email] Failed to send security alert to admins:", adminResult.reason);
        }
    }
    return userResult;
}
