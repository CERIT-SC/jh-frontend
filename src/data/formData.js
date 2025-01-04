export const selectOptionsStorage = {
  "brno12-cerit": "brno12-cerit",
  "brno11-elixir": "brno11-elixir",
  "brno14-ceitec": "brno14-ceitec",
  brno2: "brno2",
  budejovice1: "budejovice1",
  "du-cesnet": "du-cesnet",
  "liberec3-tul": "liberec3-tul",
  plzen1: "plzen1",
  "plzen4-ntis": "plzen4-ntis",
  praha1: "praha1",
  "praha2-natur": "praha2-natur",
  "praha5-elixir": "praha5-elixir",
  "praha6-fzu": "praha6-fzu",
  "pruhonice1-ibot": "pruhonice1-ibot",
  "vestec1-elixir": "vestec1-elixir",
};

export const images = {
  simple: {
    "minimalnb:26-09-2024": "Minimal NB",
    "minimalnb:02-01-2025-ai": "Minimal NB with AI",
    "minimalnb:26-09-2024-ssh": "Minimal NB with SSH access",
    "minimalnb-cs:31-10-2024": "Minimal NB with Integrated VS Code",
    "minimalnb-cs:17-11-2024-ai": "Minimal NB with Integrated VS Code and AI",
    "datasciencenb:26-09-2024": "DataScience NB",
    "datasciencenb:31-10-2024-ssh": "DataScience NB with SSH access",
  },
  r: {
    "jupyterhubronly:05-02-2024": "Python 3.11 and R 4.3.1 kernels",
    "rstudio:11-08-2022-7": "RStudio with R 4.2.1",
    "rstudio:4.2.1-rsat": "RStudio with R 4.2.1 and RSAT",
    "rstudio:4.3.1": "RStudio with R 4.3.1",
    "rstudio:4.4.0": "RStudio with R 4.4.0",
    "rstudio:4.4.1": "RStudio with R 4.4.1",
    "rstudio:4.4.1-ai": "RStudio with R 4.4.1 and AI",
  },
  tf: {
    "tensorflownb:31-08-2023": "TensorFlow 2.10 (CPU only)",
    "tensorflowgpu:2.11.1": "TensorFlow 2.11.1 with GPU and TensorBoard",
    "tensorflowgpu:2.12.1": "TensorFlow 2.12.1 with GPU and TensorBoard",
    "tensorflowgpu:2.15.0": "TensorFlow 2.15.1 with GPU and TensorBoard",
    "tensorflowgpu:2.17.0": "TensorFlow 2.17.0 with GPU and TensorBoard",
    "pytorchgpu:2.4.1": "Pytorch 2.4.1",
    "nvidia-pytorch:2.5.0": "NVIDIA Pytorch 2.5.0",
    "nvidia-tensorflow:2.16.1": "NVIDIA Tensorflow 2.16.1",
  },
  matlab: {
    "matlab:r2022b": "MATLAB R2022b",
    "matlab:r2023a": "MATLAB R2023a",
    "matlab:r2024a": "MATLAB R2024a",
  },
  various: {
    "colab:2024-10-17": "Google Colab",
    "alphapose:2023-10-26": "Alphapose",
    "cuda-ubuntu:11.8-22.04": "CUDA 11.8",
    "cuda-ubuntu:12.0-24.04": "CUDA 12.0",
    "cuda-ubuntu:12.1-22.04": "CUDA 12.1",
    "cuda-ubuntu:12.2-22.04": "CUDA 12.2",
    "cuda-ubuntu:12.3-22.04": "CUDA 12.3",
    "cuda-ubuntu:12.4-22.04": "CUDA 12.4",
  },
  folding: {
    "colabfold:1.5.5": "Colabfold 1.5.5",
    "esmfold:2.0.0": "ESM Fold 2.0",
  },
};

export const sectionTitles = {
  simple: "Simple Jupyter Images",
  r: "R Images",
  tf: "TensorFlow Images",
  matlab: "Matlab Images",
  various: "Various Images",
  folding: "Folding Images",
};

export const formImagesName = {
  simple: "simplenbname",
  r: "rnbname",
  tf: "tfnbname",
  matlab: "matlabnbname",
  various: "varnbname",
  folding: "foldnbname",
};

export const gpu_instance = {
  none: "None",
  "mig-1g.10gb": "10GB part A100",
  "mig-2g.20gb": "20GB part A100",
  a10: "whole A10",
  a40: "whole A40",
  a100: "whole A100",
  "h100-80": "whole H100 (80GB)",
  "h100-94": "whole H100 (94GB)",
  any: "any whole gpu",
};
