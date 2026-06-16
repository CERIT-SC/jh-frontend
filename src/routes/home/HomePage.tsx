import "../../styles/index.css";
import "./HomePage.css";
import { JupyterHubApiClient, fetchResourceUsage } from "@api";
import type { ResourceUsageData } from "@api";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Footer, JupyterHubHeader } from "@components/layout";
import {
  ServerCard,
  ServerCardInline,
  EmptyServerCard,
} from "@components/features";
import initDev from "../../dev-setup";
import { Alert } from "@components/ui";
import { useAlerts } from "@hooks";
import { TileSelector } from "@components/ui";
import {
  H1,
  Panel,
  PanelContent,
  Badge,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  cn,
  Small,
} from "@e-infra/design-system";
import { LayoutGrid, LayoutList, Plus, AlertCircle } from "lucide-react";
import type { HomeAppConfig } from "@src-types/appConfig";

/**
 * Global config injected by JupyterHub's Jinja2 template (home.html).
 */
declare const appConfig: HomeAppConfig;

/**
 * Type for spawner data structure returned by JupyterHub API
 */
interface ApiSpawnerData {
  active: boolean;
  ready: boolean;
  pending?: "spawn" | "stop" | null;
  url?: string;
  last_activity?: number;
  [key: string]: unknown;
}

/**
 * Type for internal spawner state with extended data
 */
interface SpawnerData extends ApiSpawnerData {
  name?: string;
  pending?: "spawn" | "stop" | null;
}

/**
 * Type for server progress tracking
 */
interface ServerProgress {
  [serverName: string]: number;
}

/**
 * Type for event source abort controller
 */
interface EventSourceItem {
  abort: () => void;
}

/**
 * Maximum number of servers a user can create.
 */
const maxServers = 15;

/**
 * Maximum length for server names to comply with Kubernetes label limits.
 * Safe limit: 30 characters for server name.
 */
const SERVER_NAME_MAX_LENGTH = 30;

function HomePage() {
  if (import.meta.env.DEV) {
    initDev();
  }

  const { alerts, pushAlert, removeAlert } = useAlerts();
  const [spawners, setSpawners] = useState<Record<string, SpawnerData>>(
    appConfig.spawners as Record<string, SpawnerData>,
  );
  const [serverName, setServerName] = useState("");
  const [serverProgress, setServerProgress] = useState<ServerProgress>({});
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);

  const isTooLong = useMemo(() => {
    return serverName.trim().length > SERVER_NAME_MAX_LENGTH;
  }, [serverName]);

  const isDuplicate = useMemo(() => {
    if (!serverName.trim()) {
      return false;
    }
    return Object.keys(spawners).some(
      (name) => name.toLowerCase() === serverName.trim().toLowerCase(),
    );
  }, [serverName, spawners]);

  const isEmpty = !serverName.trim();

  const apiClient = new JupyterHubApiClient("/hub/api", appConfig.xsrf);
  const eventSourcesRef = useRef<Map<string, EventSourceItem>>(new Map());

  // Resource usage fetch + poll (inline pattern, same as GPU indicators)
  const resourceUsageRef = useRef<ResourceUsageData>({});
  const [resourceUsage, setResourceUsage] = useState<ResourceUsageData>({});

  const fetchUsage = useCallback(async () => {
    try {
      const data = await fetchResourceUsage(appConfig.userName);
      // Only update if data changed (shallow key compare)
      const prev = resourceUsageRef.current;
      const sameKeys =
        Object.keys(data).length === Object.keys(prev).length &&
        Object.keys(data).every((k) => k in prev);
      if (!sameKeys) {
        resourceUsageRef.current = data;
        setResourceUsage(data);
        return;
      }
      // Deep compare values to avoid unnecessary re-renders
      const changed = Object.entries(data).some(
        ([k, v]) =>
          prev[k]?.cpu_usage_ratio !== v.cpu_usage_ratio ||
          prev[k]?.memory_usage_bytes !== v.memory_usage_bytes,
      );
      if (changed) {
        resourceUsageRef.current = data;
        setResourceUsage(data);
      }
    } catch (err) {
      console.error(
        "Resource usage fetch error:",
        err instanceof Error ? err.message : err,
      );
    }
  }, [appConfig.userName]);

  useEffect(() => {
    const hasActiveServers = Object.values(spawners).some(
      (s) => s.active && s.ready,
    );
    if (!hasActiveServers) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      await fetchUsage();
      // Check if any active server has incomplete data (memoryLimit still 0)
      const hasIncompleteData = Object.entries(resourceUsageRef.current).some(
        ([name, metrics]) => {
          const spawner = spawners[name];
          return (
            spawner?.active &&
            spawner?.ready &&
            (!metrics || metrics.memory_limit_bytes === 0)
          );
        },
      );
      const delay = hasIncompleteData ? 5000 : 30000;
      timeoutId = setTimeout(poll, delay);
    };

    poll();
    return () => clearTimeout(timeoutId);
  }, [fetchUsage, spawners]);

  const handleStopServer = async (name: string) => {
    console.log(`Stopping server: ${name}`);
    try {
      await apiClient
        .stopNamedServer(appConfig.userName, name, false)
        .then(() => {
          pushAlert(`Server ${name} stopped successfully`, {
            variant: "success",
          });
        });

      setSpawners((prevSpawners) => {
        const updated = { ...prevSpawners };
        if (updated[name]) {
          updated[name].active = false;
          updated[name].ready = false;
        }
        return updated;
      });
    } catch (error) {
      console.error(
        `Failed to stop server ${name}:`,
        error instanceof Error ? error.message : error,
      );
      pushAlert(
        `Failed to stop server ${name}: ${error instanceof Error ? error.message : error}`,
        {
          variant: "error",
        },
      );
    }
  };

  const getServers = async (): Promise<Record<string, ApiSpawnerData>> => {
    try {
      const data = (await apiClient.getNamedServers(
        appConfig.userName,
      )) as Record<string, ApiSpawnerData>;

      if (Object.keys(data).length !== 0) {
        Object.entries(data).forEach(([name, spawner]) => {
          setSpawners((prevSpawners) => {
            const existing = prevSpawners[name];
            const needsUpdate =
              !existing ||
              existing.active !== spawner.active ||
              existing.pending !== spawner.pending ||
              (!existing.url && spawner.url);

            if (!needsUpdate) return prevSpawners;

            return {
              ...prevSpawners,
              [name]: {
                ...prevSpawners[name],
                active: spawner.active ?? true,
                pending: spawner.pending,
                ready: spawner.ready,
                url: spawner.url ?? prevSpawners[name]?.url,
                last_activity: spawner.last_activity,
              },
            };
          });
        });
      }
      return data;
    } catch (error) {
      console.error(
        `Failed to fetch servers:`,
        error instanceof Error ? error.message : error,
      );
      return {};
    }
  };

  /**
   * Creates shared progress tracking callbacks for spawn operations.
   */
  const createProgressCallbacks = useCallback(
    (name: string, { showError = false }: { showError?: boolean } = {}) => ({
      onProgress: (progress: number) => {
        setServerProgress((prev) => ({ ...prev, [name]: progress }));
      },
      onComplete: () => {
        setSpawners((prev) => {
          const updated = { ...prev };
          if (updated[name]) {
            updated[name].active = true;
            updated[name].ready = true;
          }
          return updated;
        });

        setServerProgress((prev) => ({ ...prev, [name]: 100 }));
        pushAlert(`Server ${name} started successfully`, {
          variant: "success",
        });

        // Refresh server data from API to populate URL
        getServers();

        // Clean up event source reference
        eventSourcesRef.current.delete(name);

        setTimeout(() => {
          setServerProgress((prev) => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        }, 500);
      },
      onError: (error: Error) => {
        console.error(
          `Failed to track progress for server ${name}:`,
          error instanceof Error ? error.message : error,
        );
        if (showError) {
          pushAlert(`Failed to start server ${name}`, {
            variant: "error",
          });
        }
        setServerProgress((prev) => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
        // Clean up event source reference
        eventSourcesRef.current.delete(name);
      },
    }),
    [pushAlert],
  );

  /**
   * Attaches SSE progress tracking to a spawning server.
   */
  const attachProgressTracking = useCallback(
    (name: string) => {
      if (eventSourcesRef.current.has(name)) return;

      setServerProgress((prev) => ({ ...prev, [name]: 0 }));

      const abort = apiClient.trackSpawnProgress(
        appConfig.userName,
        name,
        createProgressCallbacks(name),
      );

      eventSourcesRef.current.set(name, { abort });
    },
    [createProgressCallbacks],
  );

  /**
   * Refreshes server state on tab visibility change and attaches SSE
   * for any servers still spawning.
   */
  useEffect(() => {
    const init = async () => {
      const servers = await getServers();
      // Attach SSE only to servers explicitly pending spawn.
      // Do NOT use (active && !ready) alone — that also matches servers
      // that are pending stop (active=true, ready=false, pending="stop").
      Object.entries(servers).forEach(([name, spawner]) => {
        if (spawner.pending === "spawn") {
          attachProgressTracking(name);
        }
      });
    };
    init();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;

      const servers = await getServers();

      // Attach SSE only to servers explicitly pending spawn
      Object.entries(servers).forEach(([name, spawner]) => {
        if (spawner.pending === "spawn") {
          attachProgressTracking(name);
        }
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attachProgressTracking]);

  /**
   * Polls server state while any server is pending stop.
   */
  useEffect(() => {
    const hasStopping = Object.values(spawners).some(
      (s) => s.pending === "stop",
    );
    if (!hasStopping) return;

    const interval = setInterval(() => {
      getServers();
    }, 3000);

    return () => clearInterval(interval);
  }, [spawners]);

  const handleDeleteServer = async (name: string) => {
    try {
      await apiClient.stopNamedServer(appConfig.userName, name, true);

      setSpawners((prevSpawners) => {
        const updated = { ...prevSpawners };
        delete updated[name];
        return updated;
      });
      pushAlert(`Server ${name} deleted successfully`, {
        variant: "success",
      });
    } catch (error) {
      console.error(
        `Failed to stop server ${name}:`,
        error instanceof Error ? error.message : error,
      );
      pushAlert(
        `Failed to delete server ${name}: ${error instanceof Error ? error.message : error}`,
        {
          variant: "error",
        },
      );
    }
  };
  const handleOpenServer = (url?: string) => {
    if (!url) {
      pushAlert("Server URL not available yet", { variant: "warning" });
      return;
    }
    window.open(url, "_self")?.focus();
  };

  const handleAddServer = () => {
    const trimmedName = serverName.trim();
    if (trimmedName.length > SERVER_NAME_MAX_LENGTH) {
      pushAlert(
        `Server name is too long. Maximum length is ${SERVER_NAME_MAX_LENGTH} characters.`,
        { variant: "error" },
      );
      return;
    }
    window
      .open(`/spawn/${appConfig.userName}/${trimmedName}`, "_self")
      ?.focus();
    setServerName("");
    setIsAddServerModalOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  const handleStartServer = (name: string) => {
    window.open(`/spawn/${appConfig.userName}/${name}`, "_self")?.focus();
  };

  /**
   * Starts a server via API and tracks spawn progress inline.
   */
  const handleQuickStart = useCallback(
    async (name: string) => {
      setSpawners((prev) => {
        const updated = { ...prev };
        if (updated[name]) {
          updated[name].active = true;
          updated[name].ready = false;
        }
        return updated;
      });
      setServerProgress((prev) => ({ ...prev, [name]: 0 }));

      const abort = apiClient.quickStartWithProgress(
        appConfig.userName,
        name,
        createProgressCallbacks(name, { showError: true }),
      );

      eventSourcesRef.current.set(name, { abort });
    },
    [createProgressCallbacks],
  );

  // Cleanup SSE connections on unmount
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((item) => item.abort?.());
      eventSourcesRef.current.clear();
    };
  }, []);

  const [gridType, setGridType] = useState(1);
  const ServerCardType = gridType === 1 ? ServerCard : ServerCardInline;

  return (
    <div className="min-h-screen flex flex-col">
      <Alert alerts={alerts} onRemove={removeAlert} />
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <div className="container grow  mx-auto py-2 space-y-8">
        <div className="named-servers">
          <Panel className="bg-transparent border-0 shadow-none">
            <div className="flex items-center gap-2">
              {/* <H1 className="grow">My servers</H1> */}
              <div className="flex items-center gap-4 my-0 grow">
                <Badge className="px-4 py-2 text-md justify-center text-center">
                  My servers
                  <Small
                    className={cn(
                      "pl-2",
                      Object.keys(spawners).length >= maxServers
                        ? "text-error/80"
                        : Object.keys(spawners).length >= maxServers - 2
                          ? "text-warning-600"
                          : "",
                    )}
                  >
                    {Object.keys(spawners).length} / {maxServers}
                  </Small>
                </Badge>
                <Dialog
                  open={isAddServerModalOpen}
                  onOpenChange={setIsAddServerModalOpen}
                >
                  <DialogTrigger asChild>
                    <Badge
                      variant={"outline"}
                      className={cn(
                        "px-4 py-2 text-md justify-center text-center",
                        "cursor-pointer transition-all duration-200 bg-tertiary",
                        " hover:border-primary dark:hover:border-primary/50 ",
                      )}
                      onClick={() => setIsAddServerModalOpen(true)}
                    >
                      + New Server{" "}
                    </Badge>
                  </DialogTrigger>
                  <DialogContent>
                    {Object.keys(spawners).length >= maxServers ? (
                      <DialogHeader>
                        <DialogTitle>Server Limit Reached</DialogTitle>
                        <DialogDescription>
                          You have reached the maximum number of servers (
                          {maxServers}). Please delete an existing server before
                          creating a new one.
                        </DialogDescription>
                      </DialogHeader>
                    ) : (
                      <>
                        <DialogHeader>
                          <DialogTitle>Name Your Server</DialogTitle>
                          <DialogDescription>
                            Choose a unique name for your new server. This name
                            will be used to identify your server in the list.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-1">
                          <Input
                            type="text"
                            id="newServerName"
                            value={serverName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setServerName(e.target.value)}
                            placeholder="e.g. ml-experiment, thesis-analysis"
                            maxLength={SERVER_NAME_MAX_LENGTH}
                            className={cn(
                              "w-full bg-surface-raised/80 border-border/60 focus:border-primary focus:bg-surface-raised transition-colors duration-200",
                              "placeholder:text-muted-foreground/70",
                              (isDuplicate || isTooLong) &&
                                "border-error focus-visible:ring-error",
                            )}
                            aria-invalid={isDuplicate || isTooLong}
                            aria-describedby="server-name-error"
                            autoFocus
                          />
                          <div className="flex justify-end">
                            <Small
                              className={cn(
                                "text-xs",
                                isTooLong
                                  ? "text-error"
                                  : "text-muted-foreground",
                              )}
                            >
                              {serverName.length} / {SERVER_NAME_MAX_LENGTH}
                            </Small>
                          </div>
                          <div
                            id="server-name-error"
                            className={`flex items-center gap-2 text-sm text-error min-h-[1.25rem] ${isDuplicate || isTooLong ? "visible" : "invisible"}`}
                            role="alert"
                            aria-live="polite"
                          >
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span className="truncate">
                              {isTooLong
                                ? `Server name is too long (max ${SERVER_NAME_MAX_LENGTH} characters)`
                                : isDuplicate
                                  ? `Server name "${serverName}" is already in use`
                                  : "\u00A0"}
                            </span>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setIsAddServerModalOpen(false);
                              setServerName("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddServer} disabled={isEmpty}>
                            <Plus size={16} strokeWidth={3} />
                            Add Server
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <TileSelector
                options={[1, 2]}
                defaultValue={1}
                onChange={setGridType}
                className="w-24 h-10"
                renderOptionLabel={(value) =>
                  value === 1 ? (
                    <span
                      className="inline-flex justify-center"
                      aria-label="Grid view"
                    >
                      <LayoutGrid size={14} />
                    </span>
                  ) : (
                    <span
                      className="inline-flex justify-center"
                      aria-label="List view"
                    >
                      <LayoutList size={14} />
                    </span>
                  )
                }
              />
            </div>
            <PanelContent className="pt-2">
              <div
                className={
                  "mt-4 grid gap-8 " +
                  (gridType === 1
                    ? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center"
                    : "grid-cols-1")
                }
              >
                {/* <ServerCardType
                  title="Default Server"
                  key="default-server"
                  spawnerUrl={appConfig.url}
                  isActive={defaultServerActive}
                  handleOpen={() => (window.location.href = appConfig.url)}
                  handleStop={handleStopDefaultServer}
                  handleStart={() =>
                    (window.location.href = `/spawn/${appConfig.userName}`)
                  }
                  showDeleteButton={false}
                /> */}
                {Object.entries(spawners)
                  .sort(([, a], [, b]) => {
                    if (!a.last_activity) return 1;
                    if (!b.last_activity) return -1;
                    return (
                      new Date(b.last_activity).getTime() -
                      new Date(a.last_activity).getTime()
                    );
                  })
                  .map(([name, spawner]) => (
                    <ServerCardType
                      title={name}
                      key={name}
                      spawnerUrl={spawner.url}
                      lastActivity={spawner.last_activity}
                      isActive={spawner.active}
                      isReady={spawner.ready}
                      handleOpen={() => handleOpenServer(spawner.url)}
                      handleStop={() => handleStopServer(name)}
                      handleDelete={() => handleDeleteServer(name)}
                      handleStart={() => handleStartServer(name)}
                      handleQuickStart={() => handleQuickStart(name)}
                      progress={serverProgress[name]}
                      cpuUsage={resourceUsage[name]?.cpu_usage_ratio}
                      memoryUsed={resourceUsage[name]?.memory_usage_bytes}
                      memoryLimit={resourceUsage[name]?.memory_limit_bytes}
                    />
                  ))}
                {Object.keys(spawners).length < maxServers && (
                  <EmptyServerCard
                    onClick={() => setIsAddServerModalOpen(true)}
                    variant={gridType === 1 ? "default" : "inline"}
                  />
                )}
              </div>
            </PanelContent>
          </Panel>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
