import { environment } from "@vicinae/api";
import { getPreferences } from "./preferences";

const { hostname, username, app_password } = getPreferenceValues<Preferences>();
const cleanHost = hostname.endsWith("/") ? hostname.slice(0, -1) : hostname;
export const BASE_URL = cleanHost.startsWith("http") ? cleanHost : `https://${cleanHost}`;

export function getBaseUrl(): string {
  if (baseUrlCache) return baseUrlCache;
  const { hostname } = getPreferences();
  const cleanHost = hostname.endsWith("/") ? hostname.slice(0, -1) : hostname;
  baseUrlCache = cleanHost.startsWith("http") ? cleanHost : `https://${cleanHost}`;
  return baseUrlCache;
}

export const API_HEADERS = {
  Authorization: "Basic " + Buffer.from(username + ":" + app_password).toString("base64"),
  "User-Agent": `Vicinae/${vicinaeVersion} (Raycast/${raycastVersion})`,
};
