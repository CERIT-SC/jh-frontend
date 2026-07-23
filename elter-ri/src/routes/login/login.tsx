import React from "react";
import LoginPage from "./LoginPage";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "../../styles/index.css";
import { ThemeProvider } from "@components/layout";

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider defaultTheme="system">
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
        buttonText="Sign in via unified eLTER AAI login"
        link="/hub/oauth_login?next=%2Fhub%2F"
        description="It is necessary to be a valid member of eLTER group to access the service. If you are not a member, you will be automatically presented an application upon login. The application will be reviewed by eLTER heads."
        memberLinkText="eLTER"
        memberLinkHref="https://elter-ri.eu"
        docsLinkText="Documentation"
        docsLinkHref="https://docs.cerit.io/en/docs/web-apps/jupyterhub"
        logoLightSrc="/static/custom-images/elter_logo.svg"
        logoDarkSrc="/static/custom-images/elter_logo.svg"
      />
    </div>
  </ThemeProvider>,
);
