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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Badge,
  CardContent,
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

// Feature configuration: abbreviation -> { fullName, style }
const FEATURE_CONFIG: Record<
  string,
  { fullName: string; style: string; keywords: string[] }
> = {
  AI: {
    fullName: "Artificial Intelligence",
    style: "bg-chart-2 text-muted",
    keywords: ["ai"],
  },
  SSH: {
    fullName: "SSH Access",
    style: "bg-success/50 text-success-foreground",
    keywords: ["ssh", "ssh access"],
  },
  GPU: {
    fullName: "GPU Support",
    style: "bg-orange-100 text-orange-800",
    keywords: ["gpu"],
  },
  CPU: {
    fullName: "CPU Only",
    style: "bg-yellow-100 text-yellow-800",
    keywords: ["cpu only"],
  },
  TB: {
    fullName: "TensorBoard",
    style: "bg-indigo-100 text-indigo-800",
    keywords: ["tensorboard"],
  },
  RSAT: {
    fullName: "RSAT Tools",
    style: "bg-teal-100 text-teal-800",
    keywords: ["rsat"],
  },
  VSC: {
    fullName: "Integrated VS Code",
    style: "bg-info/50 text-info-foreground",
    keywords: ["vs code", "integrated vs code"],
  },
  NI: {
    fullName: "Notebook Intelligence",
    style: "bg-pink-100 text-pink-800",
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
        style: "bg-secondary text-gray-800",
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
              className="transition-all duration-300 line-clamp-1 text-sm truncate-multi"
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
                    "group flex max-h-sm relative cursor-pointer border overflow-hidden transition-all duration-300",
                    selectedImageId === value
                      ? "border-primary via-primary to-primary bg-linear-45 from-white from-85% shadow-md"
                      : "hover:text-primary hover:border-primary/30",
                  )}
                  onClick={() => onSelectImage(value, category)}
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default SelectingCardsTabs;
