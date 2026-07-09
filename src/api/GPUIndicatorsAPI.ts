import axios from "axios";

/**
 * GPU indicators data structure
 * Maps GPU model name to total and free counts
 */
export interface GPUIndicatorsData {
  [gpuModel: string]: {
    total: number;
    free: number;
  };
}

const GPU_INDICATORS_URL = "/services/prometheus/gpus";

export async function fetchGPUIndicators(): Promise<GPUIndicatorsData> {
  const response = await axios.get<unknown>(GPU_INDICATORS_URL, {
    headers: { Accept: "application/json" },
  });

  if (
    typeof response.data === "string" &&
    response.data.trimStart().toLowerCase().startsWith("<html")
  ) {
    throw new Error("500 internal server error");
  }

  return response.data as GPUIndicatorsData;
}
