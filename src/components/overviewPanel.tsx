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
} from "@e-infra/design-system";
import React from "react";
import {
  ShieldCheck,
  ShieldX,
  HardDrive,
  Server,
  Cloud,
  Check,
  X,
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

  const selectedImageName =
    selectedImage && categoryImage
      ? (imageOptions[categoryImage] || []).find(
          (option) => option.value === selectedImage,
        )?.name
      : undefined;

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

      <PanelContent>
        {/* Image Section */}
        {selectedImage && (
          <>
            <div>
              <H4>Image:</H4>
              <Strong>{selectedImageName || selectedImage}</Strong>
              <Small className="block truncate">{selectedImage}</Small>
            </div>
            <div className="flex items-center justify-between">
              <Strong>SSH Access</Strong>
              {formData?.sshAccess ? (
                <ShieldCheck className="w-4 h-4 text-green-500" />
              ) : (
                <ShieldX className="w-4 h-4 text-red-500" />
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Resources Section */}
        <div>
          <H4>Resources:</H4>
          <div className="grid grid-cols-3 gap-2">
            <Strong>CPU:</Strong>{" "}
            <Small className="col-span-2 text-right">
              {formData?.cpuselection}
            </Small>
            <Strong>Memory:</Strong>{" "}
            <Small className="col-span-2 text-right">
              {formData?.memselection} GB
            </Small>
            <Strong>GPU:</Strong>{" "}
            <Small className="col-span-2 text-right">{selectedGpuLabel}</Small>
          </div>
        </div>

        <Separator />

        {/* Storage Section */}
        <div>
          <H4 className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4" />
            Storage Configuration
          </H4>

          <div className="space-y-3">
            {/* Persistent Home */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Strong className="text-sm">Persistent Home</Strong>
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Required
                  </Badge>
                </div>
                <Small className="block mt-1">
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
              <StatusIndicator enabled={true} />
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Strong className="text-sm">S3 Object Storage</Strong>
                  <Cloud className="w-3 h-3 text-gray-400" />
                </div>
                {s3Enabled && (
                  <>
                    <Small className="block mt-1">
                      {s3SelectionType === "new"
                        ? formData?.s3bucket || "New bucket"
                        : formData?.s3name || "Existing bucket"}
                    </Small>
                    {s3SelectionType === "new" && formData?.s3url && (
                      <Small className="block text-gray-500 mt-0.5 truncate">
                        {formData.s3url}
                      </Small>
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
