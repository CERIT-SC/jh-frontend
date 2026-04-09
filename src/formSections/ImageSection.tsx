import { useState, useEffect, JSX } from "react";
import { formImagesName } from "../data/formData";
import { SelectingCardsTabs } from "../components/ServerCard/selectingCardsTabs";
import { Separator, Switch, Label } from "@e-infra/design-system";
import { getImageOptions } from "../scripts/gatherFormData";

type ImageOption = { value: string; name: string };
type ImageOptionsByCategory = Record<string, ImageOption[]>;

interface DefaultNotebookImage {
  type?: string;
  sshAccess?: boolean;
  containerImage?: string;
  selectedOption?: {
    value?: string;
    text?: string;
  };
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

  useEffect(() => {
    if (defaultFormData?.notebookImage) {
      setSshChecked(defaultFormData.notebookImage.sshAccess || false);
      onSshChange?.(defaultFormData.notebookImage.sshAccess ?? false);

      const images = getImageOptions() as unknown as ImageOptionsByCategory;
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
      }
    }
  }, []);

  const handleImageSelect = (
    imageValue: string | null,
    categoryKey: string,
  ) => {
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
    });
  };

  const handleSshToggle = (checked: boolean) => {
    setSshChecked(checked);
    onSshChange?.(checked);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-screen">
      <div>
        <h2 className="text-xl font-bold mb-4">1. Choose Environment Type</h2>
        <SelectingCardsTabs
          selectedImageId={selectedImage}
          onSelectImage={handleImageSelect}
          selectedCategory={selectedCategory || undefined}
          setSelectCategory={setSelectedCategory}
        />
      </div>

      <Separator />
      {/* SSH Option */}
      <div className="flex items-center space-x-3">
        <Switch
          id="sshCheckBox"
          checked={sshChecked}
          onCheckedChange={handleSshToggle}
        />
        <Label
          htmlFor="sshCheckBox"
          className="text-sm font-medium cursor-pointer"
        >
          Ensure SSH access into the notebook
        </Label>
      </div>
      {sshChecked && (
        <>
          <div className="text-sm text-gray-600">
            Connection will be available at{" "}
            <strong>{defaultFormData?.sshName || "your SSH name"}</strong>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            In the notebooks, the name is stored as environment variable
            SSH_ADDRESS
          </div>
        </>
      )}
    </div>
  );
}
