import React from "react";
import LoginPage from "./LoginPage";
import AnouncmentMessage from "../../src/components/AnouncmentMessage/AnouncmentMessage";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "./index.css";
import bio_logo from "../custom-images/bioconductor_logo.svg"

const root = createRoot(document.getElementById("root"));
root.render(
  <div>
    {/*<AnouncmentMessage style="warning">*/}
    {/*  <h2> Scheduled maintenance and reboot on 16th - 18th Dec 2024 </h2>*/}
    {/*  <p>*/}
    {/*    {" "}*/}
    {/*    We will have scheduled maintenance and cluster reboot between 16th and*/}
    {/*    17th of December 2024. All running notebooks will be interrupted and*/}
    {/*    have to be started again.{" "}*/}
    {/*  </p>*/}
    {/*</AnouncmentMessage>*/}
    <LoginPage
      buttonText="Sign in with MUNI"
      imagePath={bio_logo}
      link="/hub/oauth_login?next="
    />
  </div>,
);
