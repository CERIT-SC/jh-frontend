/**
 * @fileoverview Dev fixture: a broken `spawn_options` payload.
 *
 * Exercises the visible-problem semantics: unsupported `version: 2` (warning),
 * an empty catalog (BLOCKING — Start disabled), and a cpu group whose
 * `enabled` is not exactly `true` (hidden).
 */

import type { SpawnWire } from "@src-types/spawnOptions";
import type { InstanceFixture } from "./index";

export const broken: InstanceFixture = {
  wire: {
    spawn_options: {
      version: 2,
      image: {
        categories: [],
      },
      resources: {
        cpu: {
          // Not exactly `true` → the group is disabled (strict semantics).
          enabled: "yes" as unknown as true,
        },
      },
    },
  } satisfies SpawnWire,
};
