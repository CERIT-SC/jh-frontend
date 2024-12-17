import "./index.css";
import "./NotRunning.css";
import React from "react";
import { Button } from "./stories/Button";
import { EinfraFooter } from "./stories/EinfraFooter";
import JupyterHubHeader from "./stories/JupyterHubHeader";

function NotRunning() {
  return (
    <div>
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <div className="wrapper">
        <h2> Server not running </h2>

        <p> Your server is not running. Would you like to start it? </p>
        <div className="default-server-btns">
          <div className="btn-wrapper">
            <Button
              title={`Launch Server ${appConfig.serverName}`}
              link={appConfig.spawnUrl}
            ></Button>
          </div>
        </div>
        <EinfraFooter />
      </div>
    </div>
  );
}

export default NotRunning;
