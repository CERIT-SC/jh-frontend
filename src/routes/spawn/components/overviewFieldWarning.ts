/**
 * @fileoverview Overview-panel copy for a generic field's warning line.
 *
 * The Overview is a compact summary: the delete-home control shows the short
 * erase copy there (matching the original hub's "Erase if exists" toggle),
 * while the full warning stays in the storage section. Any other checkbox
 * keeps its full configured warning in both places.
 */

import type { GenericField } from "@src-types/spawnOptions";

/** Short overview copy for the delete-home control. */
export const DELETE_HOME_OVERVIEW_WARNING = "Will erase if exists";

/**
 * The warning the Overview shows for `field` once it is set, or undefined.
 * Called only for set values; checkboxes without a warning show none.
 */
export function overviewFieldWarning(field: GenericField): string | undefined {
  if (field.type !== "checkbox") {
    return undefined;
  }
  // The delete-home POST contract is frozen (name "delhome", value
  // "delete" — see config/presets.ts), so keying on the name is stable.
  if (field.name === "delhome") {
    return DELETE_HOME_OVERVIEW_WARNING;
  }
  return field.warning;
}
