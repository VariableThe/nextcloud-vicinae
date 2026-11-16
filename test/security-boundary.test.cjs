const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "..", "src", "security.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const helperModule = { exports: {} };
new Function("exports", "module", compiled)(helperModule.exports, helperModule);
const { fetchWithSafeRedirects, getRedirectRequest, parseConfiguredBaseUrl, resolveAllowedUrl } = helperModule.exports;

function response(status, location, url) {
  return { status, url, headers: new Headers(location ? { location } : {}) };
}

function requesterFrom(responses) {
  const calls = [];
  return {
    calls,
    request: async (url, init) => {
      calls.push({ url, init });
      return responses.shift();
    },
  };
}

test("accepts HTTPS local hosts, ports, and installation paths", () => {
  assert.equal(parseConfiguredBaseUrl(" https://cloud.local:8443/nextcloud/ "), "https://cloud.local:8443/nextcloud");
});

test("rejects unsafe or ambiguous configuration", () => {
  for (const value of ["http://cloud.local", "https://user:pass@cloud.local", "https://cloud.local?x=1", "https://cloud.local/#x", "not a url %%"]) {
    assert.throws(() => parseConfiguredBaseUrl(value));
  }
});

test("rejects foreign or downgrade initial pagination before request", () => {
  assert.throws(() => resolveAllowedUrl("https://evil.test/page", "https://cloud.local/nextcloud", "https://cloud.local/nextcloud/activity"));
  assert.throws(() => resolveAllowedUrl("http://cloud.local/page", "https://cloud.local/nextcloud", "https://cloud.local/nextcloud/activity"));
});

test("resolves relative pagination and relative redirects from the actual response URL", async () => {
  const mocked = requesterFrom([
    response(302, "/nextcloud/activity?page=2", "https://cloud.local/nextcloud/activity?page=1"),
    response(200, null, "https://cloud.local/nextcloud/activity?page=2"),
  ]);
  const result = await fetchWithSafeRedirects("https://cloud.local/nextcloud/activity?page=1", "https://cloud.local/nextcloud", { method: "GET" }, mocked.request);
  assert.equal(result.status, 200);
  assert.equal(mocked.calls[1].url, "https://cloud.local/nextcloud/activity?page=2");
});

test("rejects foreign and downgrade redirects and returns non-redirect 3xx", async () => {
  for (const location of ["https://evil.test/steal", "http://cloud.local/cleartext"]) {
    const mocked = requesterFrom([response(302, location, "https://cloud.local/nextcloud/start")]);
    await assert.rejects(fetchWithSafeRedirects("https://cloud.local/nextcloud/start", "https://cloud.local/nextcloud", {}, mocked.request));
    assert.equal(mocked.calls.length, 1);
  }
  const mocked = requesterFrom([response(300, "/nextcloud/choices", "https://cloud.local/nextcloud/start")]);
  const result = await fetchWithSafeRedirects("https://cloud.local/nextcloud/start", "https://cloud.local/nextcloud", {}, mocked.request);
  assert.equal(result.status, 300);
  assert.equal(mocked.calls.length, 1);
});

test("bounds redirect loops", async () => {
  const mocked = requesterFrom(Array.from({ length: 12 }, () => response(307, "/nextcloud/loop", "https://cloud.local/nextcloud/loop")));
  const result = await fetchWithSafeRedirects("https://cloud.local/nextcloud/loop", "https://cloud.local/nextcloud", {}, mocked.request);
  assert.equal(result.status, 307);
  assert.equal(mocked.calls.length, 11);
});

test("applies standard redirect method, body, and header semantics", () => {
  const base = { method: "PROPFIND", body: "<xml/>", headers: { "Content-Type": "text/xml", "Content-Length": "6", Authorization: "Basic synthetic" } };
  for (const status of [301, 302, 307, 308]) {
    const next = getRedirectRequest(status, base);
    assert.equal(next.method, "PROPFIND");
    assert.equal(next.body, "<xml/>");
    assert.equal(next.headers.get("authorization"), "Basic synthetic");
  }
  const post = getRedirectRequest(301, { ...base, method: "POST" });
  assert.equal(post.method, "GET");
  assert.equal(post.body, undefined);
  assert.equal(post.headers.get("content-type"), null);
  assert.equal(post.headers.get("content-length"), null);
  for (const method of ["POST", "PROPFIND"]) {
    const next = getRedirectRequest(303, { ...base, method });
    assert.equal(next.method, "GET");
    assert.equal(next.body, undefined);
  }
  for (const method of ["GET", "HEAD"]) assert.equal(getRedirectRequest(303, { ...base, method }).method, method);
});
