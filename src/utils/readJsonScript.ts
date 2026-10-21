/**
 * @fileoverview Read a JSON payload from a non-executed script element.
 *
 * Free-text values (announcement) and spawn data travel as escaped JSON in
 * `<script type="application/json">` elements — never interpolated into JS
 * string literals. Readers never throw.
 */

/**
 * Reads and parses the JSON content of `#<id>`.
 * @returns undefined when the element is absent, empty, or unparseable.
 */
export function readJsonScript<T = unknown>(id: string): T | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const element = document.getElementById(id);
  if (!(element instanceof HTMLScriptElement)) {
    return undefined;
  }
  if (element.type !== "application/json") {
    return undefined;
  }
  const text = element.textContent;
  if (!text || text.trim() === "") {
    return undefined;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}
