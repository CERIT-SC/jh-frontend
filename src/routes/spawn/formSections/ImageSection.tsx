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
import { getImageOptions } from "../utils/gatherFormData";

type ImageOption = { value: string; name: string };
type ImageOptionsByCategory = Record<string, ImageOption[]>;

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

function findImage(
  imageValue: string,
  images: ImageOptionsByCategory,
): [string, string] | [null, null] {
  for (const [catKey, catImages] of Object.entries(images)) {
    const foundImage = catImages.find((img) => img.value === imageValue);
    if (foundImage) {
      return [catKey, foundImage.value];
    }
  }
  return [null, null];
}

/**
 * Checks if the given image value corresponds to an SSH-capable image
 * by looking for SSH keywords in the image name.
 */
function imageHasSSHSupport(
  imageValue: string | null,
  images: ImageOptionsByCategory,
): boolean {
  if (!imageValue) return false;

  for (const catImages of Object.values(images)) {
    const found = catImages.find((img) => img.value === imageValue);
    if (found) {
      const nameLower = found.name.toLowerCase();
      return nameLower.includes("ssh");
    }
  }
  return false;
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

  const images = getImageOptions() as unknown as ImageOptionsByCategory;

  const isSSHAvailable = useMemo(() => {
    if (!selectedImage && selectedCategory !== "custom") return false;
    if (selectedCategory === "custom") return true;
    return imageHasSSHSupport(selectedImage, images);
  }, [selectedImage, selectedCategory, images]);

  useEffect(() => {
    if (!isSSHAvailable && sshChecked) {
      setSshChecked(false);
      onSshChange?.(false);
    }
  }, [isSSHAvailable]);

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

      const [category, image] = findImage(strippedVal, images);
      if (category && image) {
        const formImagesMap = formImagesName as Record<string, string>;
        const formImageKey = formImagesMap[category] || category;
        setSelectedCategory(category);
        setSelectedImage(image);
        onImageChange?.({
          images: category,
          [formImageKey]: `cerit.io/hubs/${image}`,
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
  }, []);

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

    const formImagesMap = formImagesName as Record<string, string>;
    const formImageKey = formImagesMap[categoryKey] || categoryKey;
    setSelectedImage(imageValue);
    setSelectedCategory(categoryKey);

    onImageChange?.({
      images: categoryKey,
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
      <div>
        <SelectingCardsTabs
          selectedImageId={selectedImage}
          onSelectImage={handleImageSelect}
          selectedCategory={selectedCategory || undefined}
          setSelectCategory={setSelectedCategory}
          customImageValue={customImageValue}
          onCustomImageChange={handleCustomImageChange}
        />
      </div>

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
              "data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-primary/80 dark:data-[state=checked]:bg-secondary",
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
