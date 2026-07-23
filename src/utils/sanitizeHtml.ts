/**
 * Sanitizes HTML strings to prevent XSS attacks.
 * Strips dangerous elements (script, iframe, object, embed, link[rel=stylesheet])
 * and removes on* event handlers and javascript: URLs from attributes.
 */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Strip dangerous elements
  doc
    .querySelectorAll("script, iframe, object, embed, link[rel=stylesheet]")
    .forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (
        attr.name.startsWith("on") ||
        attr.value.toLowerCase().includes("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}
