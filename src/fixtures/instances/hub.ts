/**
 * @fileoverview Dev fixture: the hub — the wire EXACTLY as the new form.py
 * emits it (`user_options` from a previous spawn + the `spawn_options`
 * configured in the hub's values). `instance: {}` mirrors production: the
 * root templates always emit `#instance-config`, and a hub without
 * `template_vars["instance"]` renders `{}` — which behaves as "no instance
 * config" (legacy widgets on).
 *
 * There is no fallback in the frontend: this fixture is what makes the hub
 * profile render, and a page without it renders the blocked, empty form.
 */

import type { SpawnWire } from "@src-types/spawnOptions";
import type { InstanceFixture } from "./index";

export const hub: InstanceFixture = {
  // `instance: {}` mirrors production: the root templates always emit
  // #instance-config, and a hub without template_vars["instance"] renders
  // `{}` — which behaves as "no instance config" (legacy widgets on).
  instance: {},
  wire: {
    user_options: {
      container_image: "cerit.io/hubs/datasciencenb:26-09-2024",
      ssh: false,
      phome: "remain",
      mountprojects: false,
      home: null,
      cpu: "4",
      mem: "4",
      gpu: "undefined",
      shmsize: "4",
    },
    spawn_options: {
      version: 1,
      image: {
        registry_prefix: "cerit.io/hubs/",
        default: "datasciencenb:26-09-2024",
        categories: [
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
                value: "datasciencenb:2026-01-23-ai",
                name: "DataScience NB with AI",
              },
              {
                value: "datasciencenb:31-10-2024-ssh",
                name: "DataScience NB with SSH access",
              },
              {
                value: "datasciencenb:2025-05-30-nrp",
                name: "DataScience NB NRP",
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
                value: "tensorflowgpu:2.12.1",
                name: "TensorFlow 2.12.1 with GPU and TensorBoard",
              },
              {
                value: "tensorflowgpu:2.15.0",
                name: "TensorFlow 2.15.1 with GPU and TensorBoard",
              },
              {
                value: "tensorflowgpu:2.17.0",
                name: "TensorFlow 2.17.0 with GPU and TensorBoard",
              },
              { value: "pytorchgpu:2.4.1", name: "Pytorch 2.4.1" },
              { value: "nvidia-pytorch:2.5.0", name: "NVIDIA Pytorch 2.5.0" },
              {
                value: "nvidia-tensorflow:2.16.1",
                name: "NVIDIA Tensorflow 2.16.1",
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
              { value: "cuda-ubuntu:11.8-22.04", name: "CUDA 11.8" },
              { value: "cuda-ubuntu:12.0-24.04", name: "CUDA 12.0" },
              { value: "cuda-ubuntu:12.1-22.04", name: "CUDA 12.1" },
              { value: "cuda-ubuntu:12.2-22.04", name: "CUDA 12.2" },
              { value: "cuda-ubuntu:12.3-22.04", name: "CUDA 12.3" },
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
        ssh: { enabled: true },
      },
      storage: {
        persistent_home: { enabled: true },
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
          default_endpoint: "https://s3.cloud.e-infra.cz",
          console_url: "https://s3-ui.cloud.e-infra.cz/",
        },
        delete_home: { enabled: false },
      },
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
            { value: "mig-1g.10gb", name: "MIG (10GB)" },
            { value: "mig-2g.20gb", name: "MIG (20GB)" },
            { value: "a10", name: "A10 Dedicated (24GB)" },
            { value: "a40", name: "A40 Dedicated (48GB)" },
            { value: "a100", name: "A100 Dedicated (80GB)" },
            { value: "h100-80", name: "H100 Dedicated (80GB)" },
            { value: "h100-94", name: "H100 Dedicated (94GB)" },
            { value: "any", name: "Any Dedicated" },
          ],
          default: "none",
          mig_default_amount: 1,
          live_status: true,
        },
      },
      fields: [],
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
};
