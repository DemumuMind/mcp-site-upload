function parseEnvBoolean(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }

  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function isRedesignV2Enabled(): boolean {
  return parseEnvBoolean(undefined);
}

export function isRedesignV3Enabled(): boolean {
  return parseEnvBoolean(undefined);
}
