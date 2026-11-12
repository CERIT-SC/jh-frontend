/**
 * @fileoverview Shared validator for configured logo blocks
 * (`instance.pages.*.logo`) — the login card and the footer.
 *
 * Same-origin HTTP(S) without credentials only, mirroring the pages' CSP
 * `img-src 'self' data: blob:`. Pure and DOM-free: the page URL is passed
 * in by the caller. Never throws; invalid content degrades to "omitted"
 * with non-blocking problems.
 */

import type { ConfigLogo } from "@src-types/instanceConfig";
import type { ConfigProblem } from "@src-types/spawnOptions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Resolves a configured logo against `pageUrl`; same-origin HTTP(S) without
 * credentials only. `path` names the block in problem messages (e.g.
 * `instance.pages.login.logo`). An invalid primary logo omits the logo; an
 * invalid `dark_src` falls back to the light source.
 */
export function resolveConfigLogo(
  value: unknown,
  pageUrl: string,
  path: string,
  problems: ConfigProblem[],
): ConfigLogo | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isRecord(value)) {
    problems.push({
      message: `${path} is invalid — logo omitted.`,
      blocking: false,
    });
    return undefined;
  }
  if (!nonEmptyString(value.alt) || !nonEmptyString(value.src)) {
    problems.push({
      message: `${path} is invalid — logo omitted.`,
      blocking: false,
    });
    return undefined;
  }
  const src = asHttpUrl(value.src, pageUrl, path, problems, true);
  if (!src) {
    return undefined;
  }
  const logo: ConfigLogo = {
    src: src.toString(),
    alt: value.alt.trim(),
  };
  if (nonEmptyString(value.dark_src)) {
    const dark = asHttpUrl(
      value.dark_src,
      pageUrl,
      `${path}.dark_src`,
      problems,
      true,
    );
    if (dark) {
      logo.dark_src = dark.toString();
    }
    // An invalid dark source keeps the light source (asHttpUrl already
    // recorded the problem).
  } else if (value.dark_src !== undefined) {
    problems.push({
      message: `${path}.dark_src is invalid — using the light logo.`,
      blocking: false,
    });
  }
  return logo;
}

/**
 * Shared URL rule: resolves `raw` against `pageUrl`; must resolve to
 * HTTP(S) without credentials. When `sameOrigin` is true the resolved origin
 * must equal the page's origin (logos); links may point anywhere HTTP(S).
 * `path` names the field in problem messages.
 */
export function asHttpUrl(
  raw: string,
  pageUrl: string,
  path: string,
  problems: ConfigProblem[],
  sameOrigin: boolean,
): URL | undefined {
  let url: URL;
  try {
    url = new URL(raw, pageUrl);
  } catch {
    problems.push({
      message: `Invalid URL ignored in ${path}.`,
      blocking: false,
    });
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    problems.push({
      message: `Only http(s) URLs are allowed in ${path}.`,
      blocking: false,
    });
    return undefined;
  }
  if (url.username !== "" || url.password !== "") {
    problems.push({
      message: `URLs with credentials are not allowed in ${path}.`,
      blocking: false,
    });
    return undefined;
  }
  if (sameOrigin && url.origin !== new URL(pageUrl).origin) {
    problems.push({
      message: `${path} must be same-origin (page CSP is img-src 'self').`,
      blocking: false,
    });
    return undefined;
  }
  return url;
}
