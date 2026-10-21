import { useMemo } from "react";

import { OverviewPanel, OverviewPanelMobile } from "@components/features";
import { Button } from "@e-infra/design-system";
import { useAlerts } from "@hooks";
import type { SpawnAppConfig } from "@src-types/appConfig";
import initDev from "../../dev-setup";
import { getAnnouncement } from "@utils/instanceConfig";
import { effectiveFields } from "./sections/registry";

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

  const { options, configProblems } = form;
  const fieldValues = form.formData.fields ?? {};
  const imageFields = effectiveFields(options).filter(
    (field) => field.section === "image",
  );
  const storageFields = effectiveFields(options).filter(
    (field) => field.section === "storage",
  );
  const resourceFields = effectiveFields(options).filter(
    (field) => field.section === "resources",
  );

  // A section renders when it has an enabled group or a generic field.
  const hasStorageSection =
    options.storage.persistent_home.enabled ||
    options.storage.metacentrum.enabled ||
    options.storage.projects.enabled ||
    options.storage.s3.enabled ||
    storageFields.length > 0;
  const hasResourcesSection =
    options.resources.cpu.enabled ||
    options.resources.memory.enabled ||
    options.resources.gpu.enabled ||
    resourceFields.length > 0;

  const hasBlockingProblem = configProblems.some((problem) => problem.blocking);

  const handleSubmit = () => {
    void submit({
      formData: form.formData,
      selectedImage: form.selectedImage,
      checkedS3Storage: form.checkedS3Storage,
      s3values: form.s3values,
      defaultFormData: form.defaultFormData,
      postUrl: appConfig.postUrl as string,
      options: form.options,
    });
  };

  return (
    <SpawnFormLayout
      userName={appConfig.userName as string}
      announcement={getAnnouncement()}
      serverName={serverName}
      alerts={alerts}
      onRemoveAlert={removeAlert}
      problems={configProblems}
    >
      <div className="flex flex-row gap-0 md:gap-4 xl:gap-12 w-full h-full relative">
        {/* Left side: Scrollable content */}
        <div className="no-scrollbar flex flex-col gap-4 md:gap-8 min-w-0 lg:w-2/3 flex-1">
          <StepPanel
            id="image-section"
            stepNumber={1}
            title="Environment Options"
            helpUrl={options.docs.image}
          >
            <ImageSelectionSectionTabs
              defaultFormData={form.defaultFormData}
              image={options.image}
              fields={imageFields}
              fieldValues={fieldValues}
              onFieldChange={form.handleFieldChange}
              selectedImage={form.selectedImage}
              setSelectedImage={form.setSelectedImage}
              selectedCategory={form.selectedCategory}
              setSelectedCategory={form.setSelectedCategory}
              onImageChange={form.handleImageChange}
              onSshChange={form.handleSshChange}
            />
          </StepPanel>

          {hasStorageSection && (
            <StepPanel
              id="storage-section"
              stepNumber={2}
              title="Storage Options"
              description="Choose if you want to use storage and its type."
              helpUrl={options.docs.storage}
            >
              <StorageSelectionSection
                defaultFormData={form.defaultFormData}
                storage={options.storage}
                fields={storageFields}
                fieldValues={fieldValues}
                onFieldChange={form.handleFieldChange}
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
          )}

          {hasResourcesSection && (
            <StepPanel
              id="resources-section"
              stepNumber={hasStorageSection ? 3 : 2}
              title="Resource Options"
              description="Select computational resources for your notebook."
              helpUrl={options.docs.resources}
            >
              <ResourceSelectionSection
                formData={form.formData}
                defaultFormData={form.defaultFormData}
                setFormData={form.handleFormUpdater}
                resources={options.resources}
                fields={resourceFields}
                fieldValues={fieldValues}
                onFieldChange={form.handleFieldChange}
              />
            </StepPanel>
          )}
        </div>

        {/* Right side: Sticky — desktop only */}
        <div className="hidden lg:block lg:w-1/3 min-w-sm relative">
          <div className="sticky top-20">
            <OverviewPanel
              formData={form.formData}
              selectedImage={form.selectedImage}
              categoryImage={form.selectedCategory}
              options={options}
              fieldValues={fieldValues}
              className="p-0 bg-background"
            >
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || hasBlockingProblem}
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
            options={options}
            fieldValues={fieldValues}
          >
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting || hasBlockingProblem}
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
