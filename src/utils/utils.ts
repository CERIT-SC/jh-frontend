import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Regex for validating Docker image references.
 */
export const DOCKER_IMAGE_REGEX =
  /^(?<Name>(?<=^)(?:(?<Domain>(?:(?:localhost|[\w-]+(?:\.[\w-]+)+)(?::\d+)?)|[\w]+:\d+)\/)?\/?(?<Namespace>(?:(?:[a-z0-9]+(?:(?:[._]|__|[-]*)[a-z0-9]+)*)\/)*)(?<Repo>[a-z0-9-]+))[:@]?(?<Reference>(?<=:)(?<Tag>[\w][\w.-]{0,127})|(?<=@)(?<Digest>[A-Za-z][A-Za-z0-9]*(?:[-_+.][A-Za-z][A-Za-z0-9]*)*[:][0-9A-Fa-f]{32,}))?/;

/**
 * Validates whether a string is a valid Docker image reference.
 */
export function validateDockerImage(image: string): boolean {
  const trimmed = image.trim();
  if (!trimmed) return false;
  return DOCKER_IMAGE_REGEX.test(trimmed);
}

export function dateFormat(date: string | number | Date): string {
  if (!date || date === 0) {
    return "Never";
  }
  const formattedDate = new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return formattedDate;
}
export function dateFormatRelative(date: string | number | Date): string {
  if (!date || date === 0) {
    return "Never active";
  }
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}
