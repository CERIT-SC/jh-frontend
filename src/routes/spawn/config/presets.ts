/**
 * @fileoverview Delete-home field preset.
 *
 * `storage.delete_home` is rendered through the generic field primitive
 * (decision 11). Copy comes verbatim from the cas StorageSection delhome
 * block; the POST value is frozen (`"delete"` — the only value cas'
 * `pre_spawn` acts on). Never prefilled from previous `user_options`.
 */

import type { GenericField, SpawnOptions } from "@src-types/spawnOptions";

/** Copy used when the backend omits `delete_home.label` / `.warning`. */
export const DELETE_HOME_DEFAULTS: { label: string; warning: string } = {
  label: "Delete home directory",
  warning:
    "Consider thoroughly checking this option — it removes the whole home directory and all data located there (/home/jovyan/). Use only when the notebook is broken so it does not start. In other cases, remove data from a terminal inside the notebook.",
};

/** Builds the delete-home generic field from the schema group. */
export function deleteHomeField(
  cfg: SpawnOptions["storage"]["delete_home"],
): GenericField {
  return {
    name: "delhome",
    type: "checkbox",
    section: "storage",
    checked_value: "delete",
    persist: false,
    summary_label: "Delete home",
    label: cfg.label,
    warning: cfg.warning,
  };
}
