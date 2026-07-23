/**
 * @fileoverview Owns all spawn-form UI state and memoized handlers.
 *
 * Replaces scattered useState/useCallback declarations in FormPage.tsx.
 * Exposes a single object so the component can consume state/handlers via
 * destructuring or namespaced access (`form.formData`, `form.handleS3Check`).
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import type React from "react";
import { gatherFormData, getS3BucketOptions } from "../utils/gatherFormData";
import { DEFAULT_FORM_DATA, INITIAL_FORM_DATA } from "../data/formConstants";
import type { DefaultFormData, SpawnFormData } from "@src-types/spawnForm";

/** Adapter variant type used by StorageSelectionSection.pushAlert. */
export type StorageAlertVariant = "success" | "error" | "info";

/** Push-alert signature from useAlerts (loosened to accept any variant string). */
export type PushAlertFn = (
  message: string,
  options?: { variant?: string },
) => void;

/** Return type of the useSpawnFormState hook. */
export interface SpawnFormState {
  // State
  selectedImage: string | null;
  selectedCategory: string | null;
  checkedS3Storage: boolean;
  s3values: Record<string, string>;
  formData: SpawnFormData;
  defaultFormData: DefaultFormData;
  isInitializing: boolean;

  // Raw setters (for components that need direct control)
  setSelectedImage: (image: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setCheckedS3Storage: (checked: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<SpawnFormData>>;

  // Memoized handlers (stable references)
  handleS3Check: (checked: boolean) => void;
  handleImageChange: (data: Partial<SpawnFormData>) => void;
  handleSshChange: (sshAccess: boolean) => void;
  /** Unified updater for sub-sections that use the (updater) => void pattern. */
  handleFormUpdater: (updater: (prev: SpawnFormData) => SpawnFormData) => void;
  /** Adapter that maps StorageSection's variant union to useAlerts variants. */
  pushAlertAdapter: (message: string, variant?: StorageAlertVariant) => void;
}

/**
 * Owns spawn-form state and handlers.
 *
 * @param pushAlert - The pushAlert fn from useAlerts (passed in to keep the
 *   hook decoupled from useAlerts' exact return shape).
 */
export function useSpawnFormState(pushAlert: PushAlertFn): SpawnFormState {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [checkedS3Storage, setCheckedS3Storage] = useState(false);
  const [s3values, setS3Values] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SpawnFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    setS3Values(getS3BucketOptions());
  }, []);

  const defaultFormData = useMemo<DefaultFormData>(() => {
    const gathered = gatherFormData();
    return gathered === null
      ? DEFAULT_FORM_DATA
      : (gathered as DefaultFormData);
  }, []);

  const handleS3Check = useCallback((checked: boolean) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (checked) {
        next.s3check = "yes";
      } else {
        delete next.s3check;
      }
      return next;
    });
    setCheckedS3Storage(checked);
  }, []);

  const handleImageChange = useCallback((data: Partial<SpawnFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleSshChange = useCallback((sshAccess: boolean) => {
    setFormData((prev) => ({ ...prev, sshAccess }));
  }, []);

  const handleFormUpdater = useCallback(
    (updater: (prev: SpawnFormData) => SpawnFormData) => {
      setFormData((prev) => updater(prev));
    },
    [],
  );

  // StorageSection uses "success" | "error" | "info"; map to useAlerts variants.
  const VARIANT_MAP: Record<StorageAlertVariant, string> = {
    success: "success",
    error: "error",
    info: "default",
  };

  const pushAlertAdapter = useCallback(
    (message: string, variant: StorageAlertVariant = "info") => {
      pushAlert(message, {
        variant: VARIANT_MAP[variant] || "default",
      });
    },
    [pushAlert],
  );

  return {
    selectedImage,
    selectedCategory,
    checkedS3Storage,
    s3values,
    formData,
    defaultFormData,
    isInitializing: false,
    setSelectedImage,
    setSelectedCategory,
    setCheckedS3Storage,
    setFormData,
    handleS3Check,
    handleImageChange,
    handleSshChange,
    handleFormUpdater,
    pushAlertAdapter,
  };
}
