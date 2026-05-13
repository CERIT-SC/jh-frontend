import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

/**
 * Validates that a server name is valid for use in JupyterHub with Kubernetes backend.
 *
 * Kubernetes requires RFC 1123 label format names.
 *
 * @param name - The server name to validate
 * @returns An object with isValid boolean and optional error message
 */
export function validateServerName(name: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, errorMessage: "Server name cannot be empty" };
  }

  if (trimmed.length > 63) {
    return {
      isValid: false,
      errorMessage:
        "Server name must be 63 characters or less (Kubernetes DNS label limit)",
    };
  }

  // Kubernetes RFC 1123 label pattern: lowercase alphanumeric and dashes only
  const k8sPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

  if (!k8sPattern.test(trimmed)) {
    return {
      isValid: false,
      errorMessage:
        "Server name must contain only lowercase letters, numbers, and dashes (-), and must start and end with a letter or number (e.g., 'my-server', 'project1')",
    };
  }

  // Reject names with consecutive dashes
  if (trimmed.includes("--")) {
    return {
      isValid: false,
      errorMessage: "Server name cannot contain consecutive dashes",
    };
  }

  return { isValid: true };
}
