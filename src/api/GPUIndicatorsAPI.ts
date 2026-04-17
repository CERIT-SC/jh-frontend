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
  const response = await axios.get<GPUIndicatorsData>(GPU_INDICATORS_URL);
  return response.data;
}
