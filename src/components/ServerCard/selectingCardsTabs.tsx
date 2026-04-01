import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import { cn } from "../../utils/utils";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@e-infra/design-system";
import { sectionTitles } from "../../data/formData";
import { getImageOptions } from "../../scripts/gatherFormData";

type ImageOptions = Record<string, Array<{ value: string; name: string }>>;

interface SelectingCardTabsProps {
  selectedImageId: string | null;
  onSelectImage: (imageId: string | null, category: string) => void;
  selectedCategory?: string;
  setSelectCategory?: (category: string) => void;
}

export function SelectingCardsTabs({
  selectedImageId,
  onSelectImage,
  selectedCategory,
  setSelectCategory,
}: SelectingCardTabsProps) {
  const images = useMemo(() => getImageOptions() as ImageOptions, []);
  const categories = Object.keys(images);
  const [activeTab, setActiveTab] = useState<string>(
    selectedCategory || categories[0] || "simple",
  );

  return (
    <div className="w-full">
      <Tabs
        className="animation"
        defaultValue={selectedCategory || ""}
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          //   onSelectImage(null); // Reset image selection when switching tabs
          setSelectCategory && setSelectCategory(value);
        }}
      >
        <TabsList
          className="grid w-full gap-2 animate-fade-in"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))`,
          }}
        >
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="transition-all duration-300 line-clamp-1 text-sm"
            >
              {sectionTitles[category as keyof typeof sectionTitles] ||
                category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {(images[category] || []).map(({ value, name }) => (
                <Card
                  key={value}
                  className={cn(
                    "flex relative cursor-pointer border",
                    selectedImageId === value
                      ? "border-infra-primary"
                      : "border-gradient hover:border-infra-primary/50",
                  )}
                  onClick={() => onSelectImage(value, category)}
                >
                  <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {value}
                    </CardDescription>
                  </CardHeader>
                  <Check
                    className={cn(
                      "size-7 transition-all duration-200 ease-in-out absolute top-2 right-2",
                      selectedImageId === value
                        ? "text-infra-primary"
                        : "text-transparent group-hover:text-infra-primary/50",
                    )}
                  />
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default SelectingCardsTabs;
