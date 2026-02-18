function parseEnvBoolean(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }

  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function isRedesignV2Enabled(): boolean {
  return parseEnvBoolean(process.env.NEXT_PUBLIC_REDESIGN_V2);
}

export function isRedesignV3Enabled(): boolean {
  return parseEnvBoolean(process.env.NEXT_PUBLIC_REDESIGN_V3);
}
