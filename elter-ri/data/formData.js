export const images = {
  simple: {
    "minimalnb:31-08-2023": "Minimal NB",
    "minimalnb:26-09-2024-ssh": "Minimal NB with SSH access",
    "datasciencenb:31-08-2023": "DataScience NB",
  },
  r: {
    "jupyterhubronly:05-02-2024": "Python 3.11 and R 4.3.1 kernels",
    "rstudio:11-08-2022-7": "RStudio with R 4.2.1",
    "rstudio:4.2.1-rsat": "RStudio with R 4.2.1 and RSAT",
    "rstudio:4.3.1": "RStudio with R 4.3.1",
    "rstudio:4.4.0": "RStudio with R 4.4.0",
  },
  tf: {
    "tensorflownb:31-08-2023": "TensorFlow 2.10 (CPU only)",
    "tensorflowgpu:2.11.1": "TensorFlow 2.11.1 with GPU and TensorBoard",
    "tensorflowgpu:2.12.1": "TensorFlow 2.12.1 with GPU and TensorBoard",
    "tensorflowgpu:2.15.0": "TensorFlow 2.15.1 with GPU and TensorBoard",
  },
  matlab: {
    "matlab:r2022b": "MATLAB R2022b",
    "matlab:r2023a": "MATLAB R2023a",
  },
  various: {
    "cuda-ubuntu:12.0-24.04": "CUDA 12.0",
  },
};

export const sectionTitles = {
  simple: "Simple Jupyter Images",
  r: "R Images",
  tf: "TensorFlow Images",
  matlab: "MATLAB Images",
  various: "Various Images",
};

export const defaultImagesName = {
  simple: "simplenb",
  r: "rnb",
  tf: "tfnb",
  matlab: "matlabnb",
  various: "variousnb",
};

export const formImagesName = {
  simple: "simplenbname",
  r: "rnbname",
  tf: "tfnbname",
  matlab: "matlabnbname",
  various: "varnbname",
};

export const gpu_instance = {
  none: "None",
  "mig-1g.10gb": "10GB part A100",
  "mig-2g.20gb": "20GB part A100",
  a10: "whole A10",
  a40: "whole A40",
  a100: "whole A100",
  any: "any whole gpu",
};