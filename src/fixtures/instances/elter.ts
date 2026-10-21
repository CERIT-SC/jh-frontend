/**
 * @fileoverview Dev fixture: elter's real configuration expressed in the new
 * schema. DOCUMENTATION ONLY — derived by reading `elter-ri/src/routes/spawn/`
 * (formData.js, StorageSection, buildSpawnPayload) and
 * `elter-ri/src/routes/home/HomePage.tsx`; elter stays on its fork until its
 * migration (Deferred). Not used by any build.
 *
 * Notable deltas vs hub:
 * - an extra leading category `elter` ("eLTER") whose images the backend fills
 *   per request (the "highlighted category" is a deferred schema addition);
 * - `delhome` posts `"yes"` (not `"delete"`) → expressed as a generic field
 *   with `checked_value: "yes"`; elter's block has no warning copy;
 * - brand "elter" (renders the origin brand until the elter brand exists —
 *   expected);
 * - home page keeps GPU indicators + resource usage (elter's HomePage uses
 *   both).
 */

import type { SpawnWire } from "@src-types/spawnOptions";
import type { InstanceConfigWire } from "@src-types/instanceConfig";
import type { InstanceFixture } from "./index";

export const elter: InstanceFixture = {
  transport: "json-script",
  wire: {
    user_options: {},
    spawn_options: {
      version: 1,
      image: {
        registry_prefix: "cerit.io/hubs/",
        default: "datasciencenb:26-09-2024",
        categories: [
          {
            // eLTER tool images are backend-filled per request; the
            // "highlighted category" concept is a deferred schema addition.
            key: "elter",
            name: "eLTER",
            images: [],
          },
          {
            key: "simple",
            name: "Simple Jupyter Images",
            images: [
              { value: "minimalnb:28-01-2026-ai", name: "Minimal NB with AI" },
              {
                value: "minimalnb:01-02-2025",
                name: "Minimal NB with SSH access",
              },
              {
                value: "minimalnb-cs:31-10-2024",
                name: "Minimal NB with Integrated VS Code",
              },
              {
                value: "minimalnb-cs:06-02-2026-ai",
                name: "Minimal NB with Integrated VS Code and AI",
              },
              { value: "datasciencenb:26-09-2024", name: "DataScience NB" },
              {
                value: "datasciencenb:31-10-2024-ssh",
                name: "DataScience NB (SSH access)",
              },
              {
                value: "datasciencenb:2025-05-30-nrp",
                name: "DataScience NB for NRP",
              },
            ],
          },
          {
            key: "r",
            name: "R Images",
            images: [
              {
                value: "jupyterhubronly:05-02-2024",
                name: "Python 3.11 and R 4.3.1 kernels",
              },
              { value: "rstudio:11-08-2022-7", name: "RStudio with R 4.2.1" },
              {
                value: "rstudio:4.2.1-rsat",
                name: "RStudio with R 4.2.1 and RSAT",
              },
              { value: "rstudio:4.3.1", name: "RStudio with R 4.3.1" },
              { value: "rstudio:4.4.0", name: "RStudio with R 4.4.0" },
              { value: "rstudio:4.4.1", name: "RStudio with R 4.4.1" },
              {
                value: "rstudio:4.5.2-ai",
                name: "RStudio with R 4.5.2 and AI",
              },
            ],
          },
          {
            key: "tf",
            name: "TensorFlow Images",
            images: [
              {
                value: "tensorflownb:31-08-2023",
                name: "TensorFlow 2.10 (CPU only)",
              },
              {
                value: "tensorflowgpu:2.11.1",
                name: "TensorFlow 2.11.1 with GPU and TensorBoard",
              },
              {
                value: "tensorflowgpu:2.17.0",
                name: "TensorFlow 2.17.0 with GPU and TensorBoard",
              },
              { value: "pytorchgpu:2.4.1", name: "Pytorch 2.4.1" },
              {
                value: "nvidia-pytorch:2.5.0",
                name: "NVIDIA Pytorch 2.5.0 (SSH access)",
              },
              {
                value: "nvidia-tensorflow:2.16.1",
                name: "NVIDIA Tensorflow 2.16.1 (SSH access)",
              },
            ],
          },
          {
            key: "matlab",
            name: "Matlab Images",
            images: [
              { value: "matlab:r2022b", name: "MATLAB R2022b" },
              { value: "matlab:r2023a", name: "MATLAB R2023a" },
              { value: "matlab:r2024a", name: "MATLAB R2024a" },
            ],
          },
          {
            key: "various",
            name: "Various Images",
            images: [
              { value: "colab:2025-01-07", name: "Google Colab" },
              { value: "alphapose:2023-10-26", name: "Alphapose" },
              { value: "cuda-ubuntu:11.6-22.04", name: "CUDA 11.6" },
              { value: "cuda-ubuntu:12.4-22.04", name: "CUDA 12.4" },
            ],
          },
          {
            key: "folding",
            name: "Folding Images",
            images: [
              { value: "colabfold:1.5.5-cu12", name: "Colabfold 1.5.5" },
              { value: "esmfold:2.0.0", name: "ESM Fold 2.0" },
            ],
          },
        ],
        custom: {
          enabled: true,
          placeholder: "e.g., cerit.io/hubs/custom-image:latest",
        },
        ssh: {
          enabled: true,
          // per-request (derived from spawner.pod_name) — placeholder here.
          dns_domain: "",
        },
      },
      storage: {
        persistent_home: { enabled: true, existing: [] },
        metacentrum: {
          enabled: true,
          homes: [
            { value: "brno12-cerit", name: "brno12-cerit" },
            { value: "brno11-elixir", name: "brno11-elixir" },
            { value: "brno14-ceitec", name: "brno14-ceitec" },
            { value: "brno2", name: "brno2" },
            { value: "budejovice1", name: "budejovice1" },
            { value: "du-cesnet", name: "du-cesnet" },
            { value: "liberec3-tul", name: "liberec3-tul" },
            { value: "plzen1", name: "plzen1" },
            { value: "plzen4-ntis", name: "plzen4-ntis" },
            { value: "praha1", name: "praha1" },
            { value: "praha2-natur", name: "praha2-natur" },
            { value: "praha5-elixir", name: "praha5-elixir" },
            { value: "praha6-fzu", name: "praha6-fzu" },
            { value: "pruhonice1-ibot", name: "pruhonice1-ibot" },
            { value: "vestec1-elixir", name: "vestec1-elixir" },
          ],
        },
        projects: { enabled: true },
        s3: {
          enabled: true,
          buckets: [],
          default_endpoint: "https://s3.cloud.e-infra.cz",
          console_url: "https://s3-ui.cloud.e-infra.cz/",
        },
        // elter's delete-home posts "yes" → a generic field, not the preset.
        delete_home: { enabled: false },
      },
      fields: [
        {
          name: "delhome",
          type: "checkbox",
          section: "storage",
          label: "Delete home directory",
          checked_value: "yes",
          summary_label: "Delete home",
          persist: false,
        },
      ],
      resources: {
        cpu: {
          enabled: true,
          options: [1, 4, 6, 8, 10, 16, 24, 32, 48, 64, 80, 96],
          default: 1,
        },
        memory: {
          enabled: true,
          options: [4, 8, 16, 32, 64, 128, 256, 512, 768, 1024],
          default: 4,
        },
        gpu: {
          enabled: true,
          options: [
            { value: "none", name: "None" },
            { value: "mig-1g.10gb", name: "10GB part A100" },
            { value: "mig-2g.20gb", name: "20GB part A100" },
            { value: "a10", name: "whole A10" },
            { value: "a40", name: "whole A40" },
            { value: "a100", name: "whole A100" },
            { value: "h100-80", name: "whole H100 (80GB)" },
            { value: "h100-94", name: "whole H100 (94GB)" },
            { value: "any", name: "any whole gpu" },
          ],
          default: "none",
          mig_default_amount: 1,
          live_status: true,
        },
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
    brand: "elter",
    pages: { home: { gpu_indicators: true, resource_usage: true } },
  } satisfies InstanceConfigWire,
};
