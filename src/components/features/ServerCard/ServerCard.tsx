import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Panel,
  H4,
  Muted,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Badge,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  cn,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@e-infra/design-system";
import {
  SquarePlus,
  Loader2,
  Play,
  SquareArrowOutUpRight,
  Power,
  Trash,
  Terminal,
  Plus,
  AlertCircle,
  Rocket,
  Activity,
  Circle,
  MoreHorizontal,
} from "lucide-react";
import { dateFormat, dateFormatRelative } from "@utils";

interface CardProps {
  /** Main title of the card */
  title: string;
  spawnerUrl?: string;
  description?: string;
  lastActivity?: number;
  isActive: boolean;
  isReady?: boolean;
  /** Progress value (0-100) for spawn progress indication */
  progress?: number;

  handleOpen?: () => void;

  handleStop?: () => void;

  handleDelete?: () => void;

  handleStart?: () => void;

  handleQuickStart?: () => void;
}

interface ServerActionButtonsProps {
  isActive: boolean;
  handleOpen?: () => void;
  handleStop?: () => void;
  handleDelete?: () => void;
  handleStart?: () => void;
  handleQuickStart?: () => void;
  buttonClassName: string;
}

interface ServerActionButtonsState {
  open: boolean;
  stop: boolean;
  delete: boolean;
  start: boolean;
  quickStart: boolean;
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
    <Tooltip>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
        <Activity className="h-3 w-3" />
        <TooltipTrigger className="cursor-pointer hover:text-foreground transition-colors duration-200">
          {dateFormatRelative(lastActivity)}
        </TooltipTrigger>
      </div>
      <TooltipContent side="bottom" className="text-xs">
        <p>Last activity: {dateFormat(lastActivity)}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const ServerActionButtons: React.FC<ServerActionButtonsProps> = ({
  isActive,
  handleOpen = () => {},
  handleStop = () => {},
  handleDelete = () => {},
  handleStart = () => {},
  handleQuickStart = () => {},
  buttonClassName,
}) => {
  const [loading, setLoading] = React.useState<ServerActionButtonsState>({
    open: false,
    stop: false,
    delete: false,
    start: false,
    quickStart: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAsyncClick = async (
    action: keyof ServerActionButtonsState,
    handler: () => void | Promise<void>,
  ) => {
    setLoading((prev) => ({ ...prev, [action]: true }));
    try {
      const result = handler();
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    await handleAsyncClick("delete", handleDelete);
  };

  if (isActive) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={buttonClassName}
              title="Open"
              size="sm"
              disabled={loading.open}
              onClick={() => handleAsyncClick("open", handleOpen)}
            >
              Open
              {loading.open ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SquareArrowOutUpRight size={16} strokeWidth={2.5} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Open server dashboard</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={buttonClassName}
              title="Stop"
              variant="tertiary"
              size="sm"
              disabled={loading.stop}
              onClick={() => handleAsyncClick("stop", handleStop)}
            >
              Stop
              {loading.stop ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Stop the server</p>
          </TooltipContent>
        </Tooltip>
      </>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={buttonClassName}
            title="Start"
            variant="default"
            size="sm"
            disabled={loading.start}
            onClick={() => handleAsyncClick("start", handleStart)}
          >
            {loading.start && <Loader2 className="h-4 w-4 animate-spin" />}
            Start <Play className="fill-current" strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Start with new configuration</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={buttonClassName}
            title="Quick Start"
            variant={"tertiary"}
            size="sm"
            disabled={loading.quickStart}
            onClick={() => handleAsyncClick("quickStart", handleQuickStart)}
          >
            Quick Start
            {loading.quickStart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              // <Play className="fill-current" strokeWidth={2} />
              <Rocket className="fill-current" strokeWidth={2} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>QuickStart with last used configuration</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete Server</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this server? This action cannot be
              undone and all associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="error" onClick={confirmDelete}>
              {loading.delete && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const StatusIndicator: React.FC<{
  isActive: boolean;
  isReady: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg";
}> = ({ isActive, isReady, progress, size = "md" }) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  // Determine status color based on progress and server state
  const isPending =
    (progress !== undefined && progress > 0 && progress < 100) ||
    (isActive && !isReady);
  const isComplete = progress === 100 || isReady;

  return (
    <span className="relative flex items-center justify-center">
      {(isActive || isPending) && (
        <span
          className={cn(
            "absolute inline-flex rounded-full opacity-75 animate-ping",
            sizeClasses[size],
            isComplete ? "bg-emerald-400" : "bg-orange-400",
          )}
        />
      )}
      <Circle
        className={cn(
          "relative transition-colors duration-300",
          sizeClasses[size],
          isComplete
            ? "fill-emerald-500 text-emerald-500"
            : isPending || (isActive && !isReady)
              ? "fill-orange-500 text-orange-500"
              : "fill-slate-400 text-slate-400",
        )}
      />
    </span>
  );
};

const BaseServerCard: React.FC<BaseServerCardProps> = ({
  variant,
  title,
  description,
  lastActivity,
  isActive = false,
  isReady = false,
  progress,
  handleOpen = () => {},
  handleStop = () => {},
  handleDelete = () => {},
  handleStart = () => {},
  handleQuickStart = () => {},
}) => {
  if (variant === "inline") {
    return (
      <Panel
        className={cn(
          "transition-colors duration-200",
          "border-0",
          "relative",
          "dark:bg-surface-raised",
          isReady
            ? "border-l-2 border-success"
            : !isActive
              ? "border-l-2 border-slate-400"
              : "border-l-2 border-warning/30 before:absolute before:inset-x-[-2px] before:bottom-0 before:pointer-events-none before:h-[var(--before-height)] before:border-l-2 before:rounded-bl-md before:border-warning",
        )}
        style={{ "--before-height": `${progress}%` } as React.CSSProperties}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="absolute top-0 right-0 pointer-events-auto hover:bg-surface"
              variant="ghost"
              size="icon"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleDelete}>
              <span className="flex items-center gap-2 text-error">
                <Trash size={16} strokeWidth={2.5} />
                Delete
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Terminal className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <H4 className="truncate">{title}</H4>
              <div className="flex items-center gap-3 text-xs">
                {description && (
                  <Muted className="truncate">{description}</Muted>
                )}
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    progress !== undefined && progress > 0 && progress < 100
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                      : isActive &&
                          "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
                    isReady &&
                      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
                  )}
                >
                  <StatusIndicator
                    isActive={isActive}
                    isReady={isReady}
                    progress={progress}
                    size="lg"
                  />
                  {isActive ? (isReady ? "Running" : "Pending") : "Stopped"}
                </Badge>
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
            handleQuickStart={handleQuickStart}
            buttonClassName="shrink-0"
          />
        </div>
      </Panel>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "transition-colors duration-200",
          "border-l-2",
          "dark:bg-surface-raised",
        )}
      >
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Terminal className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="font-medium truncate">{title}</span>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "shrink-0",
                progress !== undefined && progress > 0 && progress < 100
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                  : isActive &&
                      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
              )}
            >
              {progress !== undefined && progress > 0 && progress < 100
                ? "Pending"
                : isActive
                  ? "Running"
                  : "Stopped"}
            </Badge>
            {lastActivity !== undefined && (
              <LastActivityInfo lastActivity={lastActivity} />
            )}
          </div>
          <ServerActionButtons
            isActive={isActive}
            handleOpen={handleOpen}
            handleStop={handleStop}
            handleDelete={handleDelete}
            handleStart={handleStart}
            handleQuickStart={handleQuickStart}
            buttonClassName="shrink-0"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative w-full transition-colors duration-200 ease-in-out",
        "bg-surface dark:bg-surface-raised flex flex-col justify-center gap-6 rounded-md py-6 drop-shadow-md hover:drop-shadow-lg",
        isReady
          ? "border-t-2 border-success"
          : !isActive
            ? "border-t-2 border-slate-400"
            : "border-t-2 border-warning/30 before:absolute before:inset-y-[-2px] before:left-0 before:pointer-events-none before:w-[var(--before-width)] before:border-t-2 before:rounded-tl-md before:border-warning",
      )}
      style={{ "--before-width": `${progress}%` } as React.CSSProperties}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center w-full">
            <span>{title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="pointer-events-auto hover:bg-surface"
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDelete}>
                  <span className="flex items-center gap-2 text-error">
                    <Trash size={16} strokeWidth={2.5} />
                    Delete
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={cn(
              progress !== undefined && progress > 0 && progress < 100
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                : isActive &&
                    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
              isReady &&
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
            )}
          >
            <StatusIndicator
              isActive={isActive}
              isReady={isReady}
              progress={progress}
              size="lg"
            />
            {isActive ? (isReady ? "Running" : "Pending") : "Stopped"}
          </Badge>
          <LastActivityInfo lastActivity={lastActivity} />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <ServerActionButtons
          isActive={isActive}
          handleOpen={handleOpen}
          handleStop={handleStop}
          handleDelete={handleDelete}
          handleStart={handleStart}
          handleQuickStart={handleQuickStart}
          buttonClassName="flex-1 gap"
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
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isNameDuplicate = useMemo(() => {
    if (!serverName.trim()) return false;
    return existingNames.some(
      (name) => name.toLowerCase() === serverName.trim().toLowerCase(),
    );
  }, [serverName, existingNames]);

  const isInvalid = serverName === "" || isNameDuplicate;

  const serverNameInput = (
    <Input
      type="text"
      id="addServer"
      value={serverName}
      onChange={(e) => onServerNameChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      className={cn(
        "w-full bg-surface-raised/80 border-border/60 focus:border-primary focus:bg-surface-raised transition-colors duration-200",
        "placeholder:text-muted-foreground/70",
        isNameDuplicate && "border-error focus-visible:ring-error",
      )}
      aria-invalid={isNameDuplicate}
      aria-describedby={isNameDuplicate ? "server-name-error" : undefined}
    />
  );

  const errorMessage = isNameDuplicate ? (
    <div
      id="server-name-error"
      className="flex items-center gap-2 text-sm text-error"
      role="alert"
    >
      <AlertCircle size={16} />
      <span>Server name &ldquo;{serverName}&rdquo; is already in use</span>
    </div>
  ) : null;

  const addButton = (className = "") => (
    <Button
      variant={isInvalid ? "outline" : "default"}
      className={cn(
        "transition-opacity duration-200",
        isInvalid ? "opacity-50 cursor-not-allowed" : "",
        className,
      )}
      onClick={onAddServer}
      disabled={isInvalid}
      title=""
    >
      <Plus size={16} strokeWidth={3} />
      {buttonText}
    </Button>
  );

  const helperText = description && !isNameDuplicate && (
    <Muted className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
      <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
      {description}
    </Muted>
  );

  if (variant === "inline") {
    return (
      <Panel
        className={cn(
          "border-2 border-dashed transition-colors duration-200",
          isFocused ? "border-primary/30 bg-primary/5" : "",
          !isFocused && !serverName ? "opacity-60 hover:opacity-100" : "",
        )}
      >
        <div className="flex items-start w-full justify-between gap-3 py-2">
          <div className="shrink-0 w-10 h-10 bg-surface-raised flex items-center justify-center max-w-[42px] self-center">
            <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">{serverNameInput}</div>
              {addButton("shrink-0")}
            </div>
            {helperText}
            {errorMessage}
          </div>
        </div>
      </Panel>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "border-2 border-dashed transition-colors duration-200",
          isFocused ? "border-primary/30 bg-primary/5" : "hover:bg-muted/50",
        )}
      >
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <SquarePlus className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">{serverNameInput}</div>
            {addButton("shrink-0")}
          </div>
          {helperText}
          {errorMessage}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full flex items-center justify-center border-2 border-dashed bg-transparent transition-colors duration-200",
        isFocused ? "border-primary/30 bg-primary/5" : "",
        !isFocused && !serverName ? "opacity-60 hover:opacity-100" : "",
      )}
    >
      <CardContent className="flex flex-col items-center justify-center gap-3 w-full h-full text-center py-8 px-6">
        <div className="flex w-full flex-col gap-3 max-w-md">
          <div className="relative">{serverNameInput}</div>
          {/* {helperText} */}
          {errorMessage}
          <div className="pt-1">{addButton("w-full justify-center")}</div>
        </div>
      </CardContent>
    </Card>
  );
};
export const ServerCard: React.FC<CardProps> = (props) => {
  return <BaseServerCard {...props} variant="default" />;
};
export default ServerCard;
