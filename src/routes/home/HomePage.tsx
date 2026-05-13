import "../../styles/index.css";
import "./HomePage.css";
import { JupyterHubApiClient } from "@api";
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
import { validateServerName } from "@utils";

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
  url?: string;
  last_activity?: number;
  [key: string]: unknown;
}

/**
 * Type for internal spawner state with extended data
 */
interface SpawnerData extends ApiSpawnerData {
  name?: string;
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

  // Validate server name for URL safety and duplicates
  const nameValidation = useMemo(() => {
    if (!serverName.trim()) {
      return { isValid: false, isDuplicate: false, errorMessage: "" };
    }

    const validation = validateServerName(serverName);
    const isDuplicate = validation.isValid
      ? Object.keys(spawners).some(
          (name) => name.toLowerCase() === serverName.trim().toLowerCase(),
        )
      : false;

    return {
      isValid: validation.isValid && !isDuplicate,
      isDuplicate,
      errorMessage: validation.errorMessage,
    };
  }, [serverName, spawners]);

  const isInvalid = !nameValidation.isValid;

  const apiClient = new JupyterHubApiClient("/hub/api", appConfig.xsrf);
  const eventSourcesRef = useRef<Map<string, EventSourceItem>>(new Map());

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

  const getServers = async () => {
    try {
      const data = (await apiClient.getNamedServers(
        appConfig.userName,
      )) as Record<string, ApiSpawnerData>;

      if (Object.keys(data).length !== 0) {
        Object.entries(data).forEach(([name, spawner]) => {
          if (!spawners[name] || spawners[name]?.active !== spawner.active) {
            setSpawners((prevSpawners) => {
              const updated = {
                ...prevSpawners,
                [name]: {
                  ...prevSpawners[name],
                  active: true,
                  ready: spawner.ready,
                  url: spawner.url,
                  last_activity: spawner.last_activity,
                },
              };
              return updated;
            });
          }
        });
      }
    } catch (error) {
      console.error(
        `Failed to fetch servers:`,
        error instanceof Error ? error.message : error,
      );
    }
  };

  /**
   * Attaches SSE progress tracking to a spawning server.
   */
  const attachProgressTracking = useCallback(
    (name: string) => {
      if (eventSourcesRef.current.has(name)) return;

      setServerProgress((prev) => ({ ...prev, [name]: 0 }));

      const abort = apiClient.trackSpawnProgress(appConfig.userName, name, {
        onProgress: (progress) => {
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

          setTimeout(() => {
            setServerProgress((prev) => {
              const updated = { ...prev };
              delete updated[name];
              return updated;
            });
          }, 2000);
        },
        onError: (error) => {
          console.error(
            `Failed to track progress for server ${name}:`,
            error instanceof Error ? error.message : error,
          );
          pushAlert(`Failed to track progress for server ${name}`, {
            variant: "error",
          });
          setServerProgress((prev) => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        },
      });

      eventSourcesRef.current.set(name, { abort });
    },
    [pushAlert],
  );

  /**
   * Refreshes server state on tab visibility change and attaches SSE
   * for any servers still spawning.
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;

      await getServers();

      // Attach SSE to any spawning servers not already tracked
      Object.entries(spawners).forEach(([name, spawner]) => {
        if (spawner.active && !spawner.ready) {
          setTimeout(() => attachProgressTracking(name), 0);
        }
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attachProgressTracking, spawners]);

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
  const handleOpenServer = (url: string) => {
    window.open(url, "_blank")?.focus();
  };

  const handleAddServer = () => {
    if (isInvalid) return;

    // Double-check validation before opening spawn URL
    const validation = validateServerName(serverName);
    if (!validation.isValid) return;

    window
      .open(`/spawn/${appConfig.userName}/${serverName.trim()}`, "_blank")
      ?.focus();
    setServerName("");
    setIsAddServerModalOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  const handleStartServer = (name: string) => {
    window.open(`/spawn/${appConfig.userName}/${name}`, "_blank")?.focus();
    window.location.reload();
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

      const abort = apiClient.quickStartWithProgress(appConfig.userName, name, {
        onProgress: (progress) => {
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

          setTimeout(() => {
            setServerProgress((prev) => {
              const updated = { ...prev };
              delete updated[name];
              return updated;
            });
          }, 2000);
        },
        onError: (error) => {
          console.error(
            `Failed to quick start server ${name}:`,
            error instanceof Error ? error.message : error,
          );
          pushAlert(`Failed to start server ${name}`, {
            variant: "error",
          });
          setServerProgress((prev) => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        },
      });

      eventSourcesRef.current.set(name, { abort });
    },
    [pushAlert],
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
      <div className="container grow  mx-auto py-8 space-y-8">
        <div className="named-servers">
          <Panel className="bg-transparent border-0 shadow-none">
            <div className="flex items-center gap-2">
              {/* <H1 className="grow">My servers</H1> */}
              <div className="flex items-center gap-4 my-0 grow">
                <Badge className="px-4 py-2 text-md justify-center text-center">
                  My servers
                  <Small
                    className={cn(
                      Object.keys(spawners).length >= maxServers
                        ? "text-error/80"
                        : Object.keys(spawners).length >= maxServers - 2
                          ? "text-warning-600"
                          : "text-text-muted",
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
                            Must be lowercase letters, numbers, and dashes only.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                          <Input
                            type="text"
                            id="newServerName"
                            value={serverName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setServerName(e.target.value)}
                            placeholder="e.g. ml-experiment, thesis-analysis"
                            pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?"
                            title="Must start and end with a letter or number, and can only contain lowercase letters, numbers, and dashes"
                            className={cn(
                              "w-full bg-surface-raised/80 border-border/60 focus:border-primary focus:bg-surface-raised transition-colors duration-200",
                              "placeholder:text-muted-foreground/70",
                              isInvalid &&
                                "border-error focus-visible:ring-error",
                            )}
                            aria-invalid={isInvalid}
                            aria-describedby="server-name-error"
                            autoFocus
                          />
                          {isInvalid && serverName.trim() && (
                            <div
                              id="server-name-error"
                              className="flex items-center gap-2 text-sm text-error"
                              role="alert"
                            >
                              <AlertCircle size={16} />
                              <span>
                                {nameValidation.isDuplicate
                                  ? `Server name "${serverName}" is already in use`
                                  : nameValidation.errorMessage}
                              </span>
                            </div>
                          )}
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
                          <Button
                            variant={isInvalid ? "outline" : "default"}
                            className={cn(
                              isInvalid && "opacity-50 cursor-not-allowed",
                            )}
                            onClick={handleAddServer}
                            disabled={isInvalid}
                          >
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
                      handleOpen={() => handleOpenServer(spawner.url!)}
                      handleStop={() => handleStopServer(name)}
                      handleDelete={() => handleDeleteServer(name)}
                      handleStart={() => handleStartServer(name)}
                      handleQuickStart={() => handleQuickStart(name)}
                      progress={serverProgress[name]}
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
