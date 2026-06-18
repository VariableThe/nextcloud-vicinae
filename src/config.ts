import { environment } from "@vicinae/api";

let baseUrlCache: string | null = null;
let apiHeadersCache: Record<string, string> | null = null;

export function setCredentialsCache(hostname: string, username: string, app_password: string) {
  const cleanHost = hostname.endsWith("/") ? hostname.slice(0, -1) : hostname;
  baseUrlCache = cleanHost.startsWith("http") ? cleanHost : `https://${cleanHost}`;

  const vicinaeVersion = (environment as any).vicinaeVersion || "1.0.0";
  const raycastVersion = (environment as any).raycastVersion || "1.0.0";

  apiHeadersCache = {
    Authorization: "Basic " + Buffer.from(username + ":" + app_password).toString("base64"),
    "User-Agent": `Vicinae/${vicinaeVersion} (Raycast/${raycastVersion})`,
  };
}

export function clearCredentialsCache() {
  baseUrlCache = null;
  apiHeadersCache = null;
}

export function getBaseUrl(): string {
  if (!baseUrlCache) throw new Error("Base URL not set");
  return baseUrlCache;
}

export function getApiHeaders() {
  if (!apiHeadersCache) throw new Error("API headers not set");
  return apiHeadersCache;
}
