import "./index.css";
import "./HomePage.css";
import { JupyterHubApiClient } from "./api/JupyterHubAPI";
import React, { useState } from "react";
import { DropDownButton } from "./components/DropDownButton/DropDownButton";
import { Button } from "./components/Button/Button";
import { EinfraFooter } from "./components/FooterAndHeader/EinfraFooter";
import JupyterHubHeader from "./components/FooterAndHeader/JupyterHubHeader";
import { FieldHeader } from "./components/FieldHeader/FieldHeader";

function HomePage() {
  // for testing with npm run dev please uncomment this block
  // const appConfig = {
  //   spawners: {
  //     "test": {
  //       last_activity: "2024-11-24T15:48:29.604740Z",
  //       url: "/user/test",
  //       active: true,
  //       ready: false,
  //     },
  //     "test1": {
  //       last_activity: "2024-11-24T15:46:56.719146Z",
  //       url: "/user/test1",
  //       active: false,
  //       ready: false,
  //     },
  //     ...Array.from({ length: 50 }, (_, i) => `spawner${i + 1}`).reduce((acc, spawner) => {
  //       acc[spawner] = {
  //         last_activity: new Date().toISOString(),
  //         url: `/user/${spawner}`,
  //         active: Math.random() < 0.5, // Randomly set active status
  //         ready: Math.random() < 0.5, // Randomly set ready status
  //       };
  //       return acc;
  //     }, {})
  //   },
  //   default_server_active: false,
  //   url: "http://localhost",
  //   userName: "dev",
  //   xsrf: "sample-xsrf-token",
  // };

  const [spawners, setSpawners] = useState(appConfig.spawners);
  const [defaultServerActive, setDefaultServerActive] = useState(
    appConfig.default_server_active,
  );
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [serverName, setServerName] = useState("");

  const handleStopServer = async (name) => {
    try {
      await apiClient.stopNamedServer(appConfig.userName, name, false);

      setSpawners((prevSpawners) => {
        const updated = { ...prevSpawners };
        if (updated[name]) {
          updated[name].active = false;
        }
        return updated;
      });
    } catch (error) {
      console.error(`Failed to stop server ${name}:`, error.message);
    }
  };

  const handleStopDefaultServer = async () => {
    try {
      await apiClient.stopDefaultServer(appConfig.userName);

      setDefaultServerActive(false);
    } catch (error) {
      console.error(`Failed to stop Default server:`, error.message);
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
    } catch (error) {
      console.error(`Failed to stop server ${name}:`, error.message);
    }
  };

  const handleAddServer = () => {
    window.location.href = `/hub/spawn/${appConfig.userName}/${serverName}`;
  };

  const isActiveIndex = (index) => {
    return activeDropdownIndex === index;
  };

  const apiClient = new JupyterHubApiClient("/hub/api", appConfig.xsrf);

  const dateFormat = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div>
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <div className="wrapper">
        <div className="default-server-btns">
          {defaultServerActive && (
            <div className="btn-wrapper">
              <Button
                title="Stop My Server"
                primary={false}
                onClickFun={handleStopDefaultServer}
              />
            </div>
          )}
          <div className="btn-wrapper">
            <Button
              title="My Server"
              link={
                defaultServerActive
                  ? appConfig.url
                  : `spawn/${appConfig.userName}`
              }
            ></Button>
          </div>
        </div>
        <div className="named-servers">
          <h2> Named Servers </h2>
          <p>
            {" "}
            In addition to your default server, you may have additional 15
            server(s) with names. This allows you to have more than one server
            running at the same time.{" "}
          </p>
          <div className="start-named-server">
            <input
              placeholder="Name your server"
              onChange={(e) => setServerName(e.target.value)}
            />
            <Button title="Add New Server" onClickFun={handleAddServer} />
          </div>
          {Object.entries(spawners).map(([name, spawner], dropdownIndex) => (
            <FieldHeader
              title={name}
              isActive={isActiveIndex(dropdownIndex)}
              hasIcon={true}
              onActivate={() => setActiveDropdownIndex(dropdownIndex)}
            >
              <div className="server-properties">
                {spawner.active && <a className="server-url" href={spawner.url}> {spawner.url} </a>
                }
                <div className="time-col">
                  {spawner.last_activity
                    ? dateFormat(spawner.last_activity)
                    : "Never"}
                </div>
                <div className="action-buttons">
                  {spawner.active && (
                    <Button
                      title="Stop"
                      primary={false}
                      onClickFun={() => handleStopServer(name)}
                    />
                  )}
                  {!spawner.active && (
                    <Button
                      title="Remove"
                      primary={false}
                      onClickFun={() => handleDeleteServer(name)}
                    />
                  )}
                  {!spawner.active && (
                    <Button
                      title="Start"
                      link={`/spawn/${appConfig.userName}/${name}`}
                    />
                  )}
                </div>
              </div>
            </FieldHeader>
          ))}
        </div>
        <EinfraFooter />
      </div>
    </div>
  );
}

export default HomePage;
