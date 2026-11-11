/**
 * @fileoverview Dev fixture: a future minimal instance — image + delete-home
 * only. Exercises the omitted-group semantics: no `resources`, no `docs`
 * (hidden help buttons), every other group omitted (disabled).
 */

import type { SpawnWire } from "@src-types/spawnOptions";
import type { InstanceFixture } from "./index";

export const minimal: InstanceFixture = {
  wire: {
    user_options: {},
    spawn_options: {
      version: 1,
      image: {
        default: "cerit.io/hubs/bioconductor:2024-11-21",
        categories: [
          {
            key: "images",
            name: "Images",
            images: [
              {
                value: "cerit.io/hubs/bioconductor:2024-11-21",
                name: "Bioconductor Jupyter",
              },
              {
                value: "cerit.io/cerit/rstudio-bioconductor:4.3.1",
                name: "RStudio with R 4.3.1",
              },
            ],
          },
        ],
      },
      storage: {
        delete_home: { enabled: true },
      },
    },
  } satisfies SpawnWire,
};
