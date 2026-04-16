import { useState, useEffect, useCallback } from "react";
import { GrafanaQuery } from "../api/GrafanaAPI";

export interface GPUStatusData {
  label: string;
  model: string;
  free: number;
  total: number;
  loading: boolean;
  error: string | null;
}

export interface UseGPUStatusResult {
  gpuStatuses: GPUStatusData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * GPU models to query from Grafana
 * Maps model name (used in Prometheus) to display label
 */
const GPU_MODELS: Array<{ model: string; label: string }> = [
  { model: "NVIDIA-A10", label: "A10" },
  { model: "NVIDIA-A40", label: "A40" },
  { model: "NVIDIA-A100-80GB-PCIe", label: "A100" },
  { model: "NVIDIA-H100-NVL", label: "H100 NVL" },
  { model: "NVIDIA-H100-PCIe", label: "H100" },
];

/**
 * Hook to fetch GPU status from Grafana
 * Returns free and total counts for each GPU model
 */
export function useGPUStatus(): UseGPUStatusResult {
  const [gpuStatuses, setGpuStatuses] = useState<GPUStatusData[]>(
    GPU_MODELS.map((gpu) => ({
      ...gpu,
      free: 0,
      total: 0,
      loading: true,
      error: null,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGPUStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query for all GPU models
      const query = new GrafanaQuery();
      
      GPU_MODELS.forEach((gpu) => {
        query.freeGPUs(gpu.model);
        query.totalGPUs(gpu.model);
      });

      const results = await query.execute();

      // Parse results into GPUStatusData array
      const statuses: GPUStatusData[] = GPU_MODELS.map((gpu) => {
        const freeKey = `freeGPUs_${gpu.model.replace(/-/g, "_")}`;
        const totalKey = `totalGPUs_${gpu.model.replace(/-/g, "_")}`;
        
        const freeValue = results[freeKey]?.value ?? 0;
        const totalValue = results[totalKey]?.value ?? 0;

        return {
          label: gpu.label,
          model: gpu.model,
          free: typeof freeValue === "number" ? Math.max(0, Math.round(freeValue)) : 0,
          total: typeof totalValue === "number" ? Math.max(0, Math.round(totalValue)) : 0,
          loading: false,
          error: null,
        };
      });

      // Filter out GPUs with 0 total
      const availableGPUs = statuses.filter((gpu) => gpu.total > 0);
      
      setGpuStatuses(availableGPUs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch GPU status";
      console.error("GPU status fetch error:", err);
      setError(errorMessage);
      

      setGpuStatuses(
        GPU_MODELS.map((gpu) => ({
          ...gpu,
          free: 0,
          total: 0,
          loading: false,
          error: errorMessage,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGPUStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchGPUStatus, 30000);
    
    return () => clearInterval(interval);
  }, [fetchGPUStatus]);

  return {
    gpuStatuses,
    loading,
    error,
    refetch: fetchGPUStatus,
  };
}

export default useGPUStatus;
