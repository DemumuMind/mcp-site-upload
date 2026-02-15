const SUPABASE_PUBLISHABLE_KEY_ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
] as const;

function readTrimmedEnv(name: string): string | null {
  const rawValue = process.env[name];
  if (!rawValue) {
    return null;
  }

  const trimmedValue = rawValue.trim();
  return trimmedValue ? trimmedValue : null;
}

export function getSupabaseUrl(): string | null {
  return readTrimmedEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabasePublishableKey(): string | null {
  for (const envName of SUPABASE_PUBLISHABLE_KEY_ENV_NAMES) {
    const envValue = readTrimmedEnv(envName);
    if (envValue) {
      return envValue;
    }
  }

  return null;
}

export function getSupabasePublicEnv():
  | {
      supabaseUrl: string;
      supabasePublishableKey: string;
    }
  | null {
  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

export function getSupabaseServiceRoleKey(): string | null {
  return readTrimmedEnv("SUPABASE_SERVICE_ROLE_KEY");
}
