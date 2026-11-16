import { environment } from "@vicinae/api";
import { getPreferences } from "./preferences";
import { fetchWithSafeRedirects, parseConfiguredBaseUrl, resolveAllowedUrl } from "./security";

let baseUrlCache: string | null = null;
let apiHeadersCache: Record<string, string> | null = null;

export function getBaseUrl(): string {
  if (baseUrlCache) return baseUrlCache;
  const { hostname } = getPreferences();
  baseUrlCache = parseConfiguredBaseUrl(hostname);
  return baseUrlCache;
}

export async function fetchNextcloud(input: string, init: RequestInit = {}): Promise<Response> {
  const baseUrl = getBaseUrl();
  const headers = new Headers(getApiHeaders());
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  return fetchWithSafeRedirects(input, baseUrl, { ...init, headers });
}

export function resolveNextcloudUrl(input: string, relativeTo = getBaseUrl()): string {
  return resolveAllowedUrl(input, getBaseUrl(), relativeTo);
}

export function getApiHeaders() {
  if (apiHeadersCache) return apiHeadersCache;
  const { username, app_password } = getPreferences();
  const raycastVersion = (environment as any).raycastVersion || "1.0.0";
  const vicinaeVersion = (environment as any).vicinaeVersion || "1.0.0";

  apiHeadersCache = {
    Authorization: "Basic " + Buffer.from(username + ":" + app_password).toString("base64"),
    "User-Agent": `Vicinae/${vicinaeVersion} (Raycast/${raycastVersion})`,
  };
  return apiHeadersCache;
}
