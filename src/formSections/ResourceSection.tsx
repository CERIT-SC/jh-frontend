import { useState, useEffect } from "react";
import { TileSelector } from "../components/TileSelector/TileSelector";
import { FieldHeader } from "../components/FieldHeader/FieldHeader";
import { DropDownMenu } from "../components/DropDownMenu/DropDownMenu";
import { getGpuOptions } from "../scripts/gatherFormData";
import {
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@e-infra/design-system";

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
  formData,
  setFormData,
  defaultFormData,
}: ResourceSelectionSectionProps) {
  const gpuOptions = getGpuOptions();
  const [defMem, setDefMem] = useState<number | null>(null);
  const [defCPU, setDefCPU] = useState<number | null>(null);
  const [defGPU, setDefGPU] = useState<[string, string] | null>(null);
  console.log("GPU options:", gpuOptions);

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

      console.log("Default gpu:", defaultFormData);

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
    <div className="form-wrap">
      {defCPU !== null && defMem !== null && defGPU !== null ? (
        <>
          <PanelTitle>Choosing resources</PanelTitle>
          <PanelDescription>
            The notebook is spawned only when one node fulfills <b>all</b> your
            requirements.
          </PanelDescription>
          <PanelContent className="flex flex-col gap-4">
            <TileSelector
              selectionText="Select CPU limit:"
              options={[1, 4, 6, 8, 10, 16, 24, 32, 48, 64, 80, 96]}
              defaultValue={defCPU ?? undefined}
              onChange={handleCPUSelect}
            />
            <TileSelector
              selectionText="Select memory limit (in GB):"
              options={[4, 8, 16, 32, 64, 128, 256, 512, 768, 1024]}
              defaultValue={defMem ?? undefined}
              onChange={handleMemSelect}
            />
            <FieldHeader
              title="GPU"
              infoText="We strongly advise to request a GPU part instead of whole GPU due to their limited amount. If you use whole GPU inefficiently, you might be banned from requesting it again."
            >
              <p>By default, no GPU is assigned.</p>
              <DropDownMenu
                formSelect={handleGPUSelect}
                title="Select an option"
                menuOptions={gpuOptions}
                defaultOption={defGPU}
              ></DropDownMenu>
              <p>Current GPUs Free: </p>
            </FieldHeader>
          </PanelContent>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
