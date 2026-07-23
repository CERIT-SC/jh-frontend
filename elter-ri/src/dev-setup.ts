export default function initDev() {
  const pathname = window.location.pathname;

  if (pathname.includes("error.html")) {
    // Dev config for error page
    (window as any).appConfig = {
      userName: "dev",
      statusCode: 500,
      statusMessage: "Internal Server Error",
      messageHtml: undefined,
      message: "An error occurred while processing your request.",
      extraErrorHtml: undefined,
    };
  } else if (
    pathname.includes("home.html") ||
    pathname.includes("spawn.html") ||
    pathname.includes("login.html")
  ) {
    // Dev config for home page and other pages with spawners
    (window as any).appConfig = {
      spawners: {
        test: {
          last_activity: "2024-11-24T15:48:29.604740Z",
          url: "/user/test",
          active: true,
          ready: false,
        },
        test1: {
          last_activity: "2024-11-24T15:46:56.719146Z",
          url: "/user/test1",
          active: false,
          ready: false,
        },
        ...Array.from({ length: 5 }, (_, i) => `spawner${i + 1}`).reduce(
          (acc: Record<string, any>, spawner) => {
            acc[spawner] = {
              last_activity: new Date().toISOString(),
              url: `/user/${spawner}`,
              active: Math.random() < 0.5, // Randomly set active status
              ready: Math.random() < 0.5, // Randomly set ready status
            };
            return acc;
          },
          {},
        ),
      },
      default_server_active: false,
      url: "http://localhost",
      userName: "dev",
      announcement: "This is a development environment.",
      xsrf: "sample-xsrf-token",
    };
  } else {
    // Default dev config for other pages
    (window as any).appConfig = {
      userName: "dev",
      xsrf: "sample-xsrf-token",
    };
  }
  (window as any).spawnOptions = {
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
    phomes: ["xbencs00-home-1"],
    mhomes: [
      "brno11-elixir",
      "brno12-cerit",
      "brno14-ceitec",
      "brno1-cerit",
      "brno2",
      "budejovice1",
      "du-cesnet",
      "liberec3-tul",
      "plzen1",
      "plzen4-ntis",
      "praha1",
      "praha2-natur",
      "praha5-elixir",
      "praha6-fzu",
      "pruhonice1-ibot",
      "vestec1-elixir",
    ],
    s3buckets: [
      { value: "bucket-1", name: "Test Bucket 1" },
      { value: "bucket-2", name: "Test Bucket 2" },
    ],
    ssh_dns_domain: "jupyter-xbencs00--x-1---6b86b273.dyn.cloud.e-infra.cz",
    gpu_instances: [
      {
        value: "none",
        name: "None",
      },
      {
        value: "mig-1g.10gb",
        name: "10GB part A100",
      },
      {
        value: "mig-2g.20gb",
        name: "20GB part A100",
      },
      {
        value: "a10",
        name: "whole A10",
      },
      {
        value: "a40",
        name: "whole A40",
      },
      {
        value: "a100",
        name: "whole A100",
      },
      {
        value: "h100-80",
        name: "whole H100 (80GB)",
      },
      {
        value: "h100-94",
        name: "whole H100 (94GB)",
      },
      {
        value: "any",
        name: "any whole gpu",
      },
    ],
    images: {
      simple: [
        {
          value: "minimalnb:02-01-2025-ai",
          name: "Minimal NB with AI",
        },
        {
          value: "minimalnb:11-04-2025-intelligence-ai",
          name: "Minimal NB with notebook-intelligence",
        },
        {
          value: "minimalnb:01-02-2025",
          name: "Minimal NB with SSH access",
        },
        {
          value: "minimalnb-cs:31-10-2024",
          name: "Minimal NB with Integrated VS Code",
        },
        {
          value: "minimalnb-cs:17-11-2024-ai",
          name: "Minimal NB with Integrated VS Code and AI",
        },
        {
          value: "datasciencenb:26-09-2024",
          name: "DataScience NB",
        },
        {
          value: "datasciencenb:31-10-2024-ssh",
          name: "DataScience NB with SSH access",
        },
      ],
      r: [
        {
          value: "jupyterhubronly:05-02-2024",
          name: "Python 3.11 and R 4.3.1 kernels",
        },
        {
          value: "rstudio:11-08-2022-7",
          name: "RStudio with R 4.2.1",
        },
        {
          value: "rstudio:4.2.1-rsat",
          name: "RStudio with R 4.2.1 and RSAT",
        },
        {
          value: "rstudio:4.3.1",
          name: "RStudio with R 4.3.1",
        },
        {
          value: "rstudio:4.4.0",
          name: "RStudio with R 4.4.0",
        },
        {
          value: "rstudio:4.4.1",
          name: "RStudio with R 4.4.1",
        },
        {
          value: "rstudio:4.4.1-ai",
          name: "RStudio with R 4.4.1 and AI",
        },
      ],
      tf: [
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
        {
          value: "pytorchgpu:2.4.1",
          name: "Pytorch 2.4.1",
        },
        {
          value: "nvidia-pytorch:2.5.0",
          name: "NVIDIA Pytorch 2.5.0",
        },
        {
          value: "nvidia-tensorflow:2.16.1",
          name: "NVIDIA Tensorflow 2.16.1",
        },
      ],
      matlab: [
        {
          value: "matlab:r2022b",
          name: "MATLAB R2022b",
        },
        {
          value: "matlab:r2023a",
          name: "MATLAB R2023a",
        },
        {
          value: "matlab:r2024a",
          name: "MATLAB R2024a",
        },
      ],
      various: [
        {
          value: "colab:2025-01-07",
          name: "Google Colab",
        },
        {
          value: "alphapose:2023-10-26",
          name: "Alphapose",
        },
        {
          value: "cuda-ubuntu:11.6-22.04",
          name: "CUDA 11.6",
        },
        {
          value: "cuda-ubuntu:11.8-22.04",
          name: "CUDA 11.8",
        },
        {
          value: "cuda-ubuntu:12.0-24.04",
          name: "CUDA 12.0",
        },
        {
          value: "cuda-ubuntu:12.1-22.04",
          name: "CUDA 12.1",
        },
        {
          value: "cuda-ubuntu:12.2-22.04",
          name: "CUDA 12.2",
        },
        {
          value: "cuda-ubuntu:12.3-22.04",
          name: "CUDA 12.3",
        },
        {
          value: "cuda-ubuntu:12.4-22.04",
          name: "CUDA 12.4",
        },
      ],
      folding: [
        {
          value: "colabfold:1.5.5-cu12",
          name: "Colabfold 1.5.5",
        },
        {
          value: "esmfold:2.0.0",
          name: "ESM Fold 2.0",
        },
      ],
    },
  };

  console.log(
    "Dev mode",
    (window as any).appConfig,
    (window as any).spawnOptions,
  );
}
