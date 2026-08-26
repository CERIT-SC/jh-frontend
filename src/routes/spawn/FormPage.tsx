import { useMemo } from "react";

import { OverviewPanel, OverviewPanelMobile } from "@components/features";
import { Button } from "@e-infra/design-system";
import { useAlerts } from "@hooks";
import type { SpawnAppConfig } from "@src-types/appConfig";
import initDev from "../../dev-setup";

import { DOCS_URLS } from "./data/formConstants";
import { useSpawnFormState } from "./hooks/useSpawnFormState";
import { useSpawnFormSubmit } from "./hooks/useSpawnFormSubmit";
import SpawnFormLayout from "./components/SpawnFormLayout";
import StepPanel from "./components/StepPanel";
import { ImageSelectionSectionTabs } from "./formSections/ImageSection";
import StorageSelectionSection from "./formSections/StorageSection";
import ResourceSelectionSection from "./formSections/ResourceSection";
import { getServerName } from "./utils/getServerName";

/**
 * Global config injected by JupyterHub's Jinja2 template (spawn.html).
 */
declare const appConfig: SpawnAppConfig;

if (import.meta.env.DEV) {
  initDev();
}

function FormPage() {
  const { alerts, pushAlert, removeAlert } = useAlerts();
  const form = useSpawnFormState(pushAlert);
  const { isSubmitting, submit } = useSpawnFormSubmit({ pushAlert });
  const serverName = useMemo(getServerName, []);

  const handleSubmit = () => {
    void submit({
      formData: form.formData,
      selectedImage: form.selectedImage,
      checkedS3Storage: form.checkedS3Storage,
      s3values: form.s3values,
      defaultFormData: form.defaultFormData,
      postUrl: appConfig.postUrl as string,
    });
  };

  return (
    <SpawnFormLayout
      userName={appConfig.userName as string}
      announcement={appConfig.announcement}
      serverName={serverName}
      alerts={alerts}
      onRemoveAlert={removeAlert}
    >
      <div className="flex flex-row gap-0 md:gap-4 xl:gap-12 w-full h-full relative">
        {/* Left side: Scrollable content */}
        <div className="no-scrollbar flex flex-col gap-4 md:gap-8 min-w-0 flex-1">
          <StepPanel
            id="image-section"
            stepNumber={1}
            title="Environment Options"
            helpUrl={DOCS_URLS.image}
          >
            <ImageSelectionSectionTabs
              defaultFormData={form.defaultFormData}
              selectedImage={form.selectedImage}
              setSelectedImage={form.setSelectedImage}
              selectedCategory={form.selectedCategory}
              setSelectedCategory={form.setSelectedCategory}
              onImageChange={form.handleImageChange}
              onSshChange={form.handleSshChange}
            />
          </StepPanel>

          <StepPanel
            id="storage-section"
            stepNumber={2}
            title="Storage Options"
            description="Choose if you want to use storage and its type."
            helpUrl={DOCS_URLS.storage}
          >
            <StorageSelectionSection
              defaultFormData={form.defaultFormData}
              formData={form.formData}
              onPersistentHomeChange={form.handleFormUpdater}
              onMetaCentrumChange={form.handleFormUpdater}
              onS3Change={form.handleFormUpdater}
              onS3Check={form.handleS3Check}
              checkedS3Storage={form.checkedS3Storage}
              setCheckedS3Storage={form.setCheckedS3Storage}
              s3values={form.s3values}
              pushAlert={form.pushAlertAdapter}
            />
          </StepPanel>

          <StepPanel
            id="resources-section"
            stepNumber={3}
            title="Resource Options"
            description="Select computational resources for your notebook."
            helpUrl={DOCS_URLS.resources}
          >
            <ResourceSelectionSection
              formData={form.formData}
              defaultFormData={form.defaultFormData}
              setFormData={form.handleFormUpdater}
            />
          </StepPanel>
        </div>

        {/* Right side: Sticky — desktop only */}
        <div className="hidden lg:block min-w-sm relative">
          <div className="sticky top-20">
            <OverviewPanel
              formData={form.formData}
              selectedImage={form.selectedImage}
              categoryImage={form.selectedCategory}
              className="p-0 bg-background"
            >
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Validating..." : "Start"}
              </Button>
            </OverviewPanel>
          </div>
        </div>

        {/* Mobile: floating trigger + bottom sheet */}
        <div className="lg:hidden">
          <OverviewPanelMobile
            formData={form.formData}
            selectedImage={form.selectedImage}
            categoryImage={form.selectedCategory}
          >
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Validating..." : "Start"}
            </Button>
          </OverviewPanelMobile>
        </div>
      </div>
    </SpawnFormLayout>
  );
}

export default FormPage;
