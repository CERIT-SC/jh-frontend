import "./index.css";
import "./HomePage.css";
import { JupyterHubApiClient } from "../../src/api/JupyterHubAPI";
import React, { useState } from "react";
import { Button } from "../../src/components/Button/Button";
import { EinfraFooter } from "../../src/components/FooterAndHeader/EinfraFooter";
import JupyterHubHeader from "../../src/components/FooterAndHeader/JupyterHubHeader";

function HomePage() {
  // for testing with npm run dev please uncomment this block
  const appConfig = {
    spawners: {
      "test": {
        last_activity: "2024-11-24T15:48:29.604740Z",
        url: "/user/test",
        active: true,
        ready: false,
      },
      "test1": {
        last_activity: "2024-11-24T15:46:56.719146Z",
        url: "/user/test1",
        active: false,
        ready: false,
      },
      ...Array.from({ length: 0 }, (_, i) => `spawner${i + 1}`).reduce((acc, spawner) => {
        acc[spawner] = {
          last_activity: new Date().toISOString(),
          url: `/user/${spawner}`,
          active: Math.random() < 0.5, // Randomly set active status
          ready: Math.random() < 0.5, // Randomly set ready status
        };
        return acc;
      }, {})
    },
    default_server_active: false,
    url: "http://localhost",
    userName: "dev",
    xsrf: "sample-xsrf-token",
  };

  const [defaultServerActive, setDefaultServerActive] = useState(
    appConfig.default_server_active,
  );

  const handleStopDefaultServer = async () => {
    try {
      await apiClient.stopDefaultServer(appConfig.userName);

      setDefaultServerActive(false);
    } catch (error) {
      console.error(`Failed to stop Default server:`, error.message);
    }
  };

  const apiClient = new JupyterHubApiClient("/hub/api", appConfig.xsrf);


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
        <EinfraFooter />
      </div>
    </div>
  );
}

export default HomePage;
