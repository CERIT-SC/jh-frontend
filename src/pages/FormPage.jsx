import React, { useState, useEffect } from "react";

import JupyterHubHeader from "../components/FooterAndHeader/JupyterHubHeader";

import { gatherFormData, getS3BucketOptions } from "../scripts/gatherFormData";
import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { Panel, Button } from "@e-infra/design-system";
import { OverviewPanel } from "../components/overviewPanel";
import initDev from "../dev-setup";
import StorageSelectionSection from "../formSections/StorageSection";
import ResourceSelectionSection from "../formSections/ResourceSection";
import { ImageSelectionSectionTabs } from "../formSections/ImageSection";
import { Alert } from "../components/Alert";
import { useAlerts } from "../hooks/useAlerts";

// Initialize dev mode synchronously at module load time
// This must run before gatherFormData() is called in useMemo
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

const IMAGE_CATEGORY_KEY_MAP = {
  simple: "simplenbname",
  r: "rnbname",
  tf: "tfnbname",
  matlab: "matlabnbname",
  various: "varnbname",
  folding: "foldnbname",
};

function FormPage() {
  const { alerts, pushAlert, removeAlert } = useAlerts();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [checkedS3Storage, setCheckedS3Storage] = useState(false);
  const [s3SelectionType, setS3SelectionType] = useState("");
  const [s3values, setS3Values] = useState({});

  useEffect(() => {
    setS3Values(getS3BucketOptions());
  }, []);

  const handleS3Check = (checked) => {
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

  const validateS3Credentials = async () => {
    const client = new S3Client({
      endpoint: formData.s3url,
      forcePathStyle: true, // Required for some non-AWS S3 providers to make bucket part of path
      region: "us-east-1", // can be anything but empty ("" not ok)
      credentials: {
        accessKeyId: formData.s3accesskey,
        secretAccessKey: formData.s3secretkey,
      },
    });

    let bucketName = formData.s3bucket;
    let prefix = undefined;

    // Check if bucket string contains ':' or '/'
    const separatorIndex = Math.min(
      bucketName.indexOf(":") !== -1 ? bucketName.indexOf(":") : Infinity,
      bucketName.indexOf("/") !== -1 ? bucketName.indexOf("/") : Infinity,
    );

    if (separatorIndex !== Infinity) {
      // Split into bucket and prefix (key)
      bucketName = formData.s3bucket.substring(0, separatorIndex);
      prefix = formData.s3bucket.substring(separatorIndex + 1);

      // Remove leading slash if present in prefix
      prefix = prefix.replace(/^\//, "");
    }

    const command = new ListObjectsCommand({
      Bucket: bucketName,
      ...(prefix && { Prefix: prefix }), // Conditionally add Prefix if exists
    });

    try {
      await client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Compute defaultFormData once using useMemo
  const defaultFormData = React.useMemo(() => {
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
  }, []);

  const [formData, setFormData] = useState({
    memselection: 4,
    cpuselection: 1,
    gpuselection: "none",
    migamount: 1,
    sshAccess: false,
    shmsize: "4",
    s3url: "https://s3.cloud.e-infra.cz",
    s3bucket: "",
    s3accesskey: "",
    s3secretkey: "",
  });

  const submitForm = async () => {
    const selectedImageKey =
      formData.images === "custom" ? "customimage" : null;
    const selectedStandardImage = IMAGE_FORM_KEYS.map(
      (key) => formData[key],
    ).find(Boolean);
    const defaultContainerImage =
      defaultFormData?.notebookImage?.containerImage;
    const containerImage = selectedImageKey
      ? formData[selectedImageKey]
      : selectedStandardImage || defaultContainerImage;

    const imageCategory = formData.images || selectedCategory;
    const imageFieldKey = IMAGE_CATEGORY_KEY_MAP[imageCategory];
    const imageFieldValue = selectedImage
      ? `cerit.io/hubs/${selectedImage}`
      : containerImage;

    const phselection = formData.phselection || "new";
    const storageEnabled = formData.storageCheck === "yes";
    const payload = {
      cpuselection: String(formData.cpuselection ?? ""),
      memselection: String(formData.memselection ?? ""),
      gpuselection: String(formData.gpuselection ?? "none"),
      shmsize: String(formData.memselection ?? ""),
      images: imageCategory,
      phselection,
      container_image: containerImage,
    };

    if (imageCategory === "custom") {
      payload.customimage = imageFieldValue;
    } else if (imageFieldKey) {
      payload[imageFieldKey] = imageFieldValue;
    }

    if (formData.sshAccess) {
      payload.sshCheck = "yes";
    }

    if (storageEnabled) {
      payload.storageCheck = "yes";
      if (formData.home) {
        payload.home = formData.home;
      }
      if (formData.locationStorageCheck === "yes") {
        payload.locationStorageCheck = "yes";
      }
    }

    if (formData.projectCheck === "yes") {
      payload.projectCheck = "yes";
    }

    if (phselection === "existing") {
      payload.phname = formData.phname;
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

    if (checkedS3Storage && !s3SelectionType) {
      pushAlert(
        "Please choose either 'New' or 'Existing' S3 bucket option or deselect S3 choice.",
        { variant: "error" },
      );
      return;
    }

    if (checkedS3Storage && s3SelectionType === "existing") {
      if (Object.keys(s3values).length === 0) {
        pushAlert(
          `No existing S3 bucket was found, please choose option 'New'`,
          {
            variant: "error",
          },
        );
        return;
      }
      if (!formData.s3name) {
        pushAlert(`Existing S3 bucket was not selected, please choose some`, {
          variant: "error",
        });
        return;
      }
      payload.s3name = formData.s3name;
    }

    if (checkedS3Storage && s3SelectionType === "new") {
      const requiredS3Fields = [
        "s3url",
        "s3bucket",
        "s3accesskey",
        "s3secretkey",
      ];
      const missingS3 = requiredS3Fields.filter(
        (key) => !String(formData[key] ?? "").trim(),
      );

      if (missingS3.length > 0) {
        pushAlert(`Please fill all S3 fields: ${missingS3.join(", ")}.`, {
          variant: "error",
        });
        return;
      }

      if (!String(formData.s3url).startsWith("https://")) {
        pushAlert("S3 URL must start with https://", { variant: "error" });
        return;
      }

      payload.s3url = formData.s3url;
      payload.s3bucket = formData.s3bucket;
      payload.s3accesskey = formData.s3accesskey;
      payload.s3secretkey = formData.s3secretkey;

      const response = await validateS3Credentials();
      if (!response) {
        pushAlert(
          "Invalid S3 credentials/bucket/S3 url - cannot connect to the bucket.\n\nCheck inputs are correct.",
          { variant: "error" },
        );
        return;
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
    fetch(appConfig.postUrl, {
      method: "POST",
      body: formDataToSend,
    })
      .then((response) => {
        if (response.ok) {
          const pendingUrl = appConfig.postUrl.replace(
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

  return (
    <>
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <Alert alerts={alerts} onRemove={removeAlert} />
      <div className="flex flex-row gap-12 w-full h-full px-4 relative max-w-7xl mx-auto">
        {/* Left side: Scrollable content taking 2/3 */}
        <div className="w-2/3 no-scrollbar pt-4 flex flex-col gap-8">
          <Panel>
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
          </Panel>

          <Panel>
            <StorageSelectionSection
              defaultFormData={defaultFormData}
              formData={formData}
              onPersistentHomeChange={(updater) => {
                setFormData((prev) => updater(prev));
              }}
              onMetaCentrumChange={(updater) => {
                setFormData((prev) => updater(prev));
              }}
              onS3Change={(updater) => {
                setFormData((prev) => updater(prev));
              }}
              onS3Check={handleS3Check}
              checkedS3Storage={checkedS3Storage}
              setCheckedS3Storage={setCheckedS3Storage}
              s3SelectionType={s3SelectionType}
              setS3SelectionType={setS3SelectionType}
              s3values={s3values}
            />
          </Panel>

          <Panel>
            <ResourceSelectionSection
              formData={formData}
              defaultFormData={defaultFormData}
              setFormData={setFormData}
            />
          </Panel>
        </div>

        {/* Right side:Sticky 1/3 */}
        <div className="w-1/3 relative">
          <div className="sticky top-20">
            <OverviewPanel
              formData={formData}
              selectedImage={selectedImage}
              categoryImage={selectedCategory}
            >
              <Button className="w-full" onClick={submitForm}>
                Start
              </Button>
            </OverviewPanel>
          </div>
        </div>
      </div>
    </>
  );
}

export default FormPage;
