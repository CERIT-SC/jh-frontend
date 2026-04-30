import "./SpawnPending.css";
import { useCallback, useEffect, useState } from "react";

/**
 * Global config injected by JupyterHub's Jinja2 template (spawn_pending.html).
 * `const` at script top-level is accessible as a bare identifier but is NOT
 * a `window` property, so we declare it here for TypeScript.
 */
declare const appConfig: {
  progressUrl: string;
  userName: string;
};
import {
  Panel,
  PanelContent,
  PanelHeader,
  Progress,
  Separator,
  PanelTitle,
  PanelDescription,
  P,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@e-infra/design-system";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Footer, JupyterHubHeader } from "@components/layout";
import { Alert } from "@components/ui/Alert/Alert";
import { useAlerts } from "@hooks/useAlerts";
import { useSpawnProgress } from "@hooks/useSpawnProgress";
import { EventLogList } from "@components/features/EventLog";
import { ConnectionStatusIndicator } from "@components/features/EventLog";

/**
 * Extracts the server name from the current URL path.
 *
 * JupyterHub pattern: `/hub/spawn-pending/{user}/{server-name}`
 * Falls back to the `?server_name=` query param for backward compatibility.
 */
function getServerName(): string {
  const path = window.location.pathname;
  const match = path.match(/\/hub\/spawn-pending\/[^/]+\/([^/?]+)/);
  if (match?.[1]) return match[1];

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("server_name") ?? "default";
}

/**
 * SpawnPending — displays real-time server spawn progress via SSE.
 *
 * Architectural improvements over the original implementation:
 * - **No direct DOM manipulation** — all UI driven through React state
 * - **Custom `useSpawnProgress` hook** — encapsulates SSE lifecycle,
 *   automatic reconnection with exponential backoff, and event log capping
 * - **Virtualized event log** — renders only visible items, keeping DOM
 *   node count constant regardless of log volume
 * - **Connection status indicator** — visual feedback for SSE state
 * - **Alert integration** — error/failure notifications via the shared
 *   alert stack
 * - **Proper cleanup** — EventSource closed on unmount; no dangling listeners
 */
const SpawnPending: React.FC = () => {
  const [logOpen, setLogOpen] = useState(false);
  const serverName = getServerName();

  // appConfig is a global constant injected by spawn_pending.html (Jinja2)
  const progressUrl = appConfig.progressUrl ?? "";
  const userName = appConfig.userName ?? "";

  const { alerts, pushAlert, removeAlert } = useAlerts();

  const handleReady = useCallback(() => {
    pushAlert("Server is ready! Redirecting…", {
      variant: "success",
      autoDismiss: false,
    });
    setTimeout(() => window.location.reload(), 800);
  }, [pushAlert]);

  const handleFailed = useCallback(
    (error: Error) => {
      pushAlert(`Spawn failed: ${error.message}`, {
        variant: "error",
        autoDismiss: false,
      });
    },
    [pushAlert],
  );

  const {
    progress,
    message,
    eventLog,
    isFailed,
    connectionState,
    reconnectAttempts,
  } = useSpawnProgress({
    url: progressUrl,
    withCredentials: true,
    onReady: handleReady,
    onFailed: handleFailed,
  });

  // Auto-expand the event log when events start arriving
  useEffect(() => {
    if (eventLog.length > 0 && !logOpen) {
      setLogOpen(true);
    }
  }, [eventLog.length, logOpen]);

  // Handle page refresh via button
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      <Alert alerts={alerts} onRemove={removeAlert} />
      <div className="min-h-screen flex flex-col">
        <JupyterHubHeader userName={userName} />

        <div className="container grow mx-auto px-4 py-8 space-y-8 place-content-center">
          <Panel className="my-auto mx-auto w-full max-w-7xl">
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
              <PanelDescription>Name: {serverName}</PanelDescription>
            </PanelHeader>

            <PanelContent className="space-y-4">
              {/* ── Progress section ──────────────────────────────── */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-text truncate mr-4">
                  {message || "Initializing…"}
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

              {/* ── Failure details ───────────────────────────────── */}
              {isFailed && (
                <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
                  Server spawn failed. Check the event log below for details, or
                  try refreshing the page.
                </div>
              )}

              {/* ── Event log (collapsible + virtualized) ─────────── */}
              <Collapsible open={logOpen} onOpenChange={setLogOpen}>
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-medium text-text-heading hover:text-text transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm">
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                  Event log
                  {eventLog.length > 0 && (
                    <span className="text-xs text-text-muted font-normal">
                      ({eventLog.length} event{eventLog.length !== 1 ? "s" : ""}
                      )
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
    </>
  );
};

export default SpawnPending;
