import React, { useState, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  cn,
  Separator,
} from "@e-infra/design-system";
import {
  SquarePlus,
  Loader2,
  Play,
  SquareArrowOutUpRight,
  Power,
  Trash,
  Terminal,
  Rocket,
  Activity,
  Circle,
} from "lucide-react";
import { dateFormat, dateFormatRelative } from "@utils";

type AsyncAction = () => void | Promise<void>;

/**
 * Hook that wraps an async handler with loading state tracking.
 * Returns a tuple of [wrappedHandler, isLoading].
 */
function useAsyncAction(handler: AsyncAction): [() => void, boolean] {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const result = handler();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoading(false);
    }
  }, [handler]);

  return [execute, loading];
}

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
  handleStart?: () => void;
  handleQuickStart?: () => void;
  buttonClassName: string;
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
  handleStart = () => {},
  handleQuickStart = () => {},
  buttonClassName,
}) => {
  const [openHandler, isOpening] = useAsyncAction(handleOpen);
  const [stopHandler, isStopping] = useAsyncAction(handleStop);
  const [startHandler, isStarting] = useAsyncAction(handleStart);
  const [quickStartHandler, isQuickStarting] = useAsyncAction(handleQuickStart);

  if (isActive) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={buttonClassName}
              title="Open"
              size="sm"
              disabled={isOpening}
              onClick={openHandler}
            >
              Open
              {isOpening ? (
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
              disabled={isStopping}
              onClick={stopHandler}
            >
              Stop
              {isStopping ? (
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
            disabled={isStarting}
            onClick={startHandler}
          >
            {isStarting && <Loader2 className="h-4 w-4 animate-spin" />}
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
            variant="tertiary"
            size="sm"
            disabled={isQuickStarting}
            onClick={quickStartHandler}
          >
            Quick Start
            {isQuickStarting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="fill-current" strokeWidth={2} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>QuickStart with last used configuration</p>
        </TooltipContent>
      </Tooltip>
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

const DeleteDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}> = ({ open, onOpenChange, onConfirm, loading }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton>
      <DialogHeader>
        <DialogTitle>Delete Server</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this server? This action cannot be
          undone and all associated data will be permanently removed.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="error" onClick={onConfirm}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteHandler, isDeleting] = useAsyncAction(handleDelete);

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    deleteHandler();
  };

  const renderDeleteDialog = () => (
    <DeleteDialog
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      onConfirm={confirmDelete}
      loading={isDeleting}
    />
  );

  const actionButtons = (
    <ServerActionButtons
      isActive={isActive}
      handleOpen={handleOpen}
      handleStop={handleStop}
      handleStart={handleStart}
      handleQuickStart={handleQuickStart}
      buttonClassName="flex-1 grow-2"
    />
  );

  if (variant === "inline") {
    return (
      <>
        <Card
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
          <div className="flex items-center w-full justify-between gap-2 px-6">
            <div className="flex items-center gap-3 min-w-0 flex-1 grow-7">
              <Terminal className="hidden sm:block h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <H4 className="truncate">{title}</H4>
                <div className="flex items-center gap-3 text-xs">
                  {description && (
                    <Muted className="truncate">{description}</Muted>
                  )}
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={cn(
                      "hidden sm:flex",
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
            {actionButtons}
            <Separator
              className="data-[orientation=vertical]:h-6"
              orientation="vertical"
              decorative={true}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="group  hover:bg-surface-raised"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash
                    className=" group-hover:text-error transition-colors duration-400"
                    size={16}
                    strokeWidth={2.5}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete server</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </Card>
        {renderDeleteDialog()}
      </>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <Card
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
          <div className="flex items-center w-full justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1 grow-7">
              <Terminal className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <H4 className="truncate">{title}</H4>
                <div className="flex items-center gap-3 text-xs">
                  {description && (
                    <Muted className="truncate">{description}</Muted>
                  )}
                  <LastActivityInfo lastActivity={lastActivity} />
                </div>
              </div>
            </div>
            {actionButtons}
            <Separator
              className="data-[orientation=vertical]:h-6"
              orientation="vertical"
              decorative={true}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="group  hover:bg-surface-raised"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash
                    className=" group-hover:text-error transition-colors duration-400"
                    size={16}
                    strokeWidth={2.5}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete server</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </Card>
        {renderDeleteDialog()}
      </>
    );
  }

  return (
    <Card
      variant="default"
      className={cn(
        "relative w-full transition-colors duration-200 ease-in-out",
        "flex flex-col justify-center rounded-md gap-6 py-6 bg-background dark:bg-surface-raised",
        isReady
          ? "border-t-2 border-success"
          : !isActive
            ? "border-t-2 border-slate-400"
            : "border-t-2 border-warning/30 before:absolute before:inset-y-[-2px] before:left-0 before:pointer-events-none before:w-[var(--before-width)] before:border-t-2 before:rounded-tl-md before:border-warning",
      )}
      style={{ "--before-width": `${progress}%` } as React.CSSProperties}
    >
      <CardHeader>
        <CardTitle className="min-w-0">
          <div className="flex justify-between items-center w-full gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate block">{title}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="group  hover:bg-surface-raised flex-shrink-0"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash
                    className=" group-hover:text-error transition-colors duration-400"
                    size={16}
                    strokeWidth={2.5}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete server</p>
              </TooltipContent>
            </Tooltip>
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
      <CardFooter className="gap-2">{actionButtons}</CardFooter>
      {renderDeleteDialog()}
    </Card>
  );
};

export const ServerCardInline: React.FC<CardProps> = (props) => {
  return <BaseServerCard {...props} variant="inline" />;
};

export const ServerCardCompact: React.FC<CardProps> = (props) => {
  return <BaseServerCard {...props} variant="compact" />;
};

interface EmptyServerCardProps {
  /** Callback when the add server button is clicked (opens modal) */
  onClick?: () => void;
  /** Visual variant of the card */
  variant?: ServerCardVariant;
}

export const EmptyServerCard: React.FC<EmptyServerCardProps> = ({
  onClick,
  variant = "default",
}) => {
  if (variant === "inline") {
    return (
      <Panel
        className={cn(
          "group border-2 border-dashed bg-transparent transition-all duration-200",
          " hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] dark:border-primary/30",
          "cursor-pointer",
        )}
        onClick={onClick}
      >
        <div className="flex items-center w-full justify-center gap-3 py-4">
          <SquarePlus
            className="w-12 h-12 text-border group-hover:text-primary/80 transition-colors duration-200 dark:text-primary/30"
            strokeWidth={2}
          />
        </div>
      </Panel>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "border-2 border-dashed transition-colors duration-200",
          "hover:border-primary/50 hover:bg-primary/5 dark:border-primary/30",
          "cursor-pointer",
        )}
        onClick={onClick}
      >
        <div className="flex flex-col items-center justify-center gap-2 p-6">
          <SquarePlus
            className="h-8 w-8 text-muted-foreground group-hover:text-primary/80 transition-colors duration-200"
            strokeWidth={2}
          />
          <span className="text-sm text-muted-foreground">Add Server</span>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        "group w-full flex items-center justify-center border-2 border-dashed bg-transparent transition-all duration-200 dark:border-primary/30",
        " hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]",
        "cursor-pointer min-h-[200px]",
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 w-full h-full text-center py-8 px-6">
        <SquarePlus
          className="w-16 h-16 text-border group-hover:text-primary/80 transition-colors duration-200 dark:text-base-500"
          strokeWidth={2}
        />
      </CardContent>
    </Card>
  );
};
export const ServerCard: React.FC<CardProps> = (props) => {
  return <BaseServerCard {...props} variant="default" />;
};
export default ServerCard;
