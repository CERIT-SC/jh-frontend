// import "./SpawnPending.css";
import React, { useEffect, useState } from "react";
import { EinfraFooter } from "../components/FooterAndHeader/EinfraFooter";
import JupyterHubHeader from "../components/FooterAndHeader/JupyterHubHeader";
import {
  Panel,
  PanelContent,
  PanelHeader,
  Progress,
  Separator,
  PanelTitle,
  PanelDescription,
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
  P,
} from "@e-infra/design-system";

const SpawnPending = () => {
  const [progress, setProgress] = useState("0");

  const getServerName = () => {
    // URL pattern: /hub/spawn-pending/{name}/{name_of_server}
    const path = window.location.pathname;
    const match = path.match(/\/hub\/spawn-pending\/[^/]+\/([^/?]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // fallback to query param for backward compatibility
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("server_name") || "default";
  };

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
      <div className="min-h-screen flex flex-col">
        {" "}
        {/*min-h-screen*/}
        <JupyterHubHeader userName={appConfig.userName}> </JupyterHubHeader>
        <Panel className=" my-auto mx-auto w-5/6">
          <PanelHeader>
            <PanelTitle>
              Starting your server
              <span className="inline-block animate-bounce [animation-delay:0ms]">
                .
              </span>
              <span className="inline-block animate-bounce [animation-delay:150ms]">
                .
              </span>
              <span className="inline-block animate-bounce [animation-delay:300ms]">
                .
              </span>
            </PanelTitle>
            <PanelDescription>{getServerName()}</PanelDescription>
          </PanelHeader>
          <PanelContent>
            <div className="flex justify-between items-center">
              <span id="progress-message">Message</span>
              <P>{progress}%</P>
            </div>
            <Progress value={parseInt(progress)} />
            <Separator />
            <details id="progress-details">
              <summary>Event log</summary>
              <div id="progress-log" className="space-y-2">
                {/* Progress log content */}
              </div>
            </details>
            <Accordion type="single" collapsible className="transition">
              <AccordionItem value="event-log">
                <AccordionTrigger>Event log</AccordionTrigger>
                <AccordionContent></AccordionContent>
              </AccordionItem>
            </Accordion>
          </PanelContent>
        </Panel>
        <EinfraFooter className="flex-none"></EinfraFooter>
      </div>
    </>
  );
};

export default SpawnPending;
{
  /* old
  <div className="row justify-content-center">
  <div className="col-md-8">
    <details id="progress-details">
      <summary>Event log</summary>
      <div id="progress-log"></div>
    </details>
  </div>
</div>; */
}
