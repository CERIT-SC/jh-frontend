/**
 * @fileoverview Pure validator for `instance.pages.login` — the configured
 * content of the shared login card.
 *
 * Semantics (mirrors the instance-config contract):
 * - Absent (`undefined`) → `content: undefined`; the page renders the
 *   brand's own login slot (today's origin page).
 * - Explicit object, even `{}` → opts into the generic configured page with
 *   defaults; origin membership text is never synthesized.
 * - Explicit non-object → generic defaults plus a non-blocking problem.
 * - Invalid entries are dropped or defaulted with non-blocking problems;
 *   this content can never disable the sign-in button.
 *
 * Pure and DOM-free: the page URL is passed in by the caller.
 */

import type { LoginContent } from "@src-types/instanceConfig";
import type { ConfigProblem } from "@src-types/spawnOptions";
import { asHttpUrl, resolveConfigLogo } from "@utils/configLogo";

/** Defaults of the generic configured page (`{}` opts into these). */
const DEFAULTS = {
  heading: "Welcome to JupyterHub",
  subtitle: "Sign in to access your JupyterHub workspace",
  button_text: "Sign in",
} as const;

/** Page URL used for relative-URL resolution when no browser is present. */
export const FALLBACK_PAGE_URL = "https://localhost/";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Resolves `value` (the wire content of `pages.login`) against `pageUrl`.
 * Never throws; invalid content degrades to defaults with problems.
 */
export function resolveLoginContent(
  value: unknown,
  pageUrl: string,
): { content: LoginContent | undefined; problems: ConfigProblem[] } {
  // Absent block → the brand slot renders (no generic page, no problems).
  if (value === undefined) {
    return { content: undefined, problems: [] };
  }

  const problems: ConfigProblem[] = [];

  if (!isRecord(value)) {
    problems.push({
      message:
        "instance.pages.login is present but not an object — using the generic login page.",
      blocking: false,
    });
    return { content: emptyContent(), problems };
  }

  const content = emptyContent();

  content.heading = nonEmptyString(value.heading)
    ? value.heading.trim()
    : DEFAULTS.heading;
  if (value.heading !== undefined && !nonEmptyString(value.heading)) {
    problems.push({
      message: "instance.pages.login.heading is invalid — using the default.",
      blocking: false,
    });
  }

  // Whitespace-only subtitle is a deliberate empty subtitle (hidden);
  // a non-string falls back to the default.
  if (typeof value.subtitle === "string") {
    content.subtitle = value.subtitle.trim();
  } else if (value.subtitle !== undefined) {
    content.subtitle = DEFAULTS.subtitle;
    problems.push({
      message: "instance.pages.login.subtitle is invalid — using the default.",
      blocking: false,
    });
  }

  content.button_text = nonEmptyString(value.button_text)
    ? value.button_text.trim()
    : DEFAULTS.button_text;
  if (value.button_text !== undefined && !nonEmptyString(value.button_text)) {
    problems.push({
      message:
        "instance.pages.login.button_text is invalid — using the default.",
      blocking: false,
    });
  }

  content.paragraphs = stringList(value.paragraphs, problems, "paragraphs");

  const links =
    isRecord(value) && Array.isArray(value.links) ? value.links : [];
  if (value.links !== undefined && !Array.isArray(value.links)) {
    problems.push({
      message: "instance.pages.login.links is not a list — links omitted.",
      blocking: false,
    });
  }
  content.links = [];
  for (const entry of links) {
    const link = asLink(entry, pageUrl, problems);
    if (link) {
      content.links.push(link);
    }
  }

  const logo = resolveConfigLogo(
    value.logo,
    pageUrl,
    "instance.pages.login.logo",
    problems,
  );
  if (logo) {
    content.logo = logo;
  }

  return { content, problems };
}

/** The generic configured page's shape before field resolution. */
function emptyContent(): LoginContent {
  return {
    heading: DEFAULTS.heading,
    subtitle: DEFAULTS.subtitle,
    paragraphs: [],
    links: [],
    button_text: DEFAULTS.button_text,
  };
}

/** Keeps trimmed nonempty strings in order; drops everything else. */
function stringList(
  value: unknown,
  problems: ConfigProblem[],
  what: string,
): string[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    problems.push({
      message: `instance.pages.login.${what} is not a list — ${what} omitted.`,
      blocking: false,
    });
    return [];
  }
  const items: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && entry.trim() !== "") {
      items.push(entry.trim());
    } else {
      problems.push({
        message: `Invalid entry ignored in instance.pages.login.${what}.`,
        blocking: false,
      });
    }
  }
  return items;
}

/**
 * Resolves a link against `pageUrl`; keeps HTTP(S) URLs without credentials.
 * Relative hrefs are allowed and stored resolved; other schemes are rejected.
 */
function asLink(
  value: unknown,
  pageUrl: string,
  problems: ConfigProblem[],
): { label: string; href: string } | undefined {
  if (!isRecord(value)) {
    problems.push({
      message: "Invalid entry ignored in instance.pages.login.links.",
      blocking: false,
    });
    return undefined;
  }
  if (!nonEmptyString(value.label) || !nonEmptyString(value.href)) {
    problems.push({
      message: "Invalid entry ignored in instance.pages.login.links.",
      blocking: false,
    });
    return undefined;
  }
  const url = asHttpUrl(
    value.href,
    pageUrl,
    "instance.pages.login.links",
    problems,
  );
  if (!url) {
    return undefined;
  }
  return { label: value.label.trim(), href: url.toString() };
}
