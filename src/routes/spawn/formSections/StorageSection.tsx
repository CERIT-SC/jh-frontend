import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { DropDownMenu } from "@components/ui";
import {
  getPersistentHomeOptions,
  getMetaCentrumHomeOptions,
} from "../utils/gatherFormData";
import {
  Switch,
  Alert,
  Label,
  Badge,
  H3,
  Code,
  P,
  Link,
  H4,
  Input,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@e-infra/design-system";
import {
  AlertTriangle,
  HardDrive,
  Cloud,
  Server,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@utils";

// ==============================================================================
// Type Definitions
// ==============================================================================

type FormState = Record<string, unknown>;
type FormUpdater = (prev: FormState) => FormState;

interface StorageFormData extends FormState {
  home?: string;
  s3check?: string;
  s3name?: string;
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
    existings3?: { value?: string };
    s3url?: string | null;
    s3bucket?: string | null;
    s3accesskey?: string | null;
    s3secretkey?: string | null;
    s3selection?: string;
    s3existing?: string;
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
  s3values: Record<string, string>;
  pushAlert: (message: string, variant?: "success" | "error" | "info") => void;
}

declare const appConfig: { userName?: string };

// ==============================================================================
// Section Container Component
// ==============================================================================

interface SectionContainerContextValue {
  enabled: boolean;
  onToggle?: (enabled: boolean) => void;
}

const SectionContainerContext = createContext<SectionContainerContextValue>({
  enabled: true,
});

interface SectionContainerProps {
  children?: React.ReactNode;
  className?: string;
  /** Whether the section is enabled (content visible) */
  enabled?: boolean;
  /** Callback when toggle switch is clicked */
  onToggle?: (enabled: boolean) => void;
  /** ID for the section */
  id?: string;
}

interface SectionHeaderProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  /** Whether to show toggle switch in header */
  showToggle?: boolean;
}

interface SectionContentProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * SectionContainer.Header - Header section with optional icon and toggle
 */
function SectionHeader({
  children,
  icon,
  className,
  showToggle = false,
}: SectionHeaderProps): React.ReactElement {
  const { enabled, onToggle } = useContext(SectionContainerContext);

  const handleToggle = (checked: boolean) => {
    if (onToggle) {
      onToggle(checked);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4",
        !enabled && "opacity-60",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex-shrink-0 mt-0.5 transition-colors",
            enabled ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className={cn("flex-1", !enabled && "text-muted-foreground")}>
        {children}
      </div>
      {showToggle && (
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          className="scale-120 data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-primary/80 dark:data-[state=checked]:bg-secondary"
        />
      )}
    </div>
  );
}

/**
 * SectionContainer.Content - Content section that collapses when disabled
 */
function SectionContent({
  children,
  className,
}: SectionContentProps): React.ReactElement | null {
  const { enabled } = useContext(SectionContainerContext);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-4 rounded-b-lg border-t border-border bg-secondary-300 dark:bg-surface",
        "animate-[slideInFade_300ms_ease-out]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Collapsible section container with header and content areas.
 * Uses compound component pattern: SectionContainer.Header and SectionContainer.Content
 *
 * @example
 * ```tsx
 * <SectionContainer
 *   enabled={storageEnabled}
 *   onToggle={setStorageEnabled}
 *   id="storage-section"
 * >
 *   <SectionContainer.Header icon={<Server />} showToggle>
 *     <H3>Storage</H3>
 *     <P>Description</P>
 *   </SectionContainer.Header>
 *   <SectionContainer.Content emptyContent={<div>Enable to configure</div>}>
 *     {/* Form content *\/}
 *   </SectionContainer.Content>
 * </SectionContainer>
 * ```
 */
function SectionContainer({
  children,
  className,
  enabled = true,
  onToggle,
  id,
}: SectionContainerProps): React.ReactElement {
  return (
    <SectionContainerContext.Provider value={{ enabled, onToggle }}>
      <section
        id={id}
        className={cn(
          "rounded-lg ring shadow-sm bg-background transition-all duration-300",
          enabled ? "" : "ring-border",
          className,
        )}
      >
        {children}
      </section>
    </SectionContainerContext.Provider>
  );
}

SectionContainer.Header = SectionHeader;
SectionContainer.Content = SectionContent;

// ==============================================================================
// Constants
// ==============================================================================

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
    label: "Previously Mounted Buckets",
    description: "Mount an existing S3 bucket",
  },
  {
    value: "new",
    label: "Mount New Bucket",
    description: "Configure a new S3 bucket",
  },
];

// ==============================================================================
// Main Component
// ==============================================================================

export default function StorageSelectionSection({
  defaultFormData,
  formData,
  onPersistentHomeChange,
  onMetaCentrumChange,
  onS3Change,
  onS3Check,
  checkedS3Storage,
  setCheckedS3Storage,
  s3values,
}: StorageSelectionSectionProps): React.ReactElement {
  // State management
  const [phSelectionType, setPhSelectionType] = useState<"new" | "existing">(
    "new",
  );
  const [checkedErased, setCheckErased] = useState(false);
  const [checkedDirectories, setCheckedDirectories] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [checkedMount, setCheckedMount] = useState(false);
  const [s3SelectionType, setS3SelectionType] = useState<"existing" | "new">(
    "existing",
  );
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const [defaultOptionPhname, setDefaultOptionPhname] = useState<
    [string, string] | undefined
  >(undefined);
  const [defaultOptionS3name, setDefaultOptionS3name] = useState<
    [string, string] | undefined
  >(undefined);
  const [defaultHome, setDefaultHome] = useState<[string, string] | undefined>(
    undefined,
  );

  const [s3UrlValue, setS3UrlValue] = useState<string>(
    "https://s3.cloud.e-infra.cz",
  );
  const [s3BucketValue, setS3BucketValue] = useState<string>("");
  const [s3AccessKeyValue, setS3AccessKeyValue] = useState<string>("");
  const [s3SecretKeyValue, setS3SecretKeyValue] = useState<string>("");

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

    // S3 Storage initialization
    if (defaultFormData.s3Storage) {
      const s3Storage = defaultFormData.s3Storage;
      const enabled = s3Storage.enabled ?? false;

      if (
        enabled ||
        s3Storage.s3url ||
        s3Storage.existings3?.value ||
        s3Storage.s3existing
      ) {
        setCheckedS3Storage(true);
        onS3Check(true);

        if (
          s3Storage.s3selection === "new" ||
          s3Storage.s3url ||
          s3Storage.s3bucket
        ) {
          // New S3 connection - populate form fields
          setS3SelectionType("new");

          if (s3Storage.s3url) {
            setS3UrlValue(s3Storage.s3url);
            onS3Change((prev) => ({
              ...prev,
              s3url: s3Storage.s3url,
            }));
          }

          if (s3Storage.s3bucket) {
            setS3BucketValue(s3Storage.s3bucket);
            onS3Change((prev) => ({
              ...prev,
              s3bucket: s3Storage.s3bucket,
            }));
          }

          if (s3Storage.s3accesskey) {
            setS3AccessKeyValue(s3Storage.s3accesskey);
            onS3Change((prev) => ({
              ...prev,
              s3accesskey: s3Storage.s3accesskey,
            }));
          }

          if (s3Storage.s3secretkey) {
            setS3SecretKeyValue(s3Storage.s3secretkey);
            onS3Change((prev) => ({
              ...prev,
              s3secretkey: s3Storage.s3secretkey,
            }));
          }
        } else {
          setS3SelectionType("existing");
          const existingBucket =
            s3Storage.s3existing || s3Storage.existings3?.value;
          if (existingBucket) {
            setDefaultOptionS3name([existingBucket, existingBucket]);
            onS3Change((prev) => ({
              ...prev,
              s3name: existingBucket,
            }));
          }
        }
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

  // Sync S3 selection type to formData
  useEffect(() => {
    onS3Change((prev) => ({
      ...prev,
      s3selection: s3SelectionType,
    }));
  }, [s3SelectionType]);

  // ==============================================================================
  // Event Handlers
  // ==============================================================================

  const handleStorage = useCallback(
    (storage: string) => {
      setDefaultHome([storage, storage]);
      onMetaCentrumChange((prev) => ({
        ...prev,
        home: storage,
      }));
    },
    [onMetaCentrumChange],
  );

  const handlePersistentHome = useCallback(
    (val: string) => {
      setDefaultOptionPhname([val, val]);
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
      setDefaultOptionS3name([val, val]);
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
        if (field === "s3url") {
          setS3UrlValue(value);
        } else if (field === "s3bucket") {
          setS3BucketValue(value);
        } else if (field === "s3accesskey") {
          setS3AccessKeyValue(value);
        } else if (field === "s3secretkey") {
          setS3SecretKeyValue(value);
        }

        // Update form data
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

  // ==============================================================================
  // Render
  // ==============================================================================

  return (
    <div className="flex flex-col gap-4">
      {/* Persistent Home Configuration */}
      <SectionContainer>
        <SectionContainer.Header
          icon={<HardDrive className="w-5 h-5 mt-0.5" aria-hidden="true" />}
        >
          <H4>Persistent Notebook Home</H4>
          <P>
            Persistent home ensures your data persists even when the notebook is
            deleted. Mounted to <Code>/home/jovyan</Code>
          </P>
        </SectionContainer.Header>
        <SectionContainer.Content>
          {/* Badge Selector for New/Existing */}
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              {PERSISTENT_HOME_OPTIONS.map((option) => {
                const isActive = phSelectionType === option.value;
                return (
                  <Badge
                    key={option.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200",
                      "bg-surface",
                      "hover:bg-primary/10 hover:border-primary",
                      isActive &&
                        "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground",
                    )}
                    onClick={() =>
                      setPhSelectionType(option.value as "new" | "existing")
                    }
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* New Home Configuration */}
          {phSelectionType === "new" && (
            <div className="space-y-4 pl-4">
              {/* Inline Warning with Checkbox */}
              <div className="flex items-start gap-3">
                <Switch
                  id="phCheckId"
                  checked={checkedErased}
                  onCheckedChange={handleErase}
                  className="scale-120 data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-primary/80 dark:data-[state=checked]:bg-secondary"
                />
                <div className="flex-1">
                  <Label htmlFor="phCheckId" className="cursor-pointer">
                    Erase if home exists
                  </Label>
                </div>
              </div>
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
          )}
          {/* Existing Home Configuration */}
          {phSelectionType === "existing" && (
            <div className="">
              <DropDownMenu
                formSelect={handlePersistentHome}
                title="Select Persistent Home"
                menuOptions={persistentHomeOptions}
                defaultOption={defaultOptionPhname}
                className="bg-surface"
              />
            </div>
          )}
        </SectionContainer.Content>
      </SectionContainer>
      {/* MetaCentrum Storage Configuration */}
      <SectionContainer
        enabled={checkedStorage}
        onToggle={handleStorageCheck}
        id="metacentrum-storage"
      >
        <SectionContainer.Header
          icon={<Server className="w-5 h-5 mt-0.5" aria-hidden="true" />}
          showToggle
        >
          <H3>MetaCentrum Storage</H3>
          <P>
            Mount MetaCentrum home directory and project folders. Mounted to{" "}
            <Code>/home/meta/{appConfig.userName}</Code>
          </P>
        </SectionContainer.Header>
        <SectionContainer.Content>
          <div className="space-y-4 pl-4 animate-in fade-in-0 duration-300">
            {/* Storage Selection */}
            <div>
              <DropDownMenu
                formSelect={handleStorage}
                title="Select MetaCentrum Storage"
                menuOptions={storageOptions}
                defaultOption={defaultHome}
                className="bg-surface"
              />
            </div>

            {/* Mount Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="locationStorageCheckId"
                  checked={checkedMount}
                  onCheckedChange={handleLocationStorageCheck}
                  className="scale-120 data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-primary/80 dark:data-[state=checked]:bg-secondary"
                />
                <Label
                  htmlFor="locationStorageCheckId"
                  className="cursor-pointer"
                >
                  Mount selected home to{" "}
                  <Code className="bg-secondary dark:bg-surface">
                    /storage/{formData["home"] ?? "chosen_storage"}/home/
                    {appConfig.userName}
                  </Code>
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Switch
                  id="projectCheckId"
                  checked={checkedDirectories}
                  onCheckedChange={handleCheckboxDirectories}
                  className="scale-120 data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-primary/80 dark:data-[state=checked]:bg-secondary"
                />
                <div className="flex-1">
                  <Label htmlFor="projectCheckId" className="cursor-pointer">
                    Mount project directories
                  </Label>
                  <P>
                    All projects mounted to{" "}
                    <Code className="bg-secondary dark:bg-surface">
                      /home/projects/brno12
                    </Code>
                    , specific projects are subfolders
                  </P>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer.Content>
      </SectionContainer>

      {/* S3 Storage Configuration */}
      <SectionContainer
        enabled={checkedS3Storage}
        onToggle={onS3Check}
        id="s3-storage"
      >
        <SectionContainer.Header
          icon={<Cloud className="w-5 h-5 mt-0.5" aria-hidden="true" />}
          showToggle
        >
          <H3>S3 Object Storage</H3>
          <P>
            Mount S3-compatible object storage bucket. Mounted to{" "}
            <Code>/storage/s3</Code>
          </P>
        </SectionContainer.Header>
        <SectionContainer.Content>
          <div className="space-y-4 pl-4">
            {/* S3 Type Selection */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {S3_OPTIONS.map((option) => {
                  const isActive = s3SelectionType === option.value;
                  const isExistingDisabled =
                    option.value === "existing" &&
                    Object.keys(s3values).length === 0;
                  return (
                    <TooltipProvider key={option.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={isActive ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200",
                              "bg-surface",
                              "hover:bg-primary/10 hover:border-primary",
                              isActive &&
                                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground",
                              isExistingDisabled &&
                                "opacity-50 cursor-not-allowed",
                            )}
                            onClick={() => {
                              if (!isExistingDisabled) {
                                setS3SelectionType(
                                  option.value as "existing" | "new",
                                );
                              }
                            }}
                          >
                            {option.label}
                          </Badge>
                        </TooltipTrigger>
                        {isExistingDisabled && (
                          <TooltipContent>
                            <p>No buckets mounted</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>

            {/* Existing S3 Bucket */}
            {s3SelectionType === "existing" && (
              <div className="animate-in fade-in-0 duration-200">
                {Object.keys(s3values).length > 0 ? (
                  <DropDownMenu
                    formSelect={handleS3Buckets}
                    title="Select S3 Bucket"
                    menuOptions={s3values}
                    defaultOption={defaultOptionS3name}
                    className="bg-surface"
                  />
                ) : (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">
                      No existing S3 buckets are available. Please create a
                      bucket first using the link above.
                    </span>
                  </Alert>
                )}
              </div>
            )}

            {/* New S3 Bucket */}
            {s3SelectionType === "new" && (
              <div className="space-y-4 animate-in fade-in-0 duration-200">
                <Alert variant="default" className="mb-4">
                  <Cloud className="h-4 w-4" />
                  <span className="text-xs">
                    To create bucket go to{" "}
                    <Link
                      href="https://s3-ui.cloud.e-infra.cz/"
                      target="_blank"
                      className="underline"
                    >
                      https://s3-ui.cloud.e-infra.cz/
                    </Link>
                    .
                  </span>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="s3-url">S3 URL</Label>
                  <Input
                    id="s3-url"
                    type="text"
                    value={s3UrlValue}
                    placeholder="https://s3.cloud.e-infra.cz"
                    onChange={(e) => handleS3UrlChange(e.target.value)}
                    className="w-full bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="s3-bucket">Bucket Name</Label>
                  <Input
                    id="s3-bucket"
                    type="text"
                    value={s3BucketValue}
                    placeholder="example-bucket"
                    onChange={(e) => handleS3BucketChange(e.target.value)}
                    className="w-full bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="s3-access-key">Access Key</Label>
                  <div className="relative">
                    <Input
                      id="s3-access-key"
                      type={showAccessKey ? "text" : "password"}
                      value={s3AccessKeyValue}
                      placeholder="s3AccessKey"
                      onChange={(e) => handleS3AccessKeyChange(e.target.value)}
                      className="w-full pr-10 bg-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessKey(!showAccessKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-text"
                    >
                      {showAccessKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="s3-secret-key">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="s3-secret-key"
                      type={showSecretKey ? "text" : "password"}
                      value={s3SecretKeyValue}
                      placeholder="s3SecretKey"
                      onChange={(e) => handleS3SecretKeyChange(e.target.value)}
                      className="w-full pr-10 bg-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-text"
                    >
                      {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionContainer.Content>
      </SectionContainer>
    </div>
  );
}
