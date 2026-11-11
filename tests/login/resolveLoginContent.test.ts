import { describe, test, expect } from "bun:test";
import { resolveLoginContent } from "../../src/routes/login/config/resolveLoginContent";
import type { ConfigProblem } from "../../src/types/spawnOptions";

const PAGE_URL = "https://hub.example/hub/login";

const DEFAULT_HEADING = "Welcome to JupyterHub";
const DEFAULT_SUBTITLE = "Sign in to access your JupyterHub workspace";
const DEFAULT_BUTTON = "Sign in";

/** Login problems must never block the sign-in button. */
function expectNonblocking(problems: ConfigProblem[]): void {
  for (const problem of problems) {
    expect(problem.blocking).toBe(false);
  }
}

describe("resolveLoginContent — absent vs explicit", () => {
  test("absent login block resolves to undefined with no problems", () => {
    const result = resolveLoginContent(undefined, PAGE_URL);
    expect(result.content).toBeUndefined();
    expect(result.problems).toEqual([]);
  });

  test("empty object opts into generic defaults, never origin membership text", () => {
    const result = resolveLoginContent({}, PAGE_URL);
    expect(result.content).toEqual({
      heading: DEFAULT_HEADING,
      subtitle: DEFAULT_SUBTITLE,
      paragraphs: [],
      links: [],
      button_text: DEFAULT_BUTTON,
    });
    expect(result.content?.paragraphs.join(" ")).not.toContain("MetaCentrum");
    expectNonblocking(result.problems);
  });

  test.each([null, "nope", 42])(
    "malformed explicit value %p falls back to generic defaults with a problem",
    (value) => {
      const result = resolveLoginContent(value, PAGE_URL);
      expect(result.content?.heading).toBe(DEFAULT_HEADING);
      expect(result.content?.button_text).toBe(DEFAULT_BUTTON);
      expect(result.content?.paragraphs).toEqual([]);
      expect(result.problems.length).toBeGreaterThan(0);
      expectNonblocking(result.problems);
    },
  );

  test("malformed array values fall back to generic defaults with a problem", () => {
    for (const value of [[], ["nope"]]) {
      const result = resolveLoginContent(value, PAGE_URL);
      expect(result.content?.heading).toBe(DEFAULT_HEADING);
      expect(result.problems.length).toBeGreaterThan(0);
      expectNonblocking(result.problems);
    }
  });

  test("partial config fills only the missing fields", () => {
    const result = resolveLoginContent({ heading: "CAS Hub" }, PAGE_URL);
    expect(result.content).toEqual({
      heading: "CAS Hub",
      subtitle: DEFAULT_SUBTITLE,
      paragraphs: [],
      links: [],
      button_text: DEFAULT_BUTTON,
    });
  });
});

describe("resolveLoginContent — text fields", () => {
  test("whitespace-only heading and button fall back to defaults", () => {
    const result = resolveLoginContent(
      { heading: "   ", button_text: null },
      PAGE_URL,
    );
    expect(result.content?.heading).toBe(DEFAULT_HEADING);
    expect(result.content?.button_text).toBe(DEFAULT_BUTTON);
  });

  test("empty subtitle is allowed and hidden; invalid subtitle uses the default", () => {
    const empty = resolveLoginContent({ subtitle: "   " }, PAGE_URL);
    expect(empty.content?.subtitle).toBe("");

    const invalid = resolveLoginContent({ subtitle: 5 }, PAGE_URL);
    expect(invalid.content?.subtitle).toBe(DEFAULT_SUBTITLE);
  });

  test("keeps nonempty paragraphs in order, drops invalid entries", () => {
    const result = resolveLoginContent(
      { paragraphs: ["First.", 42, "   ", null, "Second."] },
      PAGE_URL,
    );
    expect(result.content?.paragraphs).toEqual(["First.", "Second."]);
    expect(result.problems.length).toBeGreaterThan(0);
    expectNonblocking(result.problems);
  });
});

describe("resolveLoginContent — links", () => {
  test("keeps valid https and relative links, normalizes relative hrefs", () => {
    const result = resolveLoginContent(
      {
        links: [
          { label: "Docs", href: "https://docs.example/guide" },
          { label: "Support", href: "/support" },
        ],
      },
      PAGE_URL,
    );
    expect(result.content?.links).toEqual([
      { label: "Docs", href: "https://docs.example/guide" },
      { label: "Support", href: "https://hub.example/support" },
    ]);
  });

  test.each([
    { label: "", href: "https://docs.example/x" },
    { label: "JS", href: "javascript:alert(1)" },
    { label: "Data", href: "data:text/html,<h1>x</h1>" },
    { label: "Creds", href: "https://user:pass@docs.example/x" },
    { label: "FTP", href: "ftp://docs.example/x" },
    { label: "Empty", href: "   " },
    { label: "NoHref" },
  ])("drops invalid link %p with a problem", (link) => {
    const result = resolveLoginContent({ links: [link] }, PAGE_URL);
    expect(result.content?.links).toEqual([]);
    expect(result.problems.length).toBeGreaterThan(0);
    expectNonblocking(result.problems);
  });

  test("rejects a non-array links value", () => {
    const result = resolveLoginContent(
      { links: "https://docs.example" },
      PAGE_URL,
    );
    expect(result.content?.links).toEqual([]);
    expect(result.problems.length).toBeGreaterThan(0);
  });
});

describe("resolveLoginContent — logo", () => {
  const LOGO_PATH = "/static/custom-images/bioconductor_logo.svg";

  test("accepts a same-origin absolute logo path", () => {
    const result = resolveLoginContent(
      { logo: { src: LOGO_PATH, alt: "Bioconductor" } },
      PAGE_URL,
    );
    expect(result.content?.logo).toEqual({
      src: `https://hub.example${LOGO_PATH}`,
      alt: "Bioconductor",
    });
  });

  test("resolves a relative logo against the page URL", () => {
    const result = resolveLoginContent(
      { logo: { src: "images/logo.svg", alt: "Logo" } },
      PAGE_URL,
    );
    expect(result.content?.logo?.src).toBe(
      "https://hub.example/hub/images/logo.svg",
    );
  });

  test("accepts an absolute same-origin URL with optional dark variant", () => {
    const result = resolveLoginContent(
      {
        logo: {
          src: `https://hub.example${LOGO_PATH}`,
          dark_src: `https://hub.example${LOGO_PATH}`,
          alt: "Bioconductor",
        },
      },
      PAGE_URL,
    );
    expect(result.content?.logo?.dark_src).toBe(
      `https://hub.example${LOGO_PATH}`,
    );
  });

  test.each([
    "https://evil.example/logo.svg",
    "//evil.example/logo.svg",
    "https://user:pass@hub.example/logo.svg",
    "data:image/svg+xml;base64,PHN2Zy8+",
    "javascript:void(0)",
    "   ",
  ])("rejects logo src %p and omits the logo", (src) => {
    const result = resolveLoginContent(
      { logo: { src, alt: "Logo" } },
      PAGE_URL,
    );
    expect(result.content?.logo).toBeUndefined();
    expect(result.problems.length).toBeGreaterThan(0);
    expectNonblocking(result.problems);
  });

  test("rejects a logo without alt text", () => {
    const result = resolveLoginContent({ logo: { src: LOGO_PATH } }, PAGE_URL);
    expect(result.content?.logo).toBeUndefined();
    expect(result.problems.length).toBeGreaterThan(0);
  });

  test("accepts a same-origin protocol-relative logo URL", () => {
    const result = resolveLoginContent(
      {
        logo: {
          src: "//hub.example/static/custom-images/logo.svg",
          alt: "Logo",
        },
      },
      PAGE_URL,
    );
    expect(result.content?.logo?.src).toBe(
      "https://hub.example/static/custom-images/logo.svg",
    );
  });

  test("invalid dark_src falls back to the light logo with a problem", () => {
    const result = resolveLoginContent(
      {
        logo: {
          src: LOGO_PATH,
          dark_src: "https://evil.example/dark.svg",
          alt: "Bioconductor",
        },
      },
      PAGE_URL,
    );
    expect(result.content?.logo).toEqual({
      src: `https://hub.example${LOGO_PATH}`,
      alt: "Bioconductor",
    });
    expect(result.problems.length).toBeGreaterThan(0);
    expectNonblocking(result.problems);
  });

  test("rejects a non-object logo value", () => {
    const result = resolveLoginContent({ logo: "logo.svg" }, PAGE_URL);
    expect(result.content?.logo).toBeUndefined();
    expect(result.problems.length).toBeGreaterThan(0);
  });
});
