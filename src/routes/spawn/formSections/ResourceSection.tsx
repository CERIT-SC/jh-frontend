import { useState, useEffect, Fragment, useCallback } from "react";
import { TileSelector } from "@components/ui";
import { getGpuOptions } from "../utils/gatherFormData";
import { GPUStatusIndicator, GPUSquare } from "@components/features";
import { fetchGPUIndicators, GPUIndicatorsData } from "@api";
import {
  Panel,
  PanelTitle,
  PanelContent,
  Muted,
  Separator,
  Badge,
  cn,
  PanelDescription,
  Label,
} from "@e-infra/design-system";
import { Loader2, RefreshCw } from "lucide-react";

type FormState = Record<string, unknown>;
type FormUpdater = (prev: FormState) => FormState;

interface ResourceDefaultFormData {
  memory?: number | string | null;
  cpu?: number | string | null;
  gpu?: string | null;
}

interface ResourceSelectionSectionProps {
  formData: FormState;
  setFormData: (updater: FormUpdater) => void;
  defaultFormData?: ResourceDefaultFormData;
}

export default function ResourceSelectionSection({
  setFormData,
  defaultFormData,
}: ResourceSelectionSectionProps) {
  const gpuOptions = getGpuOptions();
  const [defMem, setDefMem] = useState<number | null>(null);
  const [defCPU, setDefCPU] = useState<number | null>(null);
  const [defGPU, setDefGPU] = useState<[string, string] | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<string | null>(null);

  // GPU status state
  const [gpuStatuses, setGpuStatuses] = useState<
    Array<{ model: string; label: string; total: number; free: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch GPU indicators
  const fetchGPUStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: GPUIndicatorsData = await fetchGPUIndicators();
      // Parse the data into the format expected by GPUStatusIndicator
      const statuses = Object.entries(data).map(([model, { total, free }]) => ({
        model,
        label: model.replace("NVIDIA-", ""),
        total,
        free,
      }));
      setGpuStatuses(statuses);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch GPU status";
      console.error("GPU status fetch error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGPUStatus();
  }, [fetchGPUStatus]);

  useEffect(() => {
    if (defaultFormData) {
      const mem = Number(defaultFormData.memory);
      const cpu = Number(defaultFormData.cpu);
      const resolvedMem = Number.isNaN(mem) || mem <= 0 ? 4 : mem;
      const resolvedCpu = Number.isNaN(cpu) || cpu <= 0 ? 1 : cpu;

      const requestedGpu = String(defaultFormData.gpu ?? "");
      const gpuMap = gpuOptions as Record<string, string>;
      const resolvedGpu =
        requestedGpu && gpuMap[requestedGpu]
          ? ([requestedGpu, gpuMap[requestedGpu]] as [string, string])
          : (["none", gpuMap.none || "None"] as [string, string]);

      setFormData((prev) => ({
        ...prev,
        cpuselection: resolvedCpu,
      }));

      setFormData((prev) => ({
        ...prev,
        memselection: resolvedMem,
        shmsize: String(resolvedMem),
      }));

      setFormData((prev) => ({
        ...prev,
        gpuselection: resolvedGpu[0],
      }));

      setDefMem(resolvedMem);
      setDefCPU(resolvedCpu);
      setDefGPU(resolvedGpu);
      setSelectedGpu(resolvedGpu[0]);
    }
  }, [defaultFormData]);

  const handleCPUSelect = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      cpuselection: value,
    }));
  };

  const handleMemSelect = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      memselection: value,
      shmsize: String(value),
    }));
  };

  const handleGPUSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gpuselection: value,
    }));
  };

  return (
    <>
      {defCPU !== null && defMem !== null && defGPU !== null ? (
        <div className="flex flex-col gap-4">
          <Panel className="p-0 bg-background border-primary">
            <PanelTitle className="mb-2 px-6 pt-6">CPU Limit</PanelTitle>
            <PanelDescription className="px-6">
              The number of CPU cores available to this notebook while it's
              running.
            </PanelDescription>
            <Separator className="mt-2" />
            <PanelContent className="px-6 pb-6 bg-secondary-300 dark:bg-surface rounded-b-lg flex flex-col gap-2">
              <Label className="pl-2">Select the limit of CPU cores</Label>
              <TileSelector
                ariaLabel="Select the limit of CPU cores"
                options={[1, 4, 6, 8, 10, 16, 24, 32, 48, 64, 80, 96]}
                defaultValue={defCPU ?? undefined}
                onChange={handleCPUSelect}
              />
            </PanelContent>
          </Panel>
          <Panel className="p-0 bg-background border-primary">
            <PanelTitle className="mb-2 px-6 pt-6">Memory Limit</PanelTitle>
            <PanelDescription className="px-6">
              The amount of memory available to this notebook while it's
              running.
            </PanelDescription>
            <Separator className="mt-2" />
            <PanelContent className="px-6 pb-6 bg-secondary-300 dark:bg-surface rounded-b-lg flex flex-col gap-2">
              <Label className="pl-2">Select the limit of memory in GB</Label>
              <TileSelector
                ariaLabel="Select the limit of memory in GB"
                options={[4, 8, 16, 32, 64, 128, 256, 512, 768, 1024]}
                defaultValue={defMem ?? undefined}
                onChange={handleMemSelect}
              />
            </PanelContent>
          </Panel>
          {/* <FieldHeader
              title="GPU"
              infoText="We strongly advise to request a GPU part instead of whole GPU due to their limited amount. If you use whole GPU inefficiently, you might be banned from requesting it again."
            >
            </FieldHeader> */}
          {/* <p>By default, no GPU is assigned.</p> */}

          {/* GPU Status Section */}
          <Panel className="p-0 pt-6 bg-background border-primary">
            <PanelTitle className="px-6 pb-2">
              <div className="flex justify-between">
                GPU
                <button
                  onClick={fetchGPUStatus}
                  disabled={loading}
                  className="p-1 hover:bg-surface-raised rounded transition-colors disabled:opacity-50"
                  aria-label="Refresh GPU status"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-text-muted ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </PanelTitle>
            <PanelDescription className="px-6 mb-2">
              The GPU available to this notebook for graphics and compute
              workloads.
            </PanelDescription>
            <PanelContent className="flex flex-col px-6 gap-4 border-t py-4 bg-secondary-300 dark:bg-surface rounded-b-lg">
              <Label className="pl-2">Select GPU</Label>
              <div className="flex flex-wrap gap-2 animate-fade-in">
                {Object.entries(gpuOptions).map(([value, label]) => {
                  const isActive = selectedGpu === value;
                  return (
                    <Badge
                      key={value}
                      className={cn(
                        "cursor-pointer px-3 py-1 text-xs transition-all duration-200",
                        "bg-surface-raised border-border text-text",
                        "hover:bg-primary/10 hover:border-primary",
                        isActive &&
                          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground",
                      )}
                      onClick={() => {
                        setSelectedGpu(value);
                        handleGPUSelect(value);
                      }}
                    >
                      {label}
                    </Badge>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-heading">
                    Current GPUs Available:
                  </span>
                  {/* Legend */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <GPUSquare status="free" size="sm" />
                      <span className="text-xs text-text-muted">Free</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GPUSquare status="used" size="sm" />
                      <span className="text-xs text-text-muted">Used</span>
                    </div>
                  </div>
                </div>
              </div>

              {loading && gpuStatuses.length === 0 ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                  <span className="text-sm text-text-muted">
                    Loading GPU status...
                  </span>
                </div>
              ) : error ? (
                <div className="text-sm text-error">{error}</div>
              ) : gpuStatuses.length === 0 ? (
                <Muted className="text-sm">No GPUs available in cluster</Muted>
              ) : (
                <div className="flex flex-col gap-4">
                  {gpuStatuses.map((gpu, index) => (
                    <Fragment key={gpu.model}>
                      <GPUStatusIndicator
                        label={gpu.label}
                        free={gpu.free}
                        total={gpu.total}
                        size="md"
                        gap="md"
                      />
                      {index < gpuStatuses.length - 1 && <Separator />}
                    </Fragment>
                  ))}
                </div>
              )}
            </PanelContent>
          </Panel>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
