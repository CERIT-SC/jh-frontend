import { useState, useEffect, Fragment, useCallback } from "react";
import { TileSelector } from "@components/ui";
import { GPUStatusIndicator, GPUSquare } from "@components/features";
import { fetchGPUIndicators, GPUIndicatorsData } from "@api";
import {
  Muted,
  Separator,
  Badge,
  cn,
  Label,
  H4,
  P,
} from "@e-infra/design-system";
import { Loader2, RefreshCw, Cpu, Gpu, MemoryStick } from "lucide-react";
import SectionContainer from "../components/SectionContainer";
import GenericFieldBlock from "../components/GenericFieldBlock";
import type { SpawnOptions } from "@src-types/spawnOptions";
import type { GenericField } from "@src-types/spawnOptions";

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
  /** The `resources` slice of the resolved spawn options. */
  resources: SpawnOptions["resources"];
  /** Generic fields rendered inside the resources section. */
  fields: GenericField[];
  /** Generic-field values and change handler. */
  fieldValues: Record<string, string | boolean>;
  onFieldChange: (name: string, value: string | boolean) => void;
}

export default function ResourceSelectionSection({
  setFormData,
  defaultFormData,
  resources,
  fields,
  fieldValues,
  onFieldChange,
}: ResourceSelectionSectionProps) {
  // GPU tiles come from the schema; labels are BE-authoritative.
  const gpuOptions = Object.fromEntries(
    resources.gpu.options.map((choice) => [choice.value, choice.name]),
  );
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

  // Fetch GPU indicators — only when the instance offers a live status widget
  const fetchGPUStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: GPUIndicatorsData = await fetchGPUIndicators();
      // Parse the data into the format expected by GPUStatusIndicator
      const statuses = Object.entries(data)
        .filter(([, { total, free }]) => total >= 0 && free >= 0)
        .map(([model, { total, free }]) => ({
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
    if (resources.gpu.enabled && resources.gpu.live_status) {
      fetchGPUStatus();
    }
  }, [fetchGPUStatus, resources.gpu.enabled, resources.gpu.live_status]);

  useEffect(() => {
    if (defaultFormData) {
      const mem = Number(defaultFormData.memory);
      const cpu = Number(defaultFormData.cpu);
      const resolvedMem =
        Number.isNaN(mem) || mem <= 0 ? resources.memory.default : mem;
      const resolvedCpu =
        Number.isNaN(cpu) || cpu <= 0 ? resources.cpu.default : cpu;

      const requestedGpu = String(defaultFormData.gpu ?? "");
      const gpuMap = gpuOptions as Record<string, string>;
      const defaultGpu = resources.gpu.default;
      const resolvedGpu =
        requestedGpu && gpuMap[requestedGpu]
          ? ([requestedGpu, gpuMap[requestedGpu]] as [string, string])
          : ([defaultGpu, gpuMap[defaultGpu] || "None"] as [string, string]);

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
        <div className="flex flex-col gap-6">
          {resources.cpu.enabled && (
            <SectionContainer>
              <SectionContainer.Header
                icon={<Cpu className="w-5 h-5 mt-0.5" />}
              >
                <H4>CPU Limit</H4>
                <P className="pl-1 text-xs">
                  The number of CPU cores available to this notebook while
                  it&apos;s running.
                </P>
              </SectionContainer.Header>
              <SectionContainer.Content className="flex flex-col gap-2">
                <Label className="pl-2 text-text-heading">
                  Select the limit of CPU cores
                </Label>
                <TileSelector
                  ariaLabel="Select the limit of CPU cores"
                  options={resources.cpu.options}
                  defaultValue={defCPU ?? undefined}
                  onChange={handleCPUSelect}
                />
              </SectionContainer.Content>
            </SectionContainer>
          )}

          {resources.memory.enabled && (
            <SectionContainer>
              <SectionContainer.Header
                icon={<MemoryStick className="w-5 h-5 mt-0.5" />}
              >
                <H4>Memory Limit</H4>
                <P className="pl-1 text-xs">
                  The amount of memory available to this notebook while
                  it&apos;s running.
                </P>
              </SectionContainer.Header>
              <SectionContainer.Content className="flex flex-col gap-2">
                <Label className="pl-2 text-text-heading">
                  Select the limit of memory in GB
                </Label>
                <TileSelector
                  ariaLabel="Select the limit of memory in GB"
                  options={resources.memory.options}
                  defaultValue={defMem ?? undefined}
                  onChange={handleMemSelect}
                />
              </SectionContainer.Content>
            </SectionContainer>
          )}

          {resources.gpu.enabled && (
            <SectionContainer>
              <SectionContainer.Header
                icon={<Gpu className="w-5 h-5 mt-0.5" />}
                action={
                  resources.gpu.live_status ? (
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
                  ) : undefined
                }
              >
                <H4>GPU</H4>
                <P className="pl-1 text-xs">
                  The GPU available to this notebook for graphics and compute
                  workloads.
                </P>
              </SectionContainer.Header>
              <SectionContainer.Content className="flex flex-col gap-4">
                <Label className="pl-2 text-text-heading">Select GPU</Label>
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
                            "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
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
                {/* Live status widget — only when the instance offers it
                    (resources.gpu.live_status); otherwise no fetch, no
                    spinner, no refresh button. */}
                {resources.gpu.live_status && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text-heading">
                          Current GPUs Available:
                        </span>
                        {/* Legend */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <GPUSquare status="free" size="sm" />
                            <span className="text-xs text-text-muted">
                              Free
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GPUSquare status="used" size="sm" />
                            <span className="text-xs text-text-muted">
                              Used
                            </span>
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
                      <Muted className="text-sm">
                        No GPUs available in cluster
                      </Muted>
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
                  </div>
                )}
              </SectionContainer.Content>
            </SectionContainer>
          )}

          {/* Generic fields of the resources section */}
          <GenericFieldBlock
            fields={fields}
            values={fieldValues}
            onChange={onFieldChange}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
