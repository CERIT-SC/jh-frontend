import "../../styles/index.css";
import "./HomePage.css";
import { JupyterHubApiClient } from "@api";
import React, { useState } from "react";
import { EinfraFooter, JupyterHubHeader } from "@components/layout";
import {
  ServerCard,
  ServerCardInline,
  EmptyServerCard,
} from "@components/features";
import initDev from "../../dev-setup";
import { Alert } from "@components/ui";
import { useAlerts } from "@hooks";
import { TileSelector } from "@components/ui";
import { H1, H4, Panel, PanelContent, Button } from "@e-infra/design-system";
import { LayoutGrid, LayoutList } from "lucide-react";
import { GrafanaQuery } from "@api";
function HomePage() {
  if (import.meta.env.DEV) {
    initDev();
  }

  const { alerts, pushAlert, removeAlert } = useAlerts();
  const [spawners, setSpawners] = useState(appConfig.spawners);
  const [defaultServerActive, setDefaultServerActive] = useState(
    appConfig.default_server_active,
  );
  const [serverName, setServerName] = useState("");

  const apiClient = new JupyterHubApiClient("/hub/api", appConfig.xsrf);

  const handleStopServer = async (name) => {
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
      console.error(`Failed to stop server ${name}:`, error.message);
      pushAlert(`Failed to stop server ${name}: ${error.message}`, {
        variant: "error",
      });
    }
  };

  const getServers = async () => {
    try {
      const data = await apiClient.getNamedServers(appConfig.userName);

      if (data.length !== 0) {
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
      console.error(`Failed to fetch servers:`, error.message);
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      getServers();
    }
  });

  const handleStopDefaultServer = async () => {
    try {
      await apiClient.stopDefaultServer(appConfig.userName);

      setDefaultServerActive(false);
    } catch (error) {
      console.error(`Failed to stop Default server:`, error.message);
      pushAlert(`Failed to stop default server: ${error.message}`, {
        variant: "error",
      });
    }
  };

  const handleDeleteServer = async (name) => {
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
      console.error(`Failed to stop server ${name}:`, error.message);
      pushAlert(`Failed to delete server ${name}: ${error.message}`, {
        variant: "error",
      });
    }
  };
  const handleOpenServer = (url) => {
    window.open(url, "_bank").focus();
  };

  const handleAddServer = (url) => {
    window.open(url);
    window.location.reload();
  };

  const [gridType, setGridType] = useState(1);
  const ServerCardType = gridType === 1 ? ServerCard : ServerCardInline;

  return (
    <div className="min-h-screen flex flex-col">
      <Alert alerts={alerts} onRemove={removeAlert} />
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <div className="container grow  mx-auto px-4 py-8 space-y-8">
        <div className="named-servers">
          <Panel className="bg-background/60">
            <div className="flex items-center">
              <H1 className="grow">My servers</H1>
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
                {Object.entries(spawners).map(([name, spawner]) => (
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
                    handleStart={() =>
                      handleAddServer(`/spawn/${appConfig.userName}/${name}`)
                    }
                  />
                ))}
                {Object.keys(spawners).length < 15 && (
                  <EmptyServerCard
                    onAddServer={handleAddServer}
                    serverName={serverName}
                    onServerNameChange={(value) => setServerName(value)}
                    placeholder="Name Your Server"
                    buttonText="Add Server"
                    description="e.g. ml-experiment, thesis-analysis"
                    existingNames={Object.keys(spawners)}
                    variant={gridType === 1 ? "default" : "inline"}
                  />
                )}
              </div>
            </PanelContent>
          </Panel>
        </div>
      </div>
      <EinfraFooter />
    </div>
  );
}

export default HomePage;
