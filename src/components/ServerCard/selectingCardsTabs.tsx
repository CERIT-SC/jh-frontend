import { useMemo, useState, useEffect } from "react";
import { Check, Search, X } from "lucide-react";

import { cn } from "../../utils/utils";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Badge,
  Input,
  P,
} from "@e-infra/design-system";
import { sectionTitles } from "../../data/formData";
import { getImageOptions } from "../../scripts/gatherFormData";

type ImageOptions = Record<string, Array<{ value: string; name: string }>>;

interface SelectingCardTabsProps {
  selectedImageId: string | null;
  onSelectImage: (imageId: string | null, category: string) => void;
  selectedCategory?: string;
  setSelectCategory?: (category: string) => void;
  customImageValue?: string;
  onCustomImageChange?: (value: string) => void;
}

// Feature configuration: abbreviation -> { fullName, style }
const FEATURE_CONFIG: Record<
  string,
  { fullName: string; style: string; keywords: string[] }
> = {
  AI: {
    fullName: "Artificial Intelligence",
    style: "bg-chart-2/50 text-text",
    keywords: ["ai"],
  },
  SSH: {
    fullName: "SSH Access",
    style: "bg-chart-4/50 text-text",
    keywords: ["ssh", "ssh access"],
  },
  GPU: {
    fullName: "GPU Support",
    style: "bg-chart-3/50 text-text",
    keywords: ["gpu"],
  },
  CPU: {
    fullName: "CPU Only",
    style: "bg-chart-2/50 text-text",
    keywords: ["cpu only"],
  },
  TB: {
    fullName: "TensorBoard",
    style: "bg-chart-5/50 text-text",
    keywords: ["tensorboard"],
  },
  RSAT: {
    fullName: "RSAT Tools",
    style: "bg-chart-1/50 text-text",
    keywords: ["rsat"],
  },
  VSC: {
    fullName: "Integrated VS Code",
    style: "bg-chart-3/50 text-text",
    keywords: ["vs code", "integrated vs code"],
  },
  NI: {
    fullName: "Notebook Intelligence",
    style: "bg-chart-2/50 text-text",
    keywords: ["notebook-intelligence", "intelligence"],
  },
};

/**
 * Extracts the base image name without feature suffixes and version
 * e.g., "Minimal NB with Integrated VS Code and AI" -> "Minimal NB"
 * e.g., "TensorFlow 2.11.1 with GPU" -> "TensorFlow"
 * e.g., "TensorFlow 2.10 (CPU only)" -> "TensorFlow"
 */
function extractBaseName(name: string): string {
  // First remove content in parentheses (e.g., "(CPU only)")
  let baseName = name.replace(/\s*\([^)]*\)/g, "");

  // Remove " with ..." pattern
  const withIndex = baseName.toLowerCase().indexOf(" with ");
  if (withIndex !== -1) {
    baseName = baseName.substring(0, withIndex).trim();
  }

  // Remove version numbers (e.g., "2.11.1", "4.4.1", "R2024a")
  // Pattern: number followed by dots and numbers, or R followed by year
  baseName = baseName.replace(/\s+[\d]+\.[\d.]+/g, ""); // Remove " 2.11.1", " 4.4.1"
  baseName = baseName.replace(/\s+R\d{4}[a-z]?/gi, ""); // Remove " R2024a", " R2023a"

  return baseName.trim();
}

/**
 * Extracts date/version from image value (after colon)
 * Supports multiple date formats:
 * - DD-MM-YYYY: "minimalnb:02-01-2025-ai" -> "02-01-2025"
 * - YYYY-MM-DD: "image:2025-01-02" -> "2025-01-02"
 * - Version: "tensorflowgpu:2.11.1" -> "2.11.1"
 * - R version: "matlab:r2024a" -> "R2024a"
 */
function extractDateFromValue(value: string): string | null {
  // Split by colon and get the part after
  const parts = value.split(":");
  if (parts.length < 2) {
    return null;
  }

  const versionPart = parts[1];

  // Match date pattern DD-MM-YYYY (day-month-year)
  const dateDMYMatch = versionPart.match(/^(\d{2}-\d{2}-\d{4})/);
  if (dateDMYMatch) {
    return dateDMYMatch[1];
  }

  // Match date pattern YYYY-MM-DD (year-month-day, ISO format)
  const dateYMDMatch = versionPart.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateYMDMatch) {
    return dateYMDMatch[1];
  }

  // Match version patterns like "2.11.1", "4.4.1"
  const versionMatch = versionPart.match(/^(\d+\.\d+(?:\.\d+)?)/);
  if (versionMatch) {
    return versionMatch[1];
  }

  // Match R version like "r2024a", "R2023a"
  const rVersionMatch = versionPart.match(/^(r\d{4}[a-z]?)/i);
  if (rVersionMatch) {
    return rVersionMatch[1].toUpperCase();
  }

  return null;
}

function extractImageBadge(
  name: string,
  value?: string,
): React.ReactElement | null {
  const foundFeatures: Array<{
    abbr: string;
    fullName: string;
    style: string;
  }> = [];

  const nameLower = name.toLowerCase();

  // Extract date/version from value if provided
  if (value) {
    const dateVersion = extractDateFromValue(value);
    if (dateVersion) {
      foundFeatures.push({
        abbr: dateVersion,
        fullName: `Version ${dateVersion}`,
        style: "bg-surface text-text ring-1 ring-border",
      });
    }
  }

  // Check each feature's keywords
  for (const [abbr, config] of Object.entries(FEATURE_CONFIG)) {
    const matchesFeature = config.keywords.some((keyword) =>
      nameLower.includes(keyword),
    );
    if (matchesFeature) {
      foundFeatures.push({
        abbr,
        fullName: config.fullName,
        style: config.style,
      });
    }
  }

  if (foundFeatures.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex gap-1">
      {foundFeatures.map((feature, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Badge className={`px-2 py-0.5 ${feature.style}`}>
              {feature.abbr}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">{feature.fullName}</TooltipContent>
        </Tooltip>
      ))}
    </span>
  );
}

export function SelectingCardsTabs({
  selectedImageId,
  onSelectImage,
  selectedCategory,
  setSelectCategory,
  customImageValue = "",
  onCustomImageChange,
}: SelectingCardTabsProps) {
  const images = useMemo(() => getImageOptions() as ImageOptions, []);
  const categories = [...Object.keys(images), "custom"];
  const [activeCategory, setActiveCategory] = useState<string>(
    selectedCategory || categories[0] || "simple",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync activeCategory with selectedCategory prop changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== activeCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategoryChange = (category: string): void => {
    setActiveCategory(category);
    setSelectCategory?.(category);
    setSearchQuery(""); // Reset search when changing category

    // Only notify parent for non-custom categories
    // Custom category should only trigger update when user types in the input
    if (category !== "custom") {
      // Don't select any image, just update the category
      // User needs to click on an image to select it
    }
  };

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    // Don't show images for custom category
    if (activeCategory === "custom") {
      return [];
    }
    const categoryImages = images[activeCategory] || [];
    if (!searchQuery.trim()) {
      return categoryImages;
    }
    const query = searchQuery.toLowerCase();
    return categoryImages.filter(({ name, value }) => {
      const baseName = extractBaseName(name).toLowerCase();
      const fullName = name.toLowerCase();
      const imageValue = value.toLowerCase();
      return (
        baseName.includes(query) ||
        fullName.includes(query) ||
        imageValue.includes(query)
      );
    });
  }, [images, activeCategory, searchQuery]);

  const clearSearch = (): void => {
    setSearchQuery("");
  };

  const handleCustomImageInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    onCustomImageChange?.(e.target.value);
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          className="pl-10 pr-10 bg-surface-raised"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category Badge Triggers */}
      <div className="flex flex-wrap gap-2 animate-fade-in">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const isCustomCategory = category === "custom";
          return (
            <Badge
              key={category}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200",
                "bg-surface-raised border-surface-raised text-text",
                "hover:bg-primary/10 hover:border-primary",
                isActive &&
                  "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground",
              )}
              onClick={() => handleCategoryChange(category)}
            >
              {isCustomCategory
                ? "Custom Image"
                : sectionTitles[category as keyof typeof sectionTitles] ||
                  category}
            </Badge>
          );
        })}
      </div>

      {/* Custom Image Input */}
      {activeCategory === "custom" && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <P className="text-sm text-muted-foreground">
              Provide image name in format repo/image_name:tag or
              repo/image_name
            </P>
            <Input
              type="text"
              placeholder="e.g., cerit.io/hubs/custom-image:latest"
              value={customImageValue}
              onChange={handleCustomImageInput}
              className="w-full bg-surface-raised"
            />
          </div>
        </div>
      )}

      {/* Results count */}
      {searchQuery && activeCategory !== "custom" && (
        <P>
          Found {filteredImages.length} image
          {filteredImages.length !== 1 ? "s" : ""}
        </P>
      )}

      {/* Image Cards Grid */}
      {activeCategory !== "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredImages.map(({ value, name }) => (
            <Card
              key={value}
              className={cn(
                "bg-surface-raised",
                "group flex max-h-sm relative cursor-pointer border overflow-hidden transition-all duration-300",
                selectedImageId === value
                  ? "border-primary via-primary to-primary bg-linear-45 from-secondary from-85% dark:via-secondary dark:from-surface-raised dark:to-secondary dark:bg-linear-45 dark:from-85% shadow-md"
                  : "hover:text-text hover:border-primary/30",
              )}
              onClick={() => onSelectImage(value, activeCategory)}
            >
              {/* Check indicator in corner - visible on hover when not selected */}
              <div
                className={cn(
                  "absolute top-2 right-2 z-10 transition-opacity duration-200",
                  selectedImageId === value
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50",
                )}
              >
                <Check
                  className={cn(
                    "size-5",
                    selectedImageId === value
                      ? "text-primary-foreground"
                      : "text-primary",
                  )}
                />
              </div>
              <CardHeader>
                <CardTitle className="flex-shrink-0">
                  {extractBaseName(name)}
                </CardTitle>
                <CardDescription>
                  {extractImageBadge(name, value)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectingCardsTabs;
