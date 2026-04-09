import {
  H4,
  Panel,
  PanelContent,
  PanelDescription,
  PanelTitle,
  Separator,
  Small,
  Strong,
  Badge,
  Button,
} from "@e-infra/design-system";
import React, { JSX } from "react";
import {
  ShieldCheck,
  ShieldX,
  Cpu,
  Gpu,
  HardDrive,
  Server,
  Cloud,
  Check,
  X,
  MemoryStick,
  Pencil,
} from "lucide-react";
import { getGpuOptions, getImageOptions } from "../scripts/gatherFormData";

declare const appConfig: { userName?: string };

interface OverviewPanelProps {
  children?: React.ReactNode;
  className?: string;
  formData?: any;
  selectedImage: string | null;
  categoryImage: string | null;
}

/**
 * Edit button component that scrolls to a section
 */
function EditButton({ sectionId }: { sectionId: string }): JSX.Element {
  const handleClick = () => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="p-1 hover:bg-gray-100 rounded transition-colors"
      title="Edit this section"
    >
      <Pencil className="w-3.5 h-3.5 text-gray-500" />
      Edit
    </Button>
  );
}

/**
 * Status indicator component for showing enabled/disabled state
 */
function StatusIndicator({ enabled }: { enabled: boolean }): JSX.Element {
  return enabled ? (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
    >
      <Check className="w-3 h-3" />
      <span className="text-xs">Enabled</span>
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1"
    >
      <X className="w-3 h-3" />
      <span className="text-xs">Disabled</span>
    </Badge>
  );
}

export function OverviewPanel({
  children,
  className,
  formData,
  selectedImage,
  categoryImage,
}: OverviewPanelProps): JSX.Element {
  const imageOptions = getImageOptions() as Record<
    string,
    Array<{ value: string; name: string }>
  >;
  const gpuOptions = getGpuOptions() as Record<string, string>;

  const selectedImageName = selectedImage
    ? Object.values(imageOptions)
        .flat()
        .find((option) => option.value === selectedImage)?.name
    : undefined;

  const sshAccessEnabled = formData?.sshAccess === true;

  const selectedGpu = String(formData?.gpuselection ?? "");
  const selectedGpuLabel = gpuOptions[selectedGpu] || selectedGpu || "None";

  // Storage configuration summary
  const phSelection = formData?.phselection || "new";
  const metaCentrumEnabled = formData?.storageCheck === "yes";
  const s3Enabled = formData?.s3check === "yes";
  const s3SelectionType = formData?.s3selection || "";

  return (
    <Panel title={"overview"} className={className}>
      <PanelTitle>Overview</PanelTitle>
      <PanelDescription>Configuration summary before starting</PanelDescription>

      <PanelContent className="flex flex-col gap-2 pt-4">
        {/* Image Section */}
        {selectedImage && (
          <>
            <div>
              <div className="flex items-center justify-between">
                <H4>Image</H4>
                <EditButton sectionId="image-section" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Name</span>
                  <Strong className="text-right">
                    {selectedImageName || selectedImage}
                  </Strong>
                </div>
                <div className="flex justify-between">
                  <span>Tag</span>
                  <Small className="truncate text-right">{selectedImage}</Small>
                </div>
                <div className="flex justify-between">
                  <Strong>SSH Access</Strong>
                  <StatusIndicator enabled={sshAccessEnabled} />
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Resources Section */}
        <div>
          <div className="flex items-center justify-between">
            <H4>Resources</H4>
            <EditButton sectionId="resources-section" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="inline-flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                CPU
              </span>
              <Strong>
                {formData?.cpuselection}{" "}
                {formData?.cpuselection === 1 ? "Core" : "Cores"}
              </Strong>
            </div>
            <div className="flex justify-between">
              <span className="inline-flex items-center gap-1">
                <MemoryStick className="w-4 h-4" />
                Memory
              </span>
              <Strong>{formData?.memselection} GB</Strong>
            </div>
            <div className="flex justify-between">
              <span className="inline-flex items-center gap-1">
                <Gpu className="w-4 h-4" />
                GPU
              </span>
              <Strong>{selectedGpuLabel}</Strong>
            </div>
          </div>
        </div>

        <Separator />

        {/* Storage Section */}
        <div>
          <div className="flex items-center justify-between">
            <H4 className="flex items-center gap-2">
              {/* <HardDrive className="w-4 h-4" /> */}
              Storage Configuration
            </H4>
            <EditButton sectionId="storage-section" />
          </div>

          <div className="space-y-3">
            {/* Persistent Home */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Strong className="text-sm">Persistent Home</Strong>
                </div>
                <Small className="block mt-1 line-clamp-1">
                  {phSelection === "new"
                    ? "New directory"
                    : formData?.phname || "Existing directory"}
                </Small>
                {phSelection === "new" && formData?.phCheck === "yes" && (
                  <Small className="block text-amber-600 mt-0.5">
                    ⚠ Will erase if exists
                  </Small>
                )}
              </div>
              {/* <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                Required
              </Badge> */}
              {/* <StatusIndicator enabled={true} /> */}
            </div>

            {/* MetaCentrum Storage */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Strong className="text-sm">MetaCentrum Storage</Strong>
                  <Server className="w-3 h-3 text-gray-400" />
                </div>
                {metaCentrumEnabled && (
                  <>
                    <Small className="block mt-1">
                      {formData?.home || "No storage selected"}
                    </Small>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData?.locationStorageCheck === "yes" && (
                        <Badge variant="outline" className="text-xs">
                          Mount to /storage
                        </Badge>
                      )}
                      {formData?.projectCheck === "yes" && (
                        <Badge variant="outline" className="text-xs">
                          Project Directories
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
              <StatusIndicator enabled={metaCentrumEnabled} />
            </div>

            {/* S3 Storage */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <Strong className="text-sm">S3 Object Storage</Strong>
                  <Cloud className="w-3 h-3 text-gray-400" />
                </div>
                {s3Enabled && (
                  <>
                    <Small className="block mt-1 truncate">
                      {s3SelectionType === "new"
                        ? formData?.s3bucket || "New bucket"
                        : formData?.s3name || "Existing bucket"}
                    </Small>
                    {s3SelectionType === "new" && formData?.s3url && (
                      <span className="block text-xs text-gray-500 mt-0.5 truncate">
                        {formData.s3url}
                      </span>
                    )}
                  </>
                )}
              </div>
              <StatusIndicator enabled={s3Enabled} />
            </div>
          </div>
        </div>
      </PanelContent>

      <PanelContent>{children}</PanelContent>
    </Panel>
  );
}
