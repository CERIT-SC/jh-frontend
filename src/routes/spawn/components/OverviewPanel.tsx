import {
  H4,
  Panel,
  PanelContent,
  PanelTitle,
  Separator,
  Small,
  Strong,
  Badge,
  Button,
  P,
  cn,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@e-infra/design-system";
import React, { JSX, useMemo } from "react";
import {
  Cpu,
  Gpu,
  Server,
  Cloud,
  Check,
  X,
  MemoryStick,
  Pencil,
  LayoutDashboard,
  HardDrive,
} from "lucide-react";
import { getGpuOptions, getImageOptions } from "../utils/gatherFormData";
import { triggerShineById } from "@utils";

interface OverviewPanelProps {
  children?: React.ReactNode;
  className?: string;
  formData?: any;
  selectedImage: string | null;
  categoryImage: string | null;
}

/**
 * Edit button component that scrolls to a section and triggers shine effect
 */
function EditButton({ sectionId }: { sectionId: string }): JSX.Element {
  const handleClick = () => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Trigger shine effect after scroll animation starts
      triggerShineById(sectionId, {
        duration: 1500,
        delay: 300,
      });
    }
  };

  return (
    <Button variant="ghost" onClick={handleClick} title="Edit this section">
      <Pencil className="w-3.5 h-3.5 text-gray-500" />
      Edit
    </Button>
  );
}

/**
 * Status indicator component for showing enabled/disabled/N/A state
 */
function SSHStatusIndicator({
  enabled,
  available,
}: {
  enabled: boolean;
  available: boolean;
}): JSX.Element {
  if (!available) {
    return (
      <Badge
        variant="outline"
        className="bg-muted text-muted-foreground flex items-center gap-1 mt-1"
      >
        <X className="w-3 h-3" />
        <span className="text-xs">Not Supported</span>
      </Badge>
    );
  }
  return enabled ? (
    <Badge
      variant="outline"
      className="bg-success-100 text-success-700 border-success-200 flex items-center gap-1 mt-1"
    >
      <Check className="w-3 h-3" />
      <span className="text-xs">Enabled</span>
    </Badge>
  ) : (
    <Badge variant="secondary" className=" flex items-center gap-1 mt-1">
      <X className="w-3 h-3" />
      <span className="text-xs">Disabled</span>
    </Badge>
  );
}

/**
 * Checks if the given image value corresponds to an SSH-capable image
 */
function imageHasSSHSupport(
  imageValue: string | null,
  imageOptions: Record<string, Array<{ value: string; name: string }>>,
): boolean {
  if (!imageValue) return false;
  for (const catImages of Object.values(imageOptions)) {
    const found = catImages.find((img) => img.value === imageValue);
    if (found) {
      const nameLower = found.name.toLowerCase();
      return nameLower.includes("ssh");
    }
  }
  return false;
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

  const isCustomImage =
    categoryImage === "custom" || formData?.images === "custom";

  const selectedImageName = selectedImage
    ? Object.values(imageOptions)
        .flat()
        .find((option) => option.value === selectedImage)?.name
    : undefined;

  // Only show custom image if there's actually a value
  const hasCustomImageValue = Boolean(formData?.customimage);

  const displayImageName = isCustomImage
    ? hasCustomImageValue
      ? "Custom Image"
      : null
    : selectedImageName || selectedImage;

  const displayImageTag = isCustomImage
    ? (formData?.customimage ?? "")
    : selectedImage;

  const sshAccessEnabled = formData?.sshAccess === true;

  // Compute if SSH is available for the selected image
  const isSSHAvailable = useMemo(() => {
    // Custom images always allow SSH (user may have configured it)
    if (isCustomImage) return true;
    // No image selected → SSH not available
    if (!selectedImage) return false;
    // Check if the selected image has SSH tag
    return imageHasSSHSupport(selectedImage, imageOptions);
  }, [selectedImage, isCustomImage, imageOptions]);

  const selectedGpu = String(formData?.gpuselection ?? "");
  const selectedGpuLabel = gpuOptions[selectedGpu] || selectedGpu || "None";

  // Storage configuration summary
  const phSelection = formData?.phselection || "new";
  const metaCentrumEnabled = formData?.storageCheck === "yes";
  const s3Enabled = formData?.s3check === "yes";
  const s3Selection = formData?.s3selection || "existing";

  return (
    <Panel title={"overview"} className={cn("max-w-md", className)}>
      <PanelTitle className="flex gap-1 items-center pt-6 px-6 text-2xl">
        <LayoutDashboard />
        Configuration Overview
      </PanelTitle>
      {/* <PanelDescription>Configuration summary before starting</PanelDescription> */}

      <PanelContent className="flex flex-col gap-4">
        <Separator />
        {/* Image Section */}
        <>
          <div className="px-6 space-y-2">
            <div className="flex items-center justify-between">
              <H4>Environment Configuration</H4>
              <EditButton sectionId="image-section" />
            </div>
            <div className="grid grid-cols-2 gap-0.5">
              <P className="pr-1 text-text-heading/80">Name</P>
              <Strong className="min-w-0 break-word">{displayImageName || "-"}</Strong>
              <P className="pr-1 text-text-heading/80">Tag</P>
              <Small className="min-w-0 break-all">{displayImageTag || "-"}</Small>
              <P className="text-text-heading/80">SSH Access</P>
              <SSHStatusIndicator
                enabled={sshAccessEnabled}
                available={isSSHAvailable}
              />
            </div>
          </div>
        </>
        <Separator />

        {/* Storage Section */}
        <div className="px-6 gap-2 flex flex-col">
          <div className="flex items-center justify-between">
            <H4 className="flex items-center gap-2">
              {/* <HardDrive className="w-4 h-4" /> */}
              Storage Configuration
            </H4>
            <EditButton sectionId="storage-section" />
          </div>

          <div className="space-y-2">
            {/* Persistent Home */}
            <div className="grid grid-cols-2 items-start">
              <div className="flex items-center gap-2">
                <HardDrive className="w-3 h-3 text-text-heading" />
                <P className="text-text-heading/80">Persistent Home</P>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <P className="break-all">
                    {phSelection === "new"
                      ? "New directory"
                      : formData?.phname || "Existing directory"}
                  </P>
                </TooltipTrigger>
                {phSelection === "existing" && formData?.phname && (
                  <TooltipContent side="top">
                    {`${formData.phname}`}
                  </TooltipContent>
                )}
              </Tooltip>
              {phSelection === "new" && formData?.phCheck === "yes" && (
                <Small className="block text-amber-600 mt-0.5 pl-5">
                  ⚠ Will erase if exists
                </Small>
              )}
              {/* <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                Required
              </Badge> */}
              {/* <StatusIndicator enabled={true} /> */}
            </div>

            {/* MetaCentrum Storage */}
            <div className="grid grid-cols-2 items-start">
              <div className="flex items-center gap-2 text-text-heading">
                <Server className="w-3 h-3" />
                <P>MetaCentrum</P>
              </div>
              {metaCentrumEnabled ? (
                <P className="">{formData?.home || "No storage selected"}</P>
              ) : (
                <P>-</P>
              )}
              {metaCentrumEnabled && (
                <div className="col-span-2 flex flex-wrap gap-1 pl-5">
                  {formData?.locationStorageCheck === "yes" && (
                    <Badge
                      variant="outline"
                      className="text-xs text-text-heading"
                    >
                      Mount to /storage
                    </Badge>
                  )}
                  {formData?.projectCheck === "yes" && (
                    <Badge
                      variant="outline"
                      className="text-xs text-text-heading"
                    >
                      Project Directories
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* S3 Storage */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="grid grid-cols-2 items-start">
                  <div className="flex items-center gap-2 text-text-heading">
                    <Cloud className="w-3 h-3" />
                    <P>S3 Object Storage</P>
                  </div>
                  {s3Enabled ? (
                    <P>
                      {s3Selection === "new"
                        ? formData?.s3bucket || "New bucket"
                        : formData?.s3name || "Existing bucket"}
                    </P>
                  ) : (
                    <P>-</P>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />
        {/* Resources Section */}
        <div className="px-6">
          <div className="flex items-center justify-between">
            <H4>Resource Configuration</H4>
            <EditButton sectionId="resources-section" />
          </div>
          <div className="grid grid-cols-2">
            <span className="inline-flex items-center gap-2 text-text-heading/80">
              <Cpu className="w-3 h-3" />
              CPU
            </span>
            <Strong>
              {formData?.cpuselection}{" "}
              {formData?.cpuselection === 1 ? "Core" : "Cores"}
            </Strong>
            <span className="inline-flex items-center gap-2 text-text-heading/80">
              <MemoryStick className="w-3 h-3" />
              Memory
            </span>
            <Strong>{formData?.memselection} GB</Strong>
            <span className="inline-flex items-center gap-2 text-text-heading/80">
              <Gpu className="w-3 h-3" />
              GPU
            </span>
            <Strong>{selectedGpuLabel}</Strong>
          </div>
        </div>

        <Separator />
      </PanelContent>

      <PanelContent className="p-6">{children}</PanelContent>
    </Panel>
  );
}
