import {
  H4,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@e-infra/design-system";
import { Panel, PanelContent, PanelTitle } from "@components/ui";
import React, { JSX, useMemo, useState } from "react";
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
import { triggerShineById } from "@utils";
import type { SpawnFormData } from "@src-types/spawnForm";
import type { SpawnOptions } from "@src-types/spawnOptions";
import { effectiveFields } from "../sections/registry";

interface OverviewPanelProps {
  children?: React.ReactNode;
  className?: string;
  formData?: SpawnFormData;
  selectedImage: string | null;
  categoryImage: string | null;
  /** The resolved spawn options this form is rendered from. */
  options: SpawnOptions;
  /** Generic-field values (formData.fields). */
  fieldValues?: Record<string, string | boolean>;
}

/**
 * Edit button component that scrolls to a section and triggers shine effect
 */
function EditButton({
  sectionId,
  onAfterClick,
}: {
  sectionId: string;
  onAfterClick?: () => void;
}): JSX.Element {
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
    onAfterClick?.();
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

/**
 * Shared configuration sections rendered inside both the desktop Panel
 * and the mobile Sheet.
 */
function OverviewSections({
  formData,
  selectedImage,
  categoryImage,
  options,
  fieldValues,
  onSectionEdit,
}: Omit<OverviewPanelProps, "children" | "className"> & {
  onSectionEdit?: () => void;
}): JSX.Element {
  // Catalog + GPU labels come from the resolved options (BE-authoritative).
  const imageOptions: Record<
    string,
    Array<{ value: string; name: string }>
  > = Object.fromEntries(
    options.image.categories.map((category) => [
      category.key,
      category.images.map((image) => ({
        value: image.value,
        name: image.name,
      })),
    ]),
  );
  const gpuOptions: Record<string, string> = Object.fromEntries(
    options.resources.gpu.options.map((choice) => [choice.value, choice.name]),
  );

  const storageFieldRows = effectiveFields(options).filter(
    (field) => field.section === "storage",
  );
  const resourceFieldRows = effectiveFields(options).filter(
    (field) => field.section === "resources",
  );
  const hasStorageContent =
    options.storage.persistent_home.enabled ||
    options.storage.metacentrum.enabled ||
    options.storage.projects.enabled ||
    options.storage.s3.enabled ||
    storageFieldRows.length > 0;
  const hasResourceContent =
    options.resources.cpu.enabled ||
    options.resources.memory.enabled ||
    options.resources.gpu.enabled ||
    resourceFieldRows.length > 0;

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
    <>
      <Separator />
      {/* Image Section */}
      <div className="px-6 space-y-2">
        <div className="flex items-center justify-between">
          <H4>Environment Configuration</H4>
          <EditButton sectionId="image-section" onAfterClick={onSectionEdit} />
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          <P className="pr-1 text-text-heading">Name</P>
          <Strong className="min-w-0 break-word">
            {displayImageName || "-"}
          </Strong>
          <P className="pr-1 text-text-heading">Tag</P>
          <Small className="min-w-0 break-all">{displayImageTag || "-"}</Small>
          {options.image.ssh.enabled && (
            <>
              <P className="text-text-heading">SSH Access</P>
              <SSHStatusIndicator
                enabled={sshAccessEnabled}
                available={isSSHAvailable}
              />
            </>
          )}
        </div>
      </div>
      <Separator />

      {/* Storage Section — only when the instance offers storage options */}
      {hasStorageContent && (
        <div className="px-6 gap-2 flex flex-col">
          <div className="flex items-center justify-between">
            <H4 className="flex items-center gap-2">Storage Configuration</H4>
            <EditButton
              sectionId="storage-section"
              onAfterClick={onSectionEdit}
            />
          </div>

          <div className="space-y-2">
            {/* Persistent Home */}
            {options.storage.persistent_home.enabled && (
              <div className="grid grid-cols-2 items-start">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3 h-3 text-text-heading" />
                  <P className="text-text-heading">Persistent Home</P>
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
              </div>
            )}

            {/* MetaCentrum Storage */}
            {options.storage.metacentrum.enabled && (
              <div className="grid grid-cols-2 items-start">
                <div className="flex items-center gap-2 text-text-heading">
                  <Server className="w-3 h-3" />
                  <P>MetaCentrum</P>
                </div>
                {metaCentrumEnabled ? (
                  <P>{formData?.home || "No storage selected"}</P>
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
                    {options.storage.projects.enabled &&
                      formData?.projectCheck === "yes" && (
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
            )}

            {/* S3 Storage */}
            {options.storage.s3.enabled && (
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
            )}

            {/* Generic fields (delete-home, …) — one row per field */}
            {storageFieldRows.map((field) => {
              const value = fieldValues?.[field.name];
              const isSet =
                field.type === "checkbox" ? value === true : Boolean(value);
              return (
                <div key={field.name} className="grid grid-cols-2 items-start">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3 text-text-heading" />
                    <P className="text-text-heading">
                      {field.summary_label || field.label}
                    </P>
                  </div>
                  <P>
                    {field.type === "checkbox"
                      ? isSet
                        ? "Yes"
                        : "-"
                      : isSet
                        ? String(value)
                        : "-"}
                  </P>
                  {field.type === "checkbox" && isSet && field.warning && (
                    <Small className="block text-amber-600 mt-0.5 pl-5 col-span-2">
                      ⚠ {field.warning}
                    </Small>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasStorageContent && <Separator />}
      {/* Resources Section — only when the instance offers resource options */}
      {hasResourceContent && (
        <div className="px-6">
          <div className="flex items-center justify-between">
            <H4>Resource Configuration</H4>
            <EditButton
              sectionId="resources-section"
              onAfterClick={onSectionEdit}
            />
          </div>
          <div className="grid grid-cols-2">
            {options.resources.cpu.enabled && (
              <span className="inline-flex items-center gap-2 text-text-heading">
                <Cpu className="w-3 h-3" />
                CPU
              </span>
            )}
            {options.resources.cpu.enabled && (
              <Strong>
                {formData?.cpuselection}{" "}
                {formData?.cpuselection === 1 ? "Core" : "Cores"}
              </Strong>
            )}
            {options.resources.memory.enabled && (
              <span className="inline-flex items-center gap-2 text-text-heading">
                <MemoryStick className="w-3 h-3" />
                Memory
              </span>
            )}
            {options.resources.memory.enabled && (
              <Strong>{formData?.memselection} GB</Strong>
            )}
            {options.resources.gpu.enabled && (
              <span className="inline-flex items-center gap-2 text-text-heading">
                <Gpu className="w-3 h-3" />
                GPU
              </span>
            )}
            {options.resources.gpu.enabled && (
              <Strong>{selectedGpuLabel}</Strong>
            )}
          </div>
          {/* Generic fields of the resources section */}
          {resourceFieldRows.length > 0 && (
            <div className="mt-2 space-y-2">
              {resourceFieldRows.map((field) => {
                const value = fieldValues?.[field.name];
                const isSet =
                  field.type === "checkbox" ? value === true : Boolean(value);
                const choice =
                  field.type === "select"
                    ? field.options?.find((option) => option.value === value)
                    : undefined;
                return (
                  <div
                    key={field.name}
                    className="grid grid-cols-2 items-start"
                  >
                    <P className="text-text-heading">
                      {field.summary_label || field.label}
                    </P>
                    <P>{isSet ? (choice?.name ?? String(value)) : "-"}</P>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <Separator />
    </>
  );
}

export function OverviewPanel({
  children,
  className,
  formData,
  selectedImage,
  categoryImage,
  options,
  fieldValues,
}: OverviewPanelProps): JSX.Element {
  return (
    <Panel title={"overview"} className={cn("max-w-md", className)}>
      <PanelTitle className="flex gap-1 items-center pt-6 px-6 text-2xl">
        <LayoutDashboard />
        Configuration Overview
      </PanelTitle>

      <PanelContent className="flex flex-col gap-4">
        <OverviewSections
          formData={formData}
          selectedImage={selectedImage}
          categoryImage={categoryImage}
          options={options}
          fieldValues={fieldValues}
        />
      </PanelContent>

      <PanelContent className="p-6">{children}</PanelContent>
    </Panel>
  );
}

export function OverviewPanelMobile({
  children,
  className,
  formData,
  selectedImage,
  categoryImage,
  options,
  fieldValues,
}: OverviewPanelProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Overview
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className={cn("max-h-[85vh] overflow-y-auto", className)}
      >
        <SheetHeader>
          <SheetTitle className="flex gap-1 items-center text-2xl">
            <LayoutDashboard />
            Configuration Overview
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your configuration before starting the server.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          <OverviewSections
            formData={formData}
            selectedImage={selectedImage}
            categoryImage={categoryImage}
            options={options}
            fieldValues={fieldValues}
            onSectionEdit={() => setOpen(false)}
          />
        </div>

        <SheetFooter className="p-6">{children}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
