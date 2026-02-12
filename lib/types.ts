export type AuthType = "oauth" | "api_key" | "none";
export type ServerStatus = "pending" | "active" | "rejected";
export type VerificationLevel = "community" | "partner" | "official";
export type HealthStatus = "unknown" | "healthy" | "degraded" | "down";
export type Maintainer = {
    name: string;
    email?: string;
};
export type McpServer = {
    id: string;
    createdAt?: string;
    name: string;
    slug: string;
    description: string;
    serverUrl: string;
    category: string;
    authType: AuthType;
    tags: string[];
    repoUrl?: string;
    maintainer?: Maintainer;
    status: ServerStatus;
    verificationLevel: VerificationLevel;
    healthStatus?: HealthStatus;
    healthCheckedAt?: string;
    healthError?: string;
    tools: string[];
};
