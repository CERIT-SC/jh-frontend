import { useState, useEffect, useMemo, useCallback } from "react";
import { DropDownMenu } from "../components/DropDownMenu/DropDownMenu";
import {
  getPersistentHomeOptions,
  getMetaCentrumHomeOptions,
} from "../scripts/gatherFormData";
import { Switch, Alert, Label, Input } from "@e-infra/design-system";
import { AlertTriangle, HardDrive, Cloud, Server } from "lucide-react";
import { TileSelector } from "../components/TileSelector/TileSelector";
import { ToggleCard } from "../components/ToggleCard/ToggleCard";

// ============================================================================
// Type Definitions
// ============================================================================

type FormState = Record<string, unknown>;
type FormUpdater = (prev: FormState) => FormState;

interface StorageFormData extends FormState {
  home?: string;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
}

interface StorageDefaultFormData {
  persistentHome?: {
    type?: string;
    eraseIfExists?: boolean;
    selectedHome?: { value?: string };
  };
  projectDirectories?: boolean;
  metaCentrumHome?: {
    enabled?: boolean;
    selectedHome?: { value?: string };
    mountToStorage?: boolean;
  };
  s3Storage?: {
    enabled?: boolean;
    type?: string;
    existings3?: { value?: string };
    news3?: {
      s3Url?: string;
      s3Bucket?: string;
      s3AccessKey?: string;
      s3SecretKey?: string;
    };
  };
}

interface StorageSelectionSectionProps {
  defaultFormData?: StorageDefaultFormData;
  formData: StorageFormData;
  onPersistentHomeChange: (updater: FormUpdater) => void;
  onMetaCentrumChange: (updater: FormUpdater) => void;
  onS3Change: (updater: FormUpdater) => void;
  onS3Check: (checked: boolean) => void;
  checkedS3Storage: boolean;
  setCheckedS3Storage: (checked: boolean) => void;
  s3SelectionType: string;
  setS3SelectionType: (selectionType: string) => void;
  s3values: Record<string, string>;
}

declare const appConfig: { userName?: string };

// ============================================================================
// Constants
// ============================================================================

const PERSISTENT_HOME_OPTIONS = [
  {
    value: "new",
    label: "New",
    description: "Create a new persistent home directory",
  },
  {
    value: "existing",
    label: "Existing",
    description: "Use an existing persistent home",
  },
];

const S3_OPTIONS = [
  {
    value: "existing",
    label: "Existing",
    description: "Mount an existing S3 bucket",
  },
  { value: "new", label: "New", description: "Configure a new S3 bucket" },
];

// ============================================================================
// Main Component
// ============================================================================

export default function StorageSelectionSection({
  defaultFormData,
  formData,
  onPersistentHomeChange,
  onMetaCentrumChange,
  onS3Change,
  onS3Check,
  checkedS3Storage,
  setCheckedS3Storage,
  s3SelectionType,
  setS3SelectionType,
  s3values,
}: StorageSelectionSectionProps): JSX.Element {
  // State management
  const [phSelectionType, setPhSelectionType] = useState<"new" | "existing">(
    "new",
  );
  const [checkedErased, setCheckErased] = useState(false);
  const [checkedDirectories, setCheckedDirectories] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [checkedMount, setCheckedMount] = useState(false);

  const [defaultOptionPhname, setDefaultOptionPhname] = useState<
    [string, string] | undefined
  >(undefined);
  const [defaultOptionS3name, setDefaultOptionS3name] = useState<
    [string, string] | undefined
  >(undefined);
  const [defaultHome, setDefaultHome] = useState<[string, string] | undefined>(
    undefined,
  );

  // Memoized options
  const storageOptions = useMemo(
    () => getMetaCentrumHomeOptions(),
    [],
  ) as Record<string, string>;

  const persistentHomeOptions = useMemo(() => {
    const options = getPersistentHomeOptions();
    if (Array.isArray(options) && options.length > 0) {
      return options.reduce<Record<string, string>>((acc, option) => {
        acc[option] = option;
        return acc;
      }, {});
    }
    return { testing: "testing" };
  }, []);

  // Initialize from default form data
  useEffect(() => {
    if (!defaultFormData) return;

    // Persistent Home initialization
    if (defaultFormData.persistentHome) {
      const text = defaultFormData.persistentHome.type;
      const selectionType = text === "new" ? "new" : "existing";
      setPhSelectionType(selectionType);
      onPersistentHomeChange((prev) => ({
        ...prev,
        phselection: text,
      }));

      if (defaultFormData.persistentHome.eraseIfExists) {
        setCheckErased(true);
        onPersistentHomeChange((prev) => ({
          ...prev,
          phCheck: true,
        }));
      }

      const phname = defaultFormData.persistentHome.selectedHome?.value;
      if (phname) {
        setDefaultOptionPhname([phname, phname]);
        onPersistentHomeChange((prev) => ({
          ...prev,
          phname: phname,
        }));
      }
    }

    // Project directories
    if (defaultFormData.projectDirectories) {
      setCheckedDirectories(true);
      onMetaCentrumChange((prev) => ({
        ...prev,
        projectCheck: "yes",
      }));
    }

    // MetaCentrum Home
    if (defaultFormData.metaCentrumHome?.enabled) {
      setCheckedStorage(true);
      onMetaCentrumChange((prev) => ({
        ...prev,
        storageCheck: "yes",
      }));

      const selectedHome = defaultFormData.metaCentrumHome.selectedHome?.value;
      if (selectedHome) {
        setDefaultHome([selectedHome, selectedHome]);
        onMetaCentrumChange((prev) => ({
          ...prev,
          home: selectedHome,
        }));
      }

      if (defaultFormData.metaCentrumHome.mountToStorage) {
        setCheckedMount(true);
        onMetaCentrumChange((prev) => ({
          ...prev,
          locationStorageCheck: "yes",
        }));
      }
    }

    // S3 Storage
    if (defaultFormData.s3Storage) {
      const enabled = defaultFormData.s3Storage.enabled ?? false;
      setCheckedS3Storage(enabled);

      if (enabled) {
        onS3Change((prev) => ({
          ...prev,
          s3check: "yes",
        }));
      }

      const s3Type =
        defaultFormData.s3Storage.type === "new" ? "new" : "existing";
      setS3SelectionType(s3Type);
      onS3Change((prev) => ({
        ...prev,
        s3selection: s3Type,
      }));

      if (defaultFormData.s3Storage.existings3?.value) {
        const name = defaultFormData.s3Storage.existings3.value;
        setDefaultOptionS3name([name, name]);
        onS3Change((prev) => ({
          ...prev,
          s3name: name,
        }));
      }

      if (defaultFormData.s3Storage.news3) {
        onS3Change((prev) => ({
          ...prev,
          s3url: defaultFormData.s3Storage!.news3!.s3Url,
          s3bucket: defaultFormData.s3Storage!.news3!.s3Bucket,
          s3accesskey: defaultFormData.s3Storage!.news3!.s3AccessKey,
          s3secretkey: defaultFormData.s3Storage!.news3!.s3SecretKey,
        }));
      }
    }
  }, []);

  // Sync Persistent Home selection to formData
  useEffect(() => {
    onPersistentHomeChange((prev) => ({
      ...prev,
      phselection: phSelectionType,
    }));
  }, [phSelectionType]);

  // Sync S3 selection to formData
  useEffect(() => {
    setS3SelectionType(s3SelectionType);
    onS3Change((prev) => ({
      ...prev,
      s3selection: s3SelectionType,
    }));
  }, [s3SelectionType]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleStorage = useCallback(
    (storage: string) => {
      onMetaCentrumChange((prev) => ({
        ...prev,
        home: storage,
      }));
    },
    [onMetaCentrumChange],
  );

  const handlePersistentHome = useCallback(
    (val: string) => {
      onPersistentHomeChange((prev) => ({
        ...prev,
        phname: val,
      }));
    },
    [onPersistentHomeChange],
  );

  const handleStorageCheck = useCallback(
    (checked: boolean) => {
      onMetaCentrumChange((prev) => {
        const updatedFormData = { ...prev };
        if (checked) {
          updatedFormData.storageCheck = "yes";
        } else {
          delete updatedFormData.storageCheck;
        }
        return updatedFormData;
      });
      setCheckedStorage(checked);
    },
    [onMetaCentrumChange],
  );

  const handleCheckboxDirectories = useCallback(
    (checked: boolean) => {
      onMetaCentrumChange((prev) => {
        const updatedFormData = { ...prev };
        if (checked) {
          updatedFormData.projectCheck = "yes";
        } else {
          delete updatedFormData.projectCheck;
        }
        return updatedFormData;
      });
      setCheckedDirectories(checked);
    },
    [onMetaCentrumChange],
  );

  const handleErase = useCallback(
    (checked: boolean) => {
      setCheckErased(checked);
      onPersistentHomeChange((prev) => {
        const updatedFormData = { ...prev };
        if (checked) {
          updatedFormData.phCheck = "yes";
        } else {
          delete updatedFormData.phCheck;
        }
        return updatedFormData;
      });
    },
    [onPersistentHomeChange],
  );

  const handleLocationStorageCheck = useCallback(
    (checked: boolean) => {
      onMetaCentrumChange((prev) => {
        const updatedFormData = { ...prev };
        if (checked) {
          updatedFormData.locationStorageCheck = "yes";
        } else {
          delete updatedFormData.locationStorageCheck;
        }
        return updatedFormData;
      });
      setCheckedMount(checked);
    },
    [onMetaCentrumChange],
  );

  const handleS3Buckets = useCallback(
    (val: string) => {
      onS3Change((prev) => ({
        ...prev,
        s3name: val,
      }));
    },
    [onS3Change],
  );

  const createS3ChangeHandler = useCallback(
    (field: "s3url" | "s3bucket" | "s3accesskey" | "s3secretkey") =>
      (value: string) => {
        onS3Change((prev) => ({
          ...prev,
          [field]: value,
        }));
      },
    [onS3Change],
  );

  const handleS3UrlChange = useMemo(
    () => createS3ChangeHandler("s3url"),
    [createS3ChangeHandler],
  );
  const handleS3BucketChange = useMemo(
    () => createS3ChangeHandler("s3bucket"),
    [createS3ChangeHandler],
  );
  const handleS3AccessKeyChange = useMemo(
    () => createS3ChangeHandler("s3accesskey"),
    [createS3ChangeHandler],
  );
  const handleS3SecretKeyChange = useMemo(
    () => createS3ChangeHandler("s3secretkey"),
    [createS3ChangeHandler],
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="form-wrap max-w-4xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Configure Storage
        </h2>
        <p className="text-sm text-gray-600">
          Select and configure storage options for your Jupyter notebook
          environment.
        </p>
      </div>

      {/* Persistent Home Configuration */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-3 ">
          <HardDrive
            className="w-5 h-5 text-gray-600 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Persistent Notebook Home
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Persistent home ensures your data persists even when the notebook
              is deleted. Mounted to{" "}
              <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
                /home/jovyan
              </code>
            </p>
          </div>
        </div>

        {/* Tile Selector for New/Existing */}
        <div className="mb-4">
          <TileSelector
            selectionText="Select Type"
            options={PERSISTENT_HOME_OPTIONS}
            value={phSelectionType}
            onChange={(val: string) =>
              setPhSelectionType(val as "new" | "existing")
            }
            ariaLabel="Persistent home type selection"
          />
        </div>

        {/* New Home Configuration */}
        {phSelectionType === "new" && (
          <div className="space-y-4 pl-4 border-l-2 border-blue-200">
            {/* Inline Warning with Checkbox */}
            <div className="flex items-start gap-3">
              <Switch
                id="phCheckId"
                checked={checkedErased}
                onCheckedChange={handleErase}
              />
              <div className="flex-1">
                <label
                  htmlFor="phCheckId"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Erase if home exists
                </label>
                {checkedErased && (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">
                      Warning: This will erase all existing data in your
                      persistent home directory!
                    </span>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Existing Home Configuration */}
        {phSelectionType === "existing" && (
          <div className="pl-4 border-l-2 border-blue-200">
            <DropDownMenu
              formSelect={handlePersistentHome}
              title="Select Persistent Home"
              menuOptions={persistentHomeOptions}
              defaultOption={defaultOptionPhname}
            />
          </div>
        )}
      </section>
      {/* Top Layer: Toggle Cards Overview */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Storage Options
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Persistent Home Toggle - Always enabled, shows as configured */}
          {/* <ToggleCard
            id="persistent-home"
            title="Persistent Home"
            description="Persistent notebook home directory"
            icon={<HardDrive className="w-5 h-5" />}
            enabled={true}
            onToggle={() => {}}
            disabled={true}
            badge="Required"
          /> */}

          {/* MetaCentrum Storage Toggle */}
          <ToggleCard
            id="metacentrum-storage"
            title="MetaCentrum Storage"
            description="Mount MetaCentrum home directory and project folders"
            icon={<Server className="w-5 h-5" />}
            enabled={checkedStorage}
            onToggle={handleStorageCheck}
          />

          {/* S3 Storage Toggle */}
          <ToggleCard
            id="s3-storage"
            title="S3 Object Storage"
            description="Mount S3-compatible object storage bucket"
            icon={<Cloud className="w-5 h-5" />}
            enabled={checkedS3Storage}
            onToggle={onS3Check}
          />
        </div>
      </div>

      {/* Bottom Layer: Expanded Configurators */}
      <div className="space-y-6">
        {/* MetaCentrum Storage Configuration */}
        <section
          className={`bg-white rounded-lg border p-6 shadow-sm transition-all duration-300 ${
            checkedStorage ? "border-blue-200" : "border-gray-200 opacity-60"
          }`}
          aria-disabled={!checkedStorage}
        >
          <div className="flex items-start gap-3">
            <Server
              className={`w-5 h-5 mt-0.5 ${checkedStorage ? "text-blue-500" : "text-gray-400"}`}
              aria-hidden="true"
            />
            <div className="flex-1">
              <h3
                className={`text-base font-semibold ${checkedStorage ? "text-gray-900" : "text-gray-500"}`}
              >
                MetaCentrum Storage Configuration
              </h3>
              <p
                className={`text-sm mt-1 ${checkedStorage ? "text-gray-600" : "text-gray-400"}`}
              >
                Mounted to{" "}
                <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  /home/meta/{appConfig.userName}
                </code>
              </p>
            </div>
          </div>

          {checkedStorage ? (
            <div className="space-y-4 pl-4 border-l-2 border-blue-200 animate-in fade-in-0 duration-300">
              {/* Storage Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Storage
                </Label>
                <DropDownMenu
                  formSelect={handleStorage}
                  title="Select MetaCentrum Storage"
                  menuOptions={storageOptions}
                  defaultOption={defaultHome}
                />
              </div>

              {/* Mount Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    id="locationStorageCheckId"
                    checked={checkedMount}
                    onCheckedChange={handleLocationStorageCheck}
                  />
                  <label
                    htmlFor="locationStorageCheckId"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Mount selected home to{" "}
                    <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
                      /storage/{formData["home"] ?? "chosen_storage"}/home/
                      {appConfig.userName}
                    </code>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Switch
                    id="projectCheckId"
                    checked={checkedDirectories}
                    onCheckedChange={handleCheckboxDirectories}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="projectCheckId"
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Mount project directories
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      All projects mounted to{" "}
                      <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
                        /home/projects/brno12
                      </code>
                      , specific projects are subfolders
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">
              Enable MetaCentrum storage above to configure mount options
            </div>
          )}
        </section>

        {/* S3 Storage Configuration */}
        <section
          className={`bg-white rounded-lg border p-6 shadow-sm transition-all duration-300 ${
            checkedS3Storage ? "border-blue-200" : "border-gray-200 opacity-60"
          }`}
          aria-disabled={!checkedS3Storage}
        >
          <div className="flex items-start gap-3 mb-4">
            <Cloud
              className={`w-5 h-5 mt-0.5 ${checkedS3Storage ? "text-blue-500" : "text-gray-400"}`}
              aria-hidden="true"
            />
            <div className="flex-1">
              <h3
                className={`text-base font-semibold ${checkedS3Storage ? "text-gray-900" : "text-gray-500"}`}
              >
                S3 Object Storage Configuration
              </h3>
              <p
                className={`text-sm mt-1 ${checkedS3Storage ? "text-gray-600" : "text-gray-400"}`}
              >
                Mounted to{" "}
                <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  /storage/s3
                </code>
              </p>
            </div>
          </div>

          {checkedS3Storage ? (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              {/* S3 Type Selection */}
              <div className="pl-4 border-l-2 border-blue-200">
                <TileSelector
                  selectionText="Select Bucket Type"
                  options={S3_OPTIONS}
                  value={s3SelectionType}
                  onChange={setS3SelectionType}
                  ariaLabel="S3 bucket type selection"
                />
              </div>

              {/* Existing S3 Bucket */}
              {s3SelectionType === "existing" && (
                <div className="pl-4 border-l-2 border-blue-200 animate-in fade-in-0 duration-200">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Existing Bucket
                  </Label>
                  <DropDownMenu
                    formSelect={handleS3Buckets}
                    title="Select S3 Bucket"
                    menuOptions={s3values}
                    defaultOption={defaultOptionS3name}
                  />
                </div>
              )}

              {/* New S3 Bucket */}
              {s3SelectionType === "new" && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200 animate-in fade-in-0 duration-200">
                  <div>
                    <Label
                      htmlFor="s3-url"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      S3 URL
                    </Label>
                    <Input
                      id="s3-url"
                      type="text"
                      value={formData.s3url ?? ""}
                      placeholder="https://s3.cloud.e-infra.cz"
                      onChange={(e) => handleS3UrlChange(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="s3-bucket"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Bucket Name
                    </Label>
                    <Input
                      id="s3-bucket"
                      type="text"
                      value={formData.s3bucket ?? ""}
                      placeholder="example-bucket"
                      onChange={(e) => handleS3BucketChange(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="s3-access-key"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Access Key
                    </Label>
                    <Input
                      id="s3-access-key"
                      type="text"
                      value={formData.s3accesskey ?? ""}
                      placeholder="s3AccessKey"
                      onChange={(e) => handleS3AccessKeyChange(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="s3-secret-key"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Secret Key
                    </Label>
                    <Input
                      id="s3-secret-key"
                      type="password"
                      value={formData.s3secretkey ?? ""}
                      placeholder="s3SecretKey"
                      onChange={(e) => handleS3SecretKeyChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">
              Enable S3 storage above to configure bucket settings
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
