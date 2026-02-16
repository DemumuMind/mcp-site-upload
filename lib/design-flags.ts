export function isRedesignV2Enabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_REDESIGN_V2;
  return raw === "1" || raw === "true";
}

