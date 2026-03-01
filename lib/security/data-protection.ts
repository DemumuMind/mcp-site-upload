export type DataSensitivity = "public" | "internal" | "confidential" | "restricted";

export type DataInventoryEntry = {
  field: string;
  sensitivity: DataSensitivity;
  retentionDays: number;
  notes: string;
};

export const AUTH_SECURITY_DATA_INVENTORY: DataInventoryEntry[] = [
  {
    field: "auth_security_events.event_type",
    sensitivity: "internal",
    retentionDays: 365,
    notes: "Security analytics and abuse detection.",
  },
  {
    field: "auth_security_events.email",
    sensitivity: "restricted",
    retentionDays: 90,
    notes: "Direct identifier; only needed for targeted incident follow-up.",
  },
  {
    field: "auth_security_events.email_hash",
    sensitivity: "confidential",
    retentionDays: 365,
    notes: "Pseudonymous identifier for correlation and rate-limit checks.",
  },
  {
    field: "auth_security_events.user_id",
    sensitivity: "confidential",
    retentionDays: 365,
    notes: "Account-level correlation for security investigations.",
  },
  {
    field: "auth_security_events.ip_address",
    sensitivity: "restricted",
    retentionDays: 30,
    notes: "Fraud/abuse controls and anomalous login detection.",
  },
];

export function maskEmail(email: string | null | undefined): string {
  if (!email) {
    return "";
  }

  const [localPart, domainPart] = email.trim().toLowerCase().split("@");
  if (!localPart || !domainPart) {
    return "***";
  }

  const visibleLocal = localPart.length <= 2 ? localPart[0] ?? "*" : localPart.slice(0, 2);
  return `${visibleLocal}***@${domainPart}`;
}

export function maskIpAddress(ipAddress: string | null | undefined): string {
  if (!ipAddress) {
    return "";
  }

  if (ipAddress.includes(":")) {
    const parts = ipAddress.split(":").filter(Boolean);
    const first = parts[0] ?? "";
    return `${first}:****:****`;
  }

  const octets = ipAddress.split(".");
  if (octets.length !== 4) {
    return "***";
  }
  return `${octets[0]}.${octets[1]}.*.*`;
}
