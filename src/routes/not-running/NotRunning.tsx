import "../../styles/index.css";
import "./NotRunning.css";
import React from "react";
import { Button } from "@e-infra/design-system";
import { Footer, JupyterHubHeader } from "@components/layout";
import type { NotRunningAppConfig } from "@src-types/routes/appConfig";

/**
 * Global config injected by JupyterHub's Jinja2 template (not_running.html).
 */
declare const appConfig: NotRunningAppConfig;

const NotRunning: React.FC = () => {
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
        <Footer />
      </div>
    </div>
  );
};

export default NotRunning;
