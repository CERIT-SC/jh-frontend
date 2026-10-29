import { describe, test, expect } from "bun:test";
import { overviewFieldWarning } from "../../src/routes/spawn/components/overviewFieldWarning";
import type { GenericField } from "../../src/types/spawnOptions";

function checkbox(name: string, warning?: string): GenericField {
  return {
    name,
    type: "checkbox",
    section: "storage",
    checked_value: "yes",
    summary_label: name,
    ...(warning !== undefined ? { warning } : {}),
  };
}

describe("overviewFieldWarning", () => {
  test("delete-home shows the short erase copy, never the long storage warning", () => {
    expect(overviewFieldWarning(checkbox("delhome", "LONG WARNING"))).toBe(
      "Will erase if exists",
    );
    expect(overviewFieldWarning(checkbox("delhome"))).toBe(
      "Will erase if exists",
    );
  });

  test("other checkboxes keep their full configured warning", () => {
    expect(overviewFieldWarning(checkbox("other", "Full warning"))).toBe(
      "Full warning",
    );
  });

  test("checkboxes without a warning show none", () => {
    expect(overviewFieldWarning(checkbox("other"))).toBeUndefined();
  });

  test("non-checkbox fields show no overview warning", () => {
    const select: GenericField = {
      name: "mode",
      type: "select",
      section: "image",
      summary_label: "Mode",
      options: [{ value: "a", name: "A" }],
      warning: "Full warning",
    };
    expect(overviewFieldWarning(select)).toBeUndefined();
  });
});
