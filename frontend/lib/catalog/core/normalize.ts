export function normalizeWhitespace(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function normalizeCanonicalName(value: string | null | undefined): string | null {
  const normalized = normalizeWhitespace(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || null;
}

export function normalizePackageName(value: string | null | undefined): string | null {
  const normalized = normalizeWhitespace(value).toLowerCase();
  return normalized || null;
}

export function normalizeTag(value: string | null | undefined): string | null {
  const normalized = normalizeCanonicalName(value)?.slice(0, 48) ?? null;
  return normalized && normalized.length > 0 ? normalized : null;
}

export function slugify(value: string | null | undefined): string {
  return normalizeCanonicalName(value)?.slice(0, 90) ?? `server-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeUrl(rawUrl: string | null | undefined): string | null {
  const value = normalizeWhitespace(rawUrl);
  if (!value) {
    return null;
  }
  try {
    const parsed = new URL(value);
    parsed.hash = "";
    if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) {
      parsed.port = "";
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeUrlForIdentity(rawUrl: string | null | undefined): string | null {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) {
    return null;
  }
  try {
    const parsed = new URL(normalized);
    parsed.search = "";
    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    parsed.pathname = normalizedPath || "/";
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeRepositoryUrl(rawUrl: string | null | undefined): {
  url: string | null;
  normalized: string | null;
} {
  const normalizedUrl = normalizeUrl(rawUrl);
  if (!normalizedUrl) {
    return { url: null, normalized: null };
  }
  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname
      .replace(/\.git$/i, "")
      .replace(/\/+$/, "")
      .toLowerCase();
    return {
      url: `${parsed.protocol}//${host}${path}`,
      normalized: `${host}${path}`,
    };
  } catch {
    return { url: normalizedUrl, normalized: null };
  }
}

export function uniqueValues(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) {
      continue;
    }
    seen.add(normalized);
  }
  return [...seen];
}
