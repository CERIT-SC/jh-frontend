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
import type { SpawnOptions } from "@src-types/spawnOptions";
import {
  BADGE_KEYWORDS,
  BADGE_STYLES,
  DEFAULT_BADGES,
  DEFAULT_BADGE_STYLE,
  VERSION_CHIP_STYLE,
} from "../data/imageBadges";

interface SelectingCardTabsProps {
  selectedImageId: string | null;
  onSelectImage: (imageId: string | null, category: string) => void;
  selectedCategory?: string;
  setSelectCategory?: (category: string) => void;
  customImageValue?: string;
  onCustomImageChange?: (value: string) => void;
  /** The `image` slice of the resolved spawn options. */
  image: SpawnOptions["image"];
}

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

/**
 * Schema-aware badge extraction.
 *
 * - Per-image `version` present → verbatim version chip; absent → the
 *   existing tag-regex chain over the image value.
 * - Per-image `badges` present (even `[]`) → explicit mode: registry lookup
 *   per key (unknown keys are skipped — the resolver already reported them).
 * - `badges` absent → the name-keyword heuristic over the FE registry
 *   (hub parity).
 * Chip styling never leaves FE code.
 */
function extractImageBadge(
  entry: { value: string; name: string; badges?: string[]; version?: string },
  badgeConfig: SpawnOptions["image"]["badge_config"],
): React.ReactElement | null {
  const foundFeatures: Array<{
    abbr: string;
    fullName: string;
    style: string;
  }> = [];

  // Version chip: verbatim `version` when given, else the tag-regex chain.
  const version = entry.version ?? extractDateFromValue(entry.value);
  if (version) {
    foundFeatures.push({
      abbr: version,
      fullName: `Version ${version}`,
      style: VERSION_CHIP_STYLE,
    });
  }

  // The FE registry is always part of the lookup (backend badge_config is
  // merged per key over it; the legacy adapter ships an empty config).
  const mergedConfig: Record<string, { name: string; description: string }> =
    Object.fromEntries(
      Object.entries({ ...DEFAULT_BADGES, ...badgeConfig }).map(
        ([key, def]) => [key, { name: def.name, description: def.description }],
      ),
    );

  if (entry.badges !== undefined) {
    // Explicit mode: badges come from the schema only.
    for (const key of entry.badges) {
      const def = mergedConfig[key];
      if (!def) {
        continue; // unknown key — skipped (resolver reports the problem)
      }
      foundFeatures.push({
        abbr: key,
        fullName: def.name,
        style: BADGE_STYLES[key] ?? DEFAULT_BADGE_STYLE,
      });
    }
  } else {
    // Heuristic mode: name keywords over the FE registry (hub parity).
    const nameLower = entry.name.toLowerCase();
    for (const [abbr, keywords] of Object.entries(BADGE_KEYWORDS)) {
      if (keywords.some((keyword) => nameLower.includes(keyword))) {
        const def = mergedConfig[abbr];
        if (!def) {
          continue;
        }
        foundFeatures.push({
          abbr,
          fullName: def.name,
          style: BADGE_STYLES[abbr] ?? DEFAULT_BADGE_STYLE,
        });
      }
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
            {mergedConfig[feature.abbr]?.description && (
              <p className="text-xs mt-1 text-muted-foreground">
                {mergedConfig[feature.abbr].description}
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
  image,
}: SelectingCardTabsProps) {
  // Category tab list + labels + image lists all come from the schema slice.
  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        image.categories.map((category) => [category.key, category.name]),
      ) as Record<string, string>,
    [image.categories],
  );
  const images = useMemo(() => {
    const byCategory: Record<
      string,
      Array<{
        value: string;
        name: string;
        badges?: string[];
        version?: string;
      }>
    > = {};
    for (const category of image.categories) {
      byCategory[category.key] = category.images;
    }
    return byCategory;
  }, [image.categories]);
  const allCategories = Object.keys(images);
  const categories = [
    "all",
    ...allCategories,
    ...(image.custom.enabled ? ["custom"] : []),
  ];
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
                "cursor-pointer px-3 py-1 text-xs transition-all duration-200",
                "bg-surface-raised border-surface-raised text-text",
                "hover:bg-primary/10 hover:border-primary",
                isCustomCategory && "bg-secondary",
                isActive &&
                  "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
              )}
              onClick={() => handleCategoryChange(category)}
            >
              {isCustomCategory
                ? "Custom Image"
                : isAllCategory
                  ? "ALL"
                  : categoryLabels[category] || category}
            </Badge>
          );
        })}
      </div>

      {/* Custom Image Input */}
      {activeCategory === "custom" && (
        <div className="space-y-3 ">
          <div className="flex flex-col gap-2">
            <P className="text-sm text-text-muted">
              Provide image name in format repo/image_name:tag or
              repo/image_name
            </P>
            <Input
              type="text"
              placeholder={image.custom.placeholder}
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
      <div className="">
        {activeCategory !== "custom" && (
          <>
            <span className="text-sm text-text-heading pl-1">
              Available Images
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 max-h-[calc(3*8rem+2*1rem)] overflow-y-auto custom-scrollbar py-2">
              {filteredImages.map((entry) => (
                <Card
                  key={entry.value}
                  className={cn(
                    "bg-surface-raised",
                    "group relative isolate flex max-h-sm cursor-pointer border overflow-hidden transition-colors duration-400 ease-in-out",
                    selectedImageId === entry.value
                      ? "border-primary shadow-md"
                      : "hover:text-text hover:border-primary/30",
                  )}
                  onClick={() => onSelectImage(entry.value, activeCategory)}
                >
                  {selectedImageId === entry.value && (
                    <>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-0 right-0 -z-10 size-24 bg-secondary [clip-path:polygon(100%_0,0_0,100%_100%)] dark:bg-surface-raised"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-0 right-0 -z-10 size-16 bg-primary [clip-path:polygon(100%_0,0_0,100%_100%)]"
                      />
                    </>
                  )}

                  {/* Check indicator in corner */}
                  <div
                    className={cn(
                      "absolute top-2 right-2 z-10 transition-opacity duration-200",
                      selectedImageId === entry.value
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <Check
                      className={cn(
                        "size-5",
                        selectedImageId === entry.value
                          ? "text-primary-foreground"
                          : "text-tertiary",
                      )}
                    />
                  </div>

                  <CardHeader className="min-w-0 pr-12">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CardTitle className="truncate text-xl">
                          {extractBaseName(entry.name)}
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent>
                        {extractBaseName(entry.name)}
                      </TooltipContent>
                    </Tooltip>
                    <CardDescription>
                      {extractImageBadge(entry, image.badge_config)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SelectingCardsTabs;
