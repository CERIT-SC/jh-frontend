import "./SpawnPending.css";
import React, { useEffect, useState } from "react";
import { EinfraFooter } from "./components/FooterAndHeader/EinfraFooter";
import JupyterHubHeader from "./components/FooterAndHeader/JupyterHubHeader";

const SpawnPending = () => {
  const [progress, setProgress] = useState("0");

  useEffect(() => {
    const handleRefresh = () => {
      window.location.reload();
    };

    document
      .getElementById("refresh")
      ?.addEventListener("click", handleRefresh);

    const evtSource = new EventSource(appConfig.progressUrl);
    const progressMessage = document.getElementById("progress-message");
    const progressBar = document.getElementById("progress-line-filled");
    const progressLog = document.getElementById("progress-log");

    evtSource.onmessage = (e) => {
      const evt = JSON.parse(e.data);
      console.log(evt);

      if (evt.progress !== undefined) {
        setProgress(evt.progress.toString());
      }

      let htmlMessage = "";
      if (evt.html_message !== undefined) {
        if (progressMessage) progressMessage.innerHTML = evt.html_message;
        htmlMessage = evt.html_message;
      } else if (evt.message !== undefined) {
        if (progressMessage) progressMessage.textContent = evt.message;
        htmlMessage = evt.message;
      }

      if (htmlMessage && progressLog) {
        const logEvent = document.createElement("div");
        logEvent.className = "progress-log-event";
        logEvent.innerHTML = htmlMessage;
        progressLog.appendChild(logEvent);
      }

      if (evt.ready) {
        evtSource.close();
        window.location.reload();
      }

      if (evt.failed) {
        evtSource.close();
        if (progressBar)
          progressBar.classList.add("progress-line-filled-danger");
        const progressDetails = document.getElementById("progress-details");
        if (progressDetails) progressDetails.open = true;
      }
    };

    return () => {
      evtSource.close();
      document
        .getElementById("refresh")
        ?.removeEventListener("click", handleRefresh);
    };
  }, [appConfig.progressUrl]);

  return (
    <>
      <JupyterHubHeader userName={appConfig.userName}> </JupyterHubHeader>
      <div className="wrapper">
        <div className="row">
          <div className="text-center">
            <div className="message-block">
              <p>Your server is starting up.</p>
              <p>
                You will be redirected automatically when it&apos;s ready for
                you.
              </p>
            </div>
            <div className="progress-line">
              <div
                className="progress-line-filled"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        <p id="progress-message"></p>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <details id="progress-details">
              <summary>Event log</summary>
              <div id="progress-log"></div>
            </details>
          </div>
        </div>
        <EinfraFooter></EinfraFooter>
      </div>
    </>
  );
};

export default SpawnPending;
