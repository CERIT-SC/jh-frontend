import { useMemo, useState, useEffect } from "react";
import { Check, Search, X } from "lucide-react";

import { cn } from "@utils";

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
import { sectionTitles } from "../data/formData";
import { getImageOptions } from "../utils/gatherFormData";

type ImageOptions = Record<string, Array<{ value: string; name: string }>>;

interface SelectingCardTabsProps {
  selectedImageId: string | null;
  onSelectImage: (imageId: string | null, category: string) => void;
  selectedCategory?: string;
  setSelectCategory?: (category: string) => void;
  customImageValue?: string;
  onCustomImageChange?: (value: string) => void;
}

// Feature configuration: abbreviation -> { fullName, style, keywords, description }
const FEATURE_CONFIG: Record<
  string,
  { fullName: string; style: string; keywords: string[]; description: string }
> = {
  AI: {
    fullName: "Artificial Intelligence",
    style: "bg-chart-2/50 text-text",
    keywords: ["ai"],
    description:
      "Pre-installed AI/ML frameworks and tools for machine learning development.",
  },
  SSH: {
    fullName: "SSH Access",
    style: "bg-chart-4/50 text-text",
    keywords: ["ssh", "ssh access"],
    description:
      "Allows direct terminal access to the running notebook container via SSH protocol.",
  },
  GPU: {
    fullName: "GPU Support",
    style: "bg-chart-3/50 text-text",
    keywords: ["gpu"],
    description:
      "Includes GPU drivers and libraries (CUDA/cuDNN). Requires selecting a GPU instance in Resource Options.",
  },
  CPU: {
    fullName: "CPU Only",
    style: "bg-chart-2/50 text-text",
    keywords: ["cpu only"],
    description: "Optimized for CPU-only workloads without GPU acceleration.",
  },
  TB: {
    fullName: "TensorBoard",
    style: "bg-chart-5/50 text-text",
    keywords: ["tensorboard"],
    description:
      "Includes TensorBoard for visualizing machine learning experiments and model training.",
  },
  RSAT: {
    fullName: "RSAT Tools",
    style: "bg-chart-1/50 text-text",
    keywords: ["rsat"],
    description:
      "Regulatory Sequence Analysis Tools for bioinformatics research.",
  },
  VSC: {
    fullName: "Integrated VS Code",
    style: "bg-chart-3/50 text-text",
    keywords: ["vs code", "integrated vs code"],
    description: "Integrated Visual Studio Code editor.",
  },
  NI: {
    fullName: "Notebook Intelligence",
    style: "bg-chart-2/50 text-text",
    keywords: ["notebook-intelligence", "intelligence"],
    description:
      "AI-powered code assistance and suggestions within Jupyter notebooks.",
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
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-semibold">{feature.fullName}</p>
            {FEATURE_CONFIG[feature.abbr]?.description && (
              <p className="text-xs mt-1 text-muted-foreground">
                {FEATURE_CONFIG[feature.abbr].description}
              </p>
            )}
          </TooltipContent>
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
  const allCategories = Object.keys(images);
  const categories = ["all", ...allCategories, "custom"];
  const [activeCategory, setActiveCategory] = useState<string>(
    selectedCategory || "all",
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

    // When switching away from custom, clear the custom image input
    if (category !== "custom") {
      onCustomImageChange?.("");
    }
  };

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (activeCategory === "custom") {
      return [];
    }

    // Get images based on category
    const categoryImages =
      activeCategory === "all"
        ? allCategories.flatMap((cat) => images[cat] || [])
        : images[activeCategory] || [];

    // If no search query, return all images for the category
    if (!searchQuery.trim()) {
      return categoryImages;
    }

    // Filter based on search query
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
  }, [images, allCategories, activeCategory, searchQuery]);

  const clearSearch = (): void => {
    setSearchQuery("");
  };

  // Handle search input - automatically switch to ALL category when typing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (newValue.trim() && activeCategory !== "all") {
      setActiveCategory("all");
      setSelectCategory?.("all");
    }
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
          onChange={handleSearchChange}
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
          const isAllCategory = category === "all";
          return (
            <Badge
              key={category}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200",
                "bg-surface-raised border-surface-raised text-text",
                "hover:bg-primary/10 hover:border-primary",
                isCustomCategory && "bg-tertiary",
                isActive &&
                  "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground",
              )}
              onClick={() => handleCategoryChange(category)}
            >
              {isCustomCategory
                ? "Custom Image"
                : isAllCategory
                  ? "ALL"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 max-h-[calc(3*8rem+2*1rem)] overflow-y-auto custom-scrollbar py-2">
          {filteredImages.map(({ value, name }) => (
            <Card
              key={value}
              className={cn(
                "min-w-auto",
                "bg-surface-raised",
                "group flex max-h-sm relative cursor-pointer border overflow-hidden transition-colors duration-400 ease-in-out",
                selectedImageId === value
                  ? "border-primary via-primary to-primary bg-linear-45 from-secondary from-85% dark:via-secondary dark:from-surface-raised dark:to-secondary dark:bg-linear-45 dark:from-85% shadow-md"
                  : "hover:text-text hover:border-primary/30",
              )}
              onClick={() => onSelectImage(value, activeCategory)}
            >
              {/* Check indicator in corner */}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="truncate text-xl">
                      {extractBaseName(name)}
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>{extractBaseName(name)}</TooltipContent>
                </Tooltip>
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
