import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Separator,
  Panel,
  H4,
  Muted,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Badge,
  Input,
} from "@e-infra/design-system";
import {
  SquarePlus,
  Loader2,
  Play,
  ExternalLink,
  SquareArrowOutUpRight,
  Pause,
  Trash,
  Terminal,
  History,
  Plus,
  AlertCircle,
} from "lucide-react";
import { dateFormat, dateFormatRelative } from "../../utils/utils";
interface CardProps {
  /** Main title of the card */
  title: string;
  spawnerUrl?: string;
  description?: string;
  lastActivity?: number;
  isActive: boolean;

  handleOpen?: () => void;

  handleStop?: () => void;

  handleDelete?: () => void;

  handleStart?: () => void;
}

interface ServerActionButtonsProps {
  isActive: boolean;
  handleOpen?: () => void;
  handleStop?: () => void;
  handleDelete?: () => void;
  handleStart?: () => void;
  buttonClassName: string;
}

interface ServerActionButtonsState {
  open: boolean;
  stop: boolean;
  delete: boolean;
  start: boolean;
}

interface LastActivityProps {
  lastActivity?: number;
}

/**
 * Shared variant type for all ServerCard components
 * - default: Full card layout with header, content, and footer
 * - inline: Horizontal panel layout for list views
 * - compact: Condensed card layout with minimal padding
 */
export type ServerCardVariant = "default" | "inline" | "compact";

interface BaseServerCardProps extends CardProps {
  variant: ServerCardVariant;
}

const LastActivityInfo: React.FC<LastActivityProps> = ({ lastActivity }) => {
  if (lastActivity === undefined) {
    return null;
  }

  return (
    <>
      <Tooltip>
        <p>
          Last Activity:
          <TooltipTrigger>{dateFormatRelative(lastActivity)}</TooltipTrigger>
        </p>
        <TooltipContent>
          <p>{dateFormat(lastActivity)}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

const ServerActionButtons: React.FC<ServerActionButtonsProps> = ({
  isActive,
  handleOpen = () => {},
  handleStop = () => {},
  handleDelete = () => {},
  handleStart = () => {},
  buttonClassName,
}) => {
  const [loading, setLoading] = React.useState<ServerActionButtonsState>({
    open: false,
    stop: false,
    delete: false,
    start: false,
  });

  const handleAsyncClick = async (
    action: keyof ServerActionButtonsState,
    handler: () => void | Promise<void>,
  ) => {
    setLoading((prev) => ({ ...prev, [action]: true }));
    try {
      const result = handler();
      // If the result is a promise, wait for it to complete
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  if (isActive) {
    return (
      <>
        <Button
          className={buttonClassName}
          title="Open"
          size="sm"
          disabled={loading.open}
          onClick={() => handleAsyncClick("open", handleOpen)}
        >
          Open
          {loading.open ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SquareArrowOutUpRight size={16} strokeWidth={3} />
          )}
        </Button>
        <Button
          className={buttonClassName}
          title="Stop"
          variant="error"
          size="sm"
          disabled={loading.stop}
          onClick={() => handleAsyncClick("stop", handleStop)}
        >
          Stop
          {loading.stop ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Pause className="fill-current" strokeWidth={1} />
          )}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        className={buttonClassName}
        title="Start"
        variant="default"
        size="sm"
        disabled={loading.start}
        onClick={() => handleAsyncClick("start", handleStart)}
      >
        {loading.start && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Start <Play className="fill-current" strokeWidth={2} />
      </Button>
      <Button
        className={buttonClassName}
        title="Delete"
        variant="outline"
        size="sm"
        disabled={loading.delete}
        onClick={() => handleAsyncClick("delete", handleDelete)}
      >
        Delete
        {loading.delete ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Trash size={16} strokeWidth={3} />
        )}
      </Button>
    </>
  );
};

const BaseServerCard: React.FC<BaseServerCardProps> = ({
  variant,
  title,
  description,
  lastActivity,
  isActive = false,
  handleOpen = () => {},
  handleStop = () => {},
  handleDelete = () => {},
  handleStart = () => {},
}) => {
  if (variant === "inline") {
    return (
      <Panel>
        <div className="flex items-center w-full justify-between gap-2">
          <div className="basis-18 h-full bg-[var(--secondary)] rounded flex items-center justify-center max-w-[42px]">
            <Terminal className="w-full h-full" />
          </div>
          <div className="basis-full">
            <H4>{title}</H4>
            <div className="flex gap-4 text-primary">
              {description && (
                <Muted className="text-muted-foreground">{description}</Muted>
              )}
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-green-100 text-green-800" : undefined}
              >
                {isActive ? "Running" : "Inactive"}
              </Badge>
              <div className="flex">
                <History color="var(--primary)" />
                <LastActivityInfo lastActivity={lastActivity} />
              </div>
            </div>
          </div>
          <ServerActionButtons
            isActive={isActive}
            handleOpen={handleOpen}
            handleStop={handleStop}
            handleDelete={handleDelete}
            handleStart={handleStart}
            buttonClassName="basis-24"
          />
        </div>
      </Panel>
    );
  }

  // Compact variant: condensed card layout
  if (variant === "compact") {
    return (
      <Card className="w-full p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-medium">{title}</span>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-green-100 text-green-800" : undefined}
            >
              {isActive ? "Running" : "Stopped"}
            </Badge>
            {lastActivity !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <History className="h-3 w-3" />
                <LastActivityInfo lastActivity={lastActivity} />
              </div>
            )}
          </div>
          <ServerActionButtons
            isActive={isActive}
            handleOpen={handleOpen}
            handleStop={handleStop}
            handleDelete={handleDelete}
            handleStart={handleStart}
            buttonClassName=""
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <Separator />
      </CardHeader>
      <CardContent>
        <p>Status: {isActive ? "Running" : "Stopped"}</p>
        <LastActivityInfo lastActivity={lastActivity} />
      </CardContent>
      <CardFooter className="flex gap-2">
        <ServerActionButtons
          isActive={isActive}
          handleOpen={handleOpen}
          handleStop={handleStop}
          handleDelete={handleDelete}
          handleStart={handleStart}
          buttonClassName="w-1/2"
        />
      </CardFooter>
    </Card>
  );
};

export const ServerCardInline: React.FC<CardProps> = (props) => {
  return <BaseServerCard {...props} variant="inline" />;
};

export const ServerCardCompact: React.FC<CardProps> = (props) => {
  return <BaseServerCard {...props} variant="compact" />;
};

interface EmptyCardProps {
  /** Callback when server is added */
  onAddServer: () => void;
  /** Current value of the server name input */
  serverName: string;
  /** Callback when server name changes */
  onServerNameChange: (value: string) => void;
  /** Array of existing server names to check for duplicates */
  existingNames?: string[];
  /** Placeholder text for the input */
  placeholder?: string;
  /** Button text */
  buttonText?: string;
  /** Description/helper text */
  description?: string;
  /** Visual variant of the card */
  variant?: ServerCardVariant;
  /** Label for the add button in fallback mode */
  label?: string;
}

export const EmptyServerCard: React.FC<EmptyCardProps> = ({
  onAddServer,
  serverName,
  onServerNameChange,
  existingNames = [],
  placeholder = "Name Your Server",
  buttonText = "Add Server",
  description,
  variant = "default",
  label = "Add Server",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isNameDuplicate = useMemo(() => {
    if (!serverName.trim()) return false;
    return existingNames.some(
      (name) => name.toLowerCase() === serverName.trim().toLowerCase(),
    );
  }, [serverName, existingNames]);

  const isInvalid = serverName === "" || isNameDuplicate;

  // Shared input element for all variants
  const serverNameInput = (
    <Input
      type="text"
      id="addServer"
      value={serverName}
      onChange={(e) => onServerNameChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      className={`w-full rounded-md border text-red focus:ring focus:ring-opacity-50 ${
        isNameDuplicate
          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
      }`}
      aria-invalid={isNameDuplicate}
      aria-describedby={isNameDuplicate ? "server-name-error" : undefined}
    />
  );

  // Shared error message element
  const errorMessage = isNameDuplicate ? (
    <div
      id="server-name-error"
      className="flex items-center gap-2 text-sm text-red-600 "
      role="alert"
    >
      <AlertCircle size={16} />
      <span>Server name "{serverName}" is already in use</span>
    </div>
  ) : null;

  // Shared add button element factory
  const addButton = (className = "") => (
    <Button
      variant="secondary"
      className={className}
      onClick={onAddServer}
      disabled={isInvalid}
    >
      <Plus size={16} strokeWidth={3} />
      {buttonText}
    </Button>
  );

  // Inline variant: horizontal panel layout
  if (variant === "inline") {
    return (
      <Panel
        className={`bg-transparent border-dashed transition-opacity relative ${
          isFocused ? "" : serverName ? "" : "opacity-50 hover:opacity-100"
        }`}
      >
        <div className="flex items-center w-full justify-between gap-2 ">
          <div className="basis-18 h-full bg-[var(--secondary)] rounded flex items-center justify-center max-w-[42px]">
            <Plus
              color="var(--primary)"
              className=" w-full h-full text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-4 basis-full">
            <div className="flex-1">{serverNameInput}</div>
            <div className="absolute mt-[60px]">{errorMessage}</div>
          </div>
          {addButton("basis-24")}
        </div>
      </Panel>
    );
  }

  // Compact variant: condensed inline layout
  if (variant === "compact") {
    return (
      <Card className="w-full p-3 border-dashed hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <SquarePlus className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">{serverNameInput}</div>
          {addButton("")}
        </div>
        {isNameDuplicate && <div className="mt-2">{errorMessage}</div>}
      </Card>
    );
  }

  // Default variant: full card with centered content
  return (
    <Card
      className={`w-full flex items-center justify-center border-2 border-dashed bg-transparent ${
        isFocused ? "" : serverName ? "" : "opacity-50 hover:opacity-100"
      } `}
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 w-full h-full text-center py-8 px-4">
        <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-wrap lg:space-x-2 lg:items-center lg:justify-center">
          <div className="w-full lg:w-40">{serverNameInput}</div>
          {/* {isNameDuplicate && errorMessage} */}
          {addButton("w-full justify-center lg:w-40")}
        </div>
        {description && !isNameDuplicate && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
        {errorMessage}
      </CardContent>
    </Card>
  );
};
export const ServerCard: React.FC<CardProps> = (props) => {
  return <BaseServerCard {...props} variant="default" />;
};
export default ServerCard;
