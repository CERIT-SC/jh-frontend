import React from "react";
import LoginPage from "./LoginPage";
import WarningMassage from "./components/AnouncmentMessage/AnouncmentMessage";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "./index.css";

const root = createRoot(document.getElementById("root"));
console.log(root);
root.render(
  <div>
    <WarningMassage style="warning">
      <h2> Scheduled maintenance and reboot on 16th - 18th Dec 2024 </h2>
      <p>
        {" "}
        We will have scheduled maintenance and cluster reboot between 16th and
        17th of December 2024. All running notebooks will be interrupted and
        have to be started again.{" "}
      </p>
    </WarningMassage>
    <LoginPage
      buttonText="Sign in via unified login e-INFRA CZ AAI"
      imagePath="/static/custom-images/logo-einfra_barvy.svg"
      link="/hub/oauth_login?next=%2Fhub%2F"
    />
  </div>,
);
