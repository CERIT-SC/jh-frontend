import "../styles/index.css";
import "../styles/NotRunning.css";
import React from "react";
import { Button } from "@e-infra/design-system";
import { EinfraFooter } from "../components/FooterAndHeader/EinfraFooter";
import JupyterHubHeader from "../components/FooterAndHeader/JupyterHubHeader";

function NotRunning() {
  return (
    <div>
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <div className="wrapper">
        <h2> Server not running </h2>

        <p> Your server is not running. Would you like to start it? </p>
        <div className="default-server-btns">
          <div className="btn-wrapper">
            <Button onClick={() => (window.location.href = appConfig.spawnUrl)}>
              Launch Server {appConfig.serverName}
            </Button>
          </div>
        </div>
        <EinfraFooter />
      </div>
    </div>
  );
}

export default NotRunning;
