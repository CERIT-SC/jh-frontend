import { useState, useEffect, useMemo } from "react";

import { JupyterHubHeader } from "@components/layout";

import { gatherFormData, getS3BucketOptions } from "./utils/gatherFormData";
import {
  ContentBody,
  ContentHeading,
  Panel,
  PanelTitle,
  Button,
  PanelDescription,
  PanelContent,
  Separator,
} from "@e-infra/design-system";
import { OverviewPanel } from "@components/features";
import initDev from "../../dev-setup";
import StorageSelectionSection from "./formSections/StorageSection";
import ResourceSelectionSection from "./formSections/ResourceSection";
import { ImageSelectionSectionTabs } from "./formSections/ImageSection";
import { Alert } from "@components/ui";
import { useAlerts } from "@hooks";
import { Footer } from "@components/layout";
import type { SpawnAppConfig } from "@src-types/appConfig";

/**
 * Global config injected by JupyterHub's Jinja2 template (spawn.html).
 */
declare const appConfig: SpawnAppConfig;

if (import.meta.env.DEV) {
  initDev();
}

const IMAGE_FORM_KEYS = [
  "simplenbname",
  "rnbname",
  "tfnbname",
  "matlabnbname",
  "varnbname",
  "foldnbname",
];

const IMAGE_CATEGORY_KEY_MAP: Record<string, string> = {
  simple: "simplenbname",
  r: "rnbname",
  tf: "tfnbname",
  matlab: "matlabnbname",
  various: "varnbname",
  folding: "foldnbname",
};

/**
 * Form state interface for the spawn form
 * Compatible with StorageSelectionSection's FormState type
 */
interface SpawnFormData {
  memselection?: number;
  cpuselection?: number;
  gpuselection?: string;
  migamount?: number;
  sshAccess?: boolean;
  shmsize?: string;
  s3check?: string;
  s3name?: string;
  s3selection?: string;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  images?: string;
  customimage?: string;
  phselection?: string;
  phCheck?: string;
  phname?: string;
  storageCheck?: string;
  home?: string;
  locationStorageCheck?: string;
  projectCheck?: string;
  [key: string]: unknown;
}

function FormPage() {
  const { alerts, pushAlert, removeAlert } = useAlerts();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [checkedS3Storage, setCheckedS3Storage] = useState(false);
  const [s3values, setS3Values] = useState<Record<string, string>>({});

  useEffect(() => {
    setS3Values(getS3BucketOptions());
  }, []);

  const handleS3Check = (checked: boolean) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };
      if (checked) {
        updatedFormData.s3check = "yes";
      } else {
        delete updatedFormData.s3check;
      }
      return updatedFormData;
    });
    setCheckedS3Storage(checked);
  };

  const defaultFormData = useMemo(() => {
    const gathered = gatherFormData();
    if (gathered === null) {
      return {
        memory: 4,
        gpu: "none",
        cpu: 1,
        metaCentrumHome: {
          enabled: false,
          selectedHome: null,
          mountToStorage: false,
        },
        projectDirectories: false,
        persistentHome: {
          type: "new",
          eraseIfExists: false,
        },
        notebookImage: {
          containerImage: "cerit.io/hubs/datasciencenb:26-09-2024",
          sshAccess: false,
        },
        shmsize: "4",
      };
    }
    return gathered;
  }, []) as any;

  const [formData, setFormData] = useState<SpawnFormData>({
    memselection: 4,
    cpuselection: 1,
    gpuselection: "none",
    migamount: 1,
    sshAccess: false,
    shmsize: "4",
  });

  const submitForm = async () => {
    const isCustomImage = formData.images === "custom";
    const imageCategory = formData.images || selectedCategory;

    // Get the container image based on selection type
    let containerImage: string;
    if (isCustomImage) {
      containerImage = formData.customimage || "";
    } else if (selectedImage) {
      containerImage = `cerit.io/hubs/${selectedImage}`;
    } else {
      const selectedStandardImage = IMAGE_FORM_KEYS.map(
        (key) => formData[key] as string | undefined,
      ).find(Boolean);
      containerImage =
        selectedStandardImage ||
        defaultFormData?.notebookImage?.containerImage ||
        "";
    }

    const phselection = formData.phselection || "new";
    const storageEnabled = formData.storageCheck === "yes";
    const payload: Record<string, string> = {
      cpuselection: String(formData.cpuselection ?? ""),
      memselection: String(formData.memselection ?? ""),
      gpuselection: String(formData.gpuselection ?? "none"),
      shmsize: String(formData.memselection ?? ""),
      images: imageCategory || "",
      phselection,
      container_image: containerImage,
    };

    if (isCustomImage) {
      payload.customimage = containerImage;
    } else if (imageCategory) {
      const imageFieldKey = IMAGE_CATEGORY_KEY_MAP[imageCategory];
      if (imageFieldKey) {
        payload[imageFieldKey] = containerImage;
      }
    }

    if (formData.sshAccess) {
      payload.sshCheck = "yes";
    }

    if (storageEnabled) {
      payload.storageCheck = "yes";
      if (formData.home) {
        payload.home = formData.home as string;
      }
      if (formData.locationStorageCheck === "yes") {
        payload.locationStorageCheck = "yes";
      }
    }

    if (formData.projectCheck === "yes") {
      payload.projectCheck = "yes";
    }

    if (phselection === "existing") {
      payload.phname = formData.phname as string;
    } else if (formData.phCheck === "yes") {
      payload.phCheck = "yes";
    }

    if (payload.gpuselection.startsWith("mig")) {
      if (!formData.migamount) {
        pushAlert("MIG GPU requires selecting MIG amount.", {
          variant: "error",
        });
        return;
      }
      payload.migamount = String(formData.migamount);
    }

    if (checkedS3Storage) {
      payload.s3check = "yes";
      payload.s3selection = formData.s3selection || "existing";
      const s3Sel = formData.s3selection || "existing";
      if (s3Sel === "existing") {
        if (Object.keys(s3values).length === 0) {
          pushAlert(`No existing S3 bucket was found.`, {
            variant: "error",
          });
          return;
        }
        if (!formData.s3name) {
          pushAlert(`Existing S3 bucket was not selected, please choose some`, {
            variant: "error",
          });
          return;
        }
        payload.s3name = formData.s3name as string;
      } else {
        // New/linked bucket
        if (!formData.s3url || !formData.s3bucket) {
          pushAlert(`S3 URL and bucket name are required.`, {
            variant: "error",
          });
          return;
        }
        payload.s3url = formData.s3url as string;
        payload.s3bucket = formData.s3bucket as string;
        payload.s3accesskey = (formData.s3accesskey as string) || "";
        payload.s3secretkey = (formData.s3secretkey as string) || "";
      }
    }

    const requiredKeys = [
      "cpuselection",
      "memselection",
      "gpuselection",
      "images",
    ];
    const missingRequired = requiredKeys.filter((key) => {
      if (!(key in payload)) {
        return true;
      }
      const value = payload[key];
      return value === undefined || value === "";
    });

    if (missingRequired.length > 0) {
      pushAlert(`Missing required options: ${missingRequired.join(", ")}.`, {
        variant: "error",
      });
      return;
    }

    const formDataToSend = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    console.log("Submitting form payload:", payload);
    fetch(appConfig.postUrl as string, {
      method: "POST",
      body: formDataToSend,
    })
      .then((response) => {
        if (response.ok) {
          const pendingUrl = (appConfig.postUrl as string).replace(
            "/spawn/",
            "/spawn-pending/",
          );
          window.location.href = pendingUrl;
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  };
  const serverName = useMemo(() => {
    const pathParts = window.location.pathname.split("/");
    // /spawn/{userName}/{serverName} → last segment
    try {
      return decodeURIComponent(pathParts[pathParts.length - 1]) || null;
    } catch {
      return pathParts[pathParts.length - 1] || null;
    }
  }, []);

  return (
    <div className="">
      <JupyterHubHeader
        userName={appConfig.userName as string}
      ></JupyterHubHeader>
      <Alert alerts={alerts} onRemove={removeAlert} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <ContentHeading>
          {serverName ? `Configure: ${serverName}` : "Start a new server"}
        </ContentHeading>
        <ContentBody>
          <div className="flex flex-row gap-4 xl:gap-12 w-full h-full relative">
            {/* Left side: Scrollable content */}
            <div className=" no-scrollbar flex flex-col gap-8">
              <Panel
                id="image-section"
                className="scroll-mt-20 p-0 bg-background"
              >
                <PanelTitle className="mb-2 px-6 pt-6">
                  Step 1: Environment Options
                </PanelTitle>
                <PanelDescription className="px-6">
                  Select a image for your notebook.
                </PanelDescription>
                <Separator className="mt-2" />
                <PanelContent className="p-6">
                  <ImageSelectionSectionTabs
                    defaultFormData={defaultFormData}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    onImageChange={(data) => {
                      setFormData((prev) => ({
                        ...prev,
                        ...data,
                      }));
                    }}
                    onSshChange={(sshAccess) => {
                      setFormData((prev) => ({
                        ...prev,
                        sshAccess,
                      }));
                    }}
                  />
                </PanelContent>
              </Panel>

              <Panel
                id="storage-section"
                className="scroll-mt-20 p-0 bg-background"
              >
                <PanelTitle className="mb-2 px-6 pt-6">
                  Step 2: Storage Options
                </PanelTitle>
                <PanelDescription className="px-6">
                  Choose if you want to use storage and its type.
                </PanelDescription>
                <Separator className="mt-2" />
                <PanelContent className="p-6">
                  <StorageSelectionSection
                    defaultFormData={defaultFormData}
                    formData={formData}
                    onPersistentHomeChange={(
                      updater: (prev: SpawnFormData) => SpawnFormData,
                    ) => {
                      setFormData((prev) => updater(prev) as SpawnFormData);
                    }}
                    onMetaCentrumChange={(
                      updater: (prev: SpawnFormData) => SpawnFormData,
                    ) => {
                      setFormData((prev) => updater(prev) as SpawnFormData);
                    }}
                    onS3Change={(
                      updater: (prev: SpawnFormData) => SpawnFormData,
                    ) => {
                      setFormData((prev) => updater(prev) as SpawnFormData);
                    }}
                    onS3Check={handleS3Check}
                    checkedS3Storage={checkedS3Storage}
                    setCheckedS3Storage={setCheckedS3Storage}
                    s3values={s3values}
                    pushAlert={(
                      message: string,
                      variant?: "success" | "error" | "info",
                    ) => {
                      const variantMap: Record<
                        string,
                        "success" | "error" | "warning" | "default"
                      > = {
                        success: "success",
                        error: "error",
                        info: "default",
                      };
                      pushAlert(message, {
                        variant: variantMap[variant || "info"] || "default",
                      });
                    }}
                  />
                </PanelContent>
              </Panel>

              <Panel
                id="resources-section"
                className="scroll-mt-20 p-0 bg-background"
              >
                <PanelTitle className="mb-2 px-6 pt-6">
                  Step 3: Resource Options
                </PanelTitle>
                <PanelDescription className="px-6">
                  Select computational resources for your notebook.
                </PanelDescription>
                <Separator className="mt-2" />
                <PanelContent className="p-6">
                  <ResourceSelectionSection
                    formData={formData}
                    defaultFormData={defaultFormData}
                    setFormData={setFormData as any}
                  />
                </PanelContent>
              </Panel>
            </div>

            {/* Right side:Sticky */}
            <div className="min-w-sm relative">
              <div className="sticky top-20">
                <OverviewPanel
                  formData={formData}
                  selectedImage={selectedImage}
                  categoryImage={selectedCategory}
                  className="p-0 bg-background"
                >
                  <Button className="w-full" onClick={submitForm}>
                    Start
                  </Button>
                </OverviewPanel>
              </div>
            </div>
          </div>
        </ContentBody>
      </div>
      <Footer />
    </div>
  );
}

export default FormPage;
