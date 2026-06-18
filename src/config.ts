import { environment, getPreferenceValues } from "@vicinae/api";
import { Preferences } from "./types";

export function getBaseUrl(): string {
  const { hostname } = getPreferenceValues<Preferences>();
  const cleanHost = hostname.endsWith("/") ? hostname.slice(0, -1) : hostname;
  return cleanHost.startsWith("http") ? cleanHost : `https://${cleanHost}`;
}

export function getApiHeaders() {
  const { username, app_password } = getPreferenceValues<Preferences>();
  const raycastVersion = (environment as any).raycastVersion || "1.0.0";
  const vicinaeVersion = (environment as any).vicinaeVersion || "1.0.0";

  return {
    Authorization: "Basic " + Buffer.from(username + ":" + app_password).toString("base64"),
    "User-Agent": `Vicinae/${vicinaeVersion} (Raycast/${raycastVersion})`,
  };
}
