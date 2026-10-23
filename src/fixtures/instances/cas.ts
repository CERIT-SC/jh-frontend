/**
 * @fileoverview Dev fixture: cas — the first adopter of the shared build.
 *
 * `spawn_options` mirrors Appendix A's values.yaml block (image + delete-home
 * + cpu/memory only; every other group omitted = disabled), plus the explicit
 * badge configuration (decision 22). `user_options.delhome` is present to
 * prove the delete-home field is NOT prefilled (destructive, persist: false).
 * cas sends full image refs with no registry prefix.
 */

import type { SpawnWire } from "@src-types/spawnOptions";
import type { InstanceConfigWire } from "@src-types/instanceConfig";
import type { InstanceFixture } from "./index";

export const cas: InstanceFixture = {
  wire: {
    user_options: {
      container_image: "cerit.io/cerit/rstudio-bioconductor:4.3.1",
      cpu: "1",
      mem: "4",
      delhome: "delete",
    },
    spawn_options: {
      version: 1,
      image: {
        // cas sends full refs — values must not get a prefix prepended.
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
                badges: ["RSt"],
              },
            ],
          },
        ],
        badge_config: {
          RSt: {
            abbr: "RSt",
            name: "RStudio",
            description: "RStudio IDE pre-installed.",
          },
        },
      },
      storage: {
        delete_home: { enabled: true },
      },
      resources: {
        cpu: {
          enabled: true,
          options: [1, 4, 6, 8, 10, 16, 24, 32],
          default: 1,
        },
        memory: { enabled: true, options: [4, 8, 16, 32, 64, 128], default: 4 },
      },
      docs: {
        image:
          "https://docs.cerit.io/en/docs/web-apps/jupyterhub#choosing-image",
        storage:
          "https://docs.cerit.io/en/docs/web-apps/jupyterhub#choosing-storage",
        resources:
          "https://docs.cerit.io/en/docs/web-apps/jupyterhub#resource-allocation",
      },
    },
  } satisfies SpawnWire,
  instance: {
    version: 1,
    brand: "origin",
    pages: { home: { gpu_indicators: false, resource_usage: false } },
  } satisfies InstanceConfigWire,
};
