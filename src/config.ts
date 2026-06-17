import { environment, getPreferenceValues } from "@vicinae/api";
import { Preferences } from "./types";

const { hostname, username, password } = getPreferenceValues<Preferences>();
const cleanHost = hostname.endsWith("/") ? hostname.slice(0, -1) : hostname;
export const BASE_URL = cleanHost.startsWith("http") ? cleanHost : `https://${cleanHost}`;

const raycastVersion = (environment as any).raycastVersion || "1.0.0";
const vicinaeVersion = (environment as any).vicinaeVersion || "1.0.0";

export const API_HEADERS = {
  Authorization: "Basic " + Buffer.from(username + ":" + password).toString("base64"),
  "User-Agent": `Vicinae/${vicinaeVersion} (Raycast/${raycastVersion})`,
};
