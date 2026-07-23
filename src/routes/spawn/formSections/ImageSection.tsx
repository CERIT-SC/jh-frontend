import { useState, useEffect, useMemo } from "react";
import { formImagesName } from "../data/formData";
import { SelectingCardsTabs } from "@components/features";
import {
  Separator,
  Switch,
  Label,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@e-infra/design-system";
import { cn } from "@utils";
import {
  buildImageValueToCategoryMap,
  buildImageValueToNameMap,
} from "../utils/gatherFormData";

interface DefaultNotebookImage {
  type?: string;
  sshAccess?: boolean;
  containerImage?: string;
  selectedOption?: string;
}

type ImageFormDataUpdate = Record<string, string> & { images: string };

interface ImageSelectionProps {
  defaultFormData?: {
    notebookImage?: DefaultNotebookImage;
    sshName?: string;
  };
  onImageChange?: (data: ImageFormDataUpdate) => void;
  onSshChange?: (checked: boolean) => void;
  selectedImage: string | null;
  setSelectedImage: (value: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (value: string) => void;
}

/**
 * Finds the category for a given image value using O(1) lookup.
 * @param imageValue - The image value to look up
 * @param imageToCategoryMap - Pre-built Map for O(1) lookup
 * @returns The category key or null if not found
 */
function findImageCategory(
  imageValue: string,
  imageToCategoryMap: Map<string, string>,
): string | null {
  return imageToCategoryMap.get(imageValue) || null;
}

/**
 * Checks if the given image value corresponds to an SSH-capable image
 * by looking for SSH keywords in the image name using O(1) lookup.
 */
function imageHasSSHSupport(
  imageValue: string | null,
  imageToNameMap: Map<string, string>,
): boolean {
  if (!imageValue) return false;

  const imageName = imageToNameMap.get(imageValue);
  if (!imageName) return false;

  return imageName.toLowerCase().includes("ssh");
}
export function ImageSelectionSectionTabs({
  defaultFormData,
  onImageChange,
  onSshChange,
  selectedImage,
  setSelectedImage,
  selectedCategory,
  setSelectedCategory,
}: ImageSelectionProps) {
  const [sshChecked, setSshChecked] = useState(false);
  const [customImageValue, setCustomImageValue] = useState("");

  // Build O(1) lookup maps once
  const imageToCategoryMap = useMemo(() => buildImageValueToCategoryMap(), []);
  const imageToNameMap = useMemo(() => buildImageValueToNameMap(), []);

  const isSSHAvailable = useMemo(() => {
    if (!selectedImage && selectedCategory !== "custom") return false;
    if (selectedCategory === "custom") return true;
    return imageHasSSHSupport(selectedImage, imageToNameMap);
  }, [selectedImage, selectedCategory, imageToNameMap]);

  useEffect(() => {
    if (!isSSHAvailable && sshChecked) {
      setSshChecked(false);
      onSshChange?.(false);
    }
  }, [isSSHAvailable]);

  useEffect(() => {
    if (selectedCategory !== "custom") {
      setCustomImageValue("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (defaultFormData?.notebookImage) {
      setSshChecked(defaultFormData.notebookImage.sshAccess || false);
      onSshChange?.(defaultFormData.notebookImage.sshAccess ?? false);

      // Check if it's a custom image (type === "customnb")
      if (defaultFormData.notebookImage.type === "customnb") {
        const customValue = defaultFormData.notebookImage.selectedOption || "";
        setCustomImageValue(customValue);
        setSelectedCategory("custom");
        setSelectedImage(null);
        onImageChange?.({
          images: "custom",
          customimage: customValue,
        });
        return;
      }

      const imgVal = defaultFormData.notebookImage.containerImage;
      const strippedVal = imgVal?.replace("cerit.io/hubs/", "");

      if (!strippedVal) {
        return;
      }

      const category = findImageCategory(strippedVal, imageToCategoryMap);
      if (category) {
        const formImagesMap = formImagesName as Record<string, string>;
        const formImageKey = formImagesMap[category] || category;
        setSelectedCategory(category);
        setSelectedImage(strippedVal);
        onImageChange?.({
          images: category,
          [formImageKey]: `cerit.io/hubs/${strippedVal}`,
        });
      } else {
        setCustomImageValue(imgVal || "");
        setSelectedCategory("custom");
        setSelectedImage(null);
        onImageChange?.({
          images: "custom",
          customimage: imgVal || "",
        });
      }
    }
  }, [imageToCategoryMap]);

  const handleImageSelect = (
    imageValue: string | null,
    categoryKey: string,
  ) => {
    if (categoryKey === "custom") {
      setSelectedImage(null);
      setSelectedCategory("custom");

      if (customImageValue) {
        onImageChange?.({
          images: "custom",
          customimage: customImageValue,
        });
      }
      return;
    }

    if (!imageValue) {
      return;
    }

    // When selecting from the "all" tab, resolve to the image's actual category
    let actualCategory = categoryKey;
    if (categoryKey === "all") {
      const resolvedCategory = findImageCategory(
        imageValue,
        imageToCategoryMap,
      );
      if (resolvedCategory) {
        actualCategory = resolvedCategory;
      }
    }

    const formImagesMap = formImagesName as Record<string, string>;
    const formImageKey = formImagesMap[actualCategory] || actualCategory;
    setSelectedImage(imageValue);
    setSelectedCategory(actualCategory);

    onImageChange?.({
      images: actualCategory,
      [formImageKey]: `cerit.io/hubs/${imageValue}`,
      customimage: "",
    });
  };

  const handleCustomImageChange = (value: string) => {
    setCustomImageValue(value);
    setSelectedCategory("custom");
    setSelectedImage(null);
    onImageChange?.({
      images: "custom",
      customimage: value,
    });
  };

  const handleSshToggle = (checked: boolean) => {
    setSshChecked(checked);
    onSshChange?.(checked);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-screen">
      <SelectingCardsTabs
        selectedImageId={selectedImage}
        onSelectImage={handleImageSelect}
        selectedCategory={selectedCategory || undefined}
        setSelectCategory={setSelectedCategory}
        customImageValue={customImageValue}
        onCustomImageChange={handleCustomImageChange}
      />

      <Separator />

      {/* SSH Option */}
      <Tooltip>
        <div className="flex items-center space-x-3">
          <Switch
            id="sshCheckBox"
            checked={sshChecked}
            onCheckedChange={handleSshToggle}
            disabled={!isSSHAvailable}
            className={cn(
              "data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-secondary dark:data-[state=checked]:bg-primary",
              !isSSHAvailable && "opacity-50 cursor-not-allowed",
            )}
          />
          <TooltipTrigger>
            <Label
              htmlFor="sshCheckBox"
              className={cn(
                "text-sm font-medium",
                isSSHAvailable
                  ? "cursor-pointer"
                  : "cursor-not-allowed text-muted-foreground",
              )}
            >
              Ensure SSH access into the notebook
            </Label>
          </TooltipTrigger>
        </div>
        {!isSSHAvailable && (
          <TooltipContent side="top">
            <p>SSH access is only available for images with the SSH support.</p>
          </TooltipContent>
        )}
      </Tooltip>
      {sshChecked && (
        <>
          <div className="text-sm text-text-muted">
            Connection will be available at{" "}
            <strong>{defaultFormData?.sshName || "your SSH name"}</strong>
          </div>
          <div className="text-xs text-text-muted mt-1">
            In the notebooks, the name is stored as environment variable
            SSH_ADDRESS
          </div>
        </>
      )}
    </div>
  );
}
