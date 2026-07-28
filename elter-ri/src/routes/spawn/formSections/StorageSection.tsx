import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DropDownMenu } from "@components/ui";
import {
  Switch,
  Alert,
  Label,
  Badge,
  H3,
  H4,
  Code,
  P,
  Link,
  Input,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@e-infra/design-system";
import { AlertTriangle, Cloud, Eye, EyeOff, HardDrive } from "lucide-react";
import { cn } from "@utils";
import SectionContainer from "../components/SectionContainer";

// ==============================================================================
// Type Definitions
// ==============================================================================

type FormState = Record<string, unknown>;
type FormUpdater = (prev: FormState) => FormState;

interface StorageFormData extends FormState {
  delhome?: boolean;
  s3check?: string;
  s3name?: string;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
}

interface StorageDefaultFormData {
  delhome?: boolean;
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
  onDelhomeChange: (checked: boolean) => void;
  onS3Change: (updater: FormUpdater) => void;
  onS3Check: (checked: boolean) => void;
  checkedS3Storage: boolean;
  setCheckedS3Storage: (checked: boolean) => void;
  s3values: Record<string, string>;
  pushAlert: (message: string, variant?: "success" | "error" | "info") => void;
}

// ==============================================================================
// Constants
// ==============================================================================

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
  onDelhomeChange,
  onS3Change,
  onS3Check,
  checkedS3Storage,
  setCheckedS3Storage,
  s3values,
}: StorageSelectionSectionProps): React.ReactElement {
  // State management
  const [delhomeChecked, setDelhomeChecked] = useState(false);
  const [s3SelectionType, setS3SelectionType] = useState<"existing" | "new">(
    "existing",
  );
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const [defaultOptionS3name, setDefaultOptionS3name] = useState<
    [string, string] | undefined
  >(undefined);

  const [s3UrlValue, setS3UrlValue] = useState<string>(
    "https://s3.cloud.e-infra.cz",
  );
  const [s3BucketValue, setS3BucketValue] = useState<string>("");
  const [s3AccessKeyValue, setS3AccessKeyValue] = useState<string>("");
  const [s3SecretKeyValue, setS3SecretKeyValue] = useState<string>("");

  // Initialize from default form data
  useEffect(() => {
    if (!defaultFormData) return;

    // Delhome initialization
    if (defaultFormData.delhome !== undefined) {
      setDelhomeChecked(defaultFormData.delhome);
      onDelhomeChange(defaultFormData.delhome);
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

  // Sync S3 selection type to formData
  useEffect(() => {
    onS3Change((prev) => ({
      ...prev,
      s3selection: s3SelectionType,
    }));
  }, [s3SelectionType]);

  useEffect(() => {
    if (s3SelectionType === "new" && !formData.s3url) {
      onS3Change((prev) => ({
        ...prev,
        s3url: "https://s3.cloud.e-infra.cz",
      }));
    }
  }, [s3SelectionType]);

  // ==============================================================================
  // Event Handlers
  // ==============================================================================

  const handleDelhomeChange = useCallback(
    (checked: boolean) => {
      setDelhomeChecked(checked);
      onDelhomeChange(checked);
    },
    [onDelhomeChange],
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
    <div className="flex flex-col gap-6">
      {/* Persistent Home Configuration */}
      <SectionContainer>
        <SectionContainer.Header
          icon={<HardDrive className="w-5 h-5 mt-0.5" aria-hidden="true" />}
        >
          <H4>Persistent Notebook Home</H4>
          <P className="pl-1 text-xs">
            Persistent home ensures your data persists even when the notebook is
            deleted. Mounted to <Code className="text-xs">/home/jovyan</Code>
          </P>
        </SectionContainer.Header>
        <SectionContainer.Content className="px-12">
          <div className="flex items-center gap-3 py-2">
            <Switch
              id="delhome"
              checked={delhomeChecked}
              onCheckedChange={handleDelhomeChange}
              className="scale-125 data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-secondary"
            />
            <Label htmlFor="delhome" className="cursor-pointer text-sm">
              Delete home directory
            </Label>
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
            Mounts S3-compatible object storage to: <Code>/storage/s3</Code>
          </P>
        </SectionContainer.Header>
        <SectionContainer.Content>
          <div className="space-y-4">
            <P className="mb-2">
              Pick a bucket you&apos;ve already mounted, or connect a new one
              below.
            </P>
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
                                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
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
              <div className="animate-in fade-in-0 duration-200 px-4">
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
              <div className="space-y-4 animate-in fade-in-0 duration-200 px-4">
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
