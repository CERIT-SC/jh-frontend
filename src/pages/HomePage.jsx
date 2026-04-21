import "../styles/index.css";
import { JupyterHubApiClient } from "../api/JupyterHubAPI";
import React, { useState } from "react";
import { Button } from "@e-infra/design-system";
import { EinfraFooter } from "../components/FooterAndHeader/EinfraFooter";
import JupyterHubHeader from "../components/FooterAndHeader/JupyterHubHeader";
import {
  ServerCard,
  ServerCardInline,
  EmptyServerCard,
} from "../components/ServerCard/ServerCard";
import initDev from "../dev-setup";
import { Alert } from "../components/Alert";
import { useAlerts } from "../hooks/useAlerts";
import { TileSelector } from "../components/TileSelector/TileSelector";
import {
  H2,
  H3,
  H4,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
} from "@e-infra/design-system";
import { LayoutGrid, LayoutList, Server, Plus, Play } from "lucide-react";
import { GrafanaQuery } from "../api/GrafanaAPI";
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

  const fetchUsage = async () => {
    try {
      // const data = await fetchGrafanaData("xbencs00", "test-server");
      const data = await new GrafanaQuery()
        .freeGPUs("NVIDIA-A10")
        .totalGPUs("NVIDIA-A10")
        .execute();
      console.log("Fetched Grafana data:", data);
    } catch (error) {
      console.error("Error fetching Grafana data:", error);
    }
  };

  const handleStopServer = async (name) => {
    console.log(`Stopping server: ${name}`);
    try {
      await apiClient
        .stopNamedServer(appConfig.userName, name, false)
        .then((result) => {
          pushAlert(`Server ${name} stopped successfully`, {
            variant: "success",
          });
        });

      setSpawners((prevSpawners) => {
        const updated = { ...prevSpawners };
        if (updated[name]) {
          updated[name].active = false;
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

  const handleAddServer = () => {
    window.location.href = `/hub/spawn/${appConfig.userName}/${serverName}`;
  };

  const [gridType, setGridType] = useState(1);
  const ServerCardType = gridType === 1 ? ServerCard : ServerCardInline;

  return (
    <div className="min-h-screen flex flex-col">
      <Alert alerts={alerts} onRemove={removeAlert} />
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      {/* <Button onClick={fetchUsage} className="mx-4 my-2">
        Fetch CPU Usage (Grafana)
      </Button> */}
      <div className="container grow  mx-auto px-4 py-8 space-y-8">
        {/* Default Server Button */}

        {/* <div className="add-server basis-1/3 flex flex-col gap-4">
          <div className="default-server-btns">
            <Panel className="itmes-center justify-center text-center flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Server color="var(--primary)" />
                <H3>My Default Server</H3>
              </div>
              <PanelDescription>
                This is your default server. You can use it for general
                purposes. If you want to run a specific project, we recommend
                you to add a new server.
              </PanelDescription>
              {defaultServerActive && (
                <div className="btn-wrapper">
                  <Button variant="secondary" onClick={handleStopDefaultServer}>
                    Stop My Server
                  </Button>
                </div>
              )}
              <div className="btn-wrapper">
                <Button
                  className="w-full"
                  onClick={() =>
                    (window.location.href = defaultServerActive
                      ? appConfig.url
                      : `spawn/${appConfig.userName}`)
                  }
                >
                  <Play size={16} strokeWidth={3} />
                  My Server
                </Button>
              </div>
            </Panel>
          </div>
        </div> */}
        <div className="named-servers">
          <Panel>
            <div className="flex items-center">
              <H4 className="grow">My servers</H4>
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
                <ServerCardType
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
                />
                {Object.entries(spawners).map(([name, spawner]) => (
                  <ServerCardType
                    title={name}
                    key={name}
                    spawnerUrl={spawner.url}
                    lastActivity={spawner.last_activity}
                    isActive={spawner.active}
                    handleOpen={() => (window.location.href = spawner.url)}
                    handleStop={() => handleStopServer(name)}
                    handleDelete={() => handleDeleteServer(name)}
                    handleStart={() =>
                      (window.location.href = `/spawn/${appConfig.userName}/${name}`)
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
