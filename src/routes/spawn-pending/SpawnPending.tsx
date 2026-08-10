import "./SpawnPending.css";
import { useCallback, useMemo, useState } from "react";

/**
 * Global config injected by JupyterHub's Jinja2 template (spawn_pending.html).
 */
declare const appConfig: {
  progressUrl: string;
  userName: string;
};
import {
  Progress,
  Separator,
  P,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@e-infra/design-system";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@components/ui";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Footer, JupyterHubHeader } from "@components/layout";
import { useSpawnProgress } from "@hooks/useSpawnProgress";
import { stripMessagePrefix } from "@utils/message";
import { EventLogList } from "@components/features/EventLog";
import { ConnectionStatusIndicator } from "@components/features/EventLog";

/**
 * Extracts the server name from the current URL path.
 */
function getServerName(): string {
  const path = window.location.pathname;
  const match = path.match(/\/hub\/spawn-pending\/[^/]+\/([^/?]+)/);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("server_name") ?? "default";
}

/**
 * SpawnPending — displays real-time server spawn progress via SSE.
 */
const SpawnPending: React.FC = () => {
  const [logOpen, setLogOpen] = useState(false);
  const serverName = getServerName();

  // appConfig is a global constant injected by spawn_pending.html (Jinja2)
  const progressUrl = appConfig.progressUrl ?? "";
  const userName = appConfig.userName ?? "";

  const handleReady = useCallback(() => {
    setTimeout(() => window.location.reload(), 800);
  }, []);

  const handleFailed = useCallback(() => {
    // Error is displayed in event log
  }, []);

  const { progress, message, eventLog, connectionState, reconnectAttempts } =
    useSpawnProgress({
      url: progressUrl,
      withCredentials: true,
      onReady: handleReady,
      onFailed: handleFailed,
    });

  // Strip server-side timestamp and level prefixes to avoid duplication with our own UI
  const cleanMessage = useMemo(
    () => (message ? stripMessagePrefix(message) : message),
    [message],
  );

  // Handle collapsible
  const handleLogOpenChange = useCallback((open: boolean) => {
    setLogOpen(open);
  }, []);

  // Handle page refresh
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <JupyterHubHeader userName={userName} />

      <div className="container grow mx-auto px-4 py-8 space-y-8 place-content-center">
        <Panel className="bg-background my-auto mx-auto w-full max-w-7xl">
          <PanelHeader>
            <PanelTitle>
              Starting your server
              <span className="inline-block animate-bounce [animation-delay:0ms]">
                .
              </span>
              <span className="inline-block animate-bounce [animation-delay:150ms]">
                .
              </span>
              <span className="inline-block animate-bounce [animation-delay:300ms]">
                .
              </span>
            </PanelTitle>
            <PanelDescription className="truncate">
              Name: {serverName}
            </PanelDescription>
          </PanelHeader>

          <PanelContent className="space-y-4">
            {/* ── Progress section ──────────────────────────────── */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-text truncate mr-4">
                {cleanMessage || "Initializing…"}
              </span>
              <P className="shrink-0 tabular-nums font-mono">{progress}%</P>
            </div>

            <Progress value={progress} />

            {/* ── Action row ────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <ConnectionStatusIndicator
                state={connectionState}
                reconnectAttempts={reconnectAttempts}
              />

              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm px-2 py-1"
                aria-label="Refresh page"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Refresh
              </button>
            </div>

            <Separator />

            {/* ── Event log (collapsible + virtualized) ─────────── */}
            <Collapsible open={logOpen} onOpenChange={handleLogOpenChange}>
              <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-medium text-text-heading hover:text-text transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm">
                <ChevronDown
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
                Event log
                {eventLog.length > 0 && (
                  <span className="text-xs text-text-muted font-normal">
                    ({eventLog.length} event{eventLog.length !== 1 ? "s" : ""})
                  </span>
                )}
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <div className="rounded-lg border border-border bg-surface overflow-hidden">
                  <EventLogList entries={eventLog} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </PanelContent>
        </Panel>
      </div>

      <Footer className="flex-none" />
    </div>
  );
};

export default SpawnPending;
