/**
 * @fileoverview Shared validator for configured logo blocks
 * (`instance.pages.*.logo`) — the login card, the header and the footer.
 *
 * Same-origin HTTP(S) or external HTTPS without credentials only, mirroring
 * the pages' CSP `img-src 'self' data: blob: https:`. Pure and DOM-free:
 * the page URL is passed in by the caller. Never throws; invalid content
 * degrades to "omitted" with non-blocking problems.
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
 * Resolves a configured logo against `pageUrl`; same-origin HTTP(S) or
 * external HTTPS without credentials only. `path` names the block in problem
 * messages (e.g. `instance.pages.login.logo`). An invalid primary logo omits
 * the logo; an invalid `dark_src` falls back to the light source.
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
  const src = asLogoUrl(value.src, pageUrl, path, problems);
  if (!src) {
    return undefined;
  }
  const logo: ConfigLogo = {
    src: src.toString(),
    alt: value.alt.trim(),
  };
  if (nonEmptyString(value.dark_src)) {
    const dark = asLogoUrl(
      value.dark_src,
      pageUrl,
      `${path}.dark_src`,
      problems,
    );
    if (dark) {
      logo.dark_src = dark.toString();
    }
    // An invalid dark source keeps the light source (asLogoUrl already
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
 * Logo URL rule: resolves `raw` against `pageUrl` via the shared HTTP(S)
 * rule, then requires the result to be same-origin or https — the pages'
 * CSP is `img-src 'self' data: blob: https:`, so an external http:// URL
 * could never load.
 */
function asLogoUrl(
  raw: string,
  pageUrl: string,
  path: string,
  problems: ConfigProblem[],
): URL | undefined {
  const url = asHttpUrl(raw, pageUrl, path, problems);
  if (!url) {
    return undefined;
  }
  if (url.origin !== new URL(pageUrl).origin && url.protocol !== "https:") {
    problems.push({
      message: `${path} must be same-origin or https (page CSP is img-src 'self' https:).`,
      blocking: false,
    });
    return undefined;
  }
  return url;
}

/**
 * Shared URL rule: resolves `raw` against `pageUrl`; must resolve to
 * HTTP(S) without credentials. `path` names the field in problem messages.
 */
export function asHttpUrl(
  raw: string,
  pageUrl: string,
  path: string,
  problems: ConfigProblem[],
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
  return url;
}
