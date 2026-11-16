const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 10;

export function parseConfiguredBaseUrl(configured: string): string {
  const value = configured.trim();
  const input = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname || url.search || url.hash) {
      throw new Error("invalid URL");
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error("Nextcloud hostname must be a valid HTTPS URL without credentials, query, or fragment");
  }
}

export function resolveAllowedUrl(input: string, configuredBaseUrl: string, relativeTo = configuredBaseUrl): string {
  let url: URL;
  try {
    url = new URL(input, relativeTo);
  } catch {
    throw new Error("Nextcloud request URL is invalid");
  }

  const configured = new URL(configuredBaseUrl);
  if (url.protocol !== "https:" || url.origin !== configured.origin || url.username || url.password) {
    throw new Error("Nextcloud request destination is not the configured HTTPS origin");
  }
  return url.toString();
}

function removeBodyHeaders(headers: Headers) {
  headers.delete("content-length");
  headers.delete("content-type");
}

export function getRedirectRequest(status: number, init: RequestInit): RequestInit {
  const method = String(init.method || "GET").toUpperCase();
  const next: RequestInit = { ...init, method, headers: new Headers(init.headers) };
  const shouldSwitchToGet =
    (status === 301 || status === 302) ? method === "POST" : status === 303 ? method !== "GET" && method !== "HEAD" : false;

  if (shouldSwitchToGet) {
    next.method = "GET";
    next.body = undefined;
    removeBodyHeaders(next.headers as Headers);
  }
  return next;
}

export async function fetchWithSafeRedirects(
  input: string,
  configuredBaseUrl: string,
  init: RequestInit,
  request: typeof fetch = fetch,
): Promise<Response> {
  let url = resolveAllowedUrl(input, configuredBaseUrl);
  let requestInit: RequestInit = { ...init, headers: new Headers(init.headers) };

  for (let redirects = 0; ; redirects += 1) {
    const response = await request(url, { ...requestInit, redirect: "manual" });
    if (!REDIRECT_STATUSES.has(response.status)) return response;

    const location = response.headers.get("location");
    if (!location || redirects >= MAX_REDIRECTS) return response;
    url = resolveAllowedUrl(location, configuredBaseUrl, response.url || url);
    requestInit = getRedirectRequest(response.status, requestInit);
  }
}
