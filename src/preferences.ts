import { getPreferenceValues } from "@vicinae/api";
import { Preferences } from "./types";

export function getPreferences() {
  return getPreferenceValues<Preferences>();
}
