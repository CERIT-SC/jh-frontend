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
      <LoginPage
        buttonText="Sign in via unified login e-INFRA CZ AAI"
        link="/hub/oauth_login?next=%2Fhub%2F"
      />
    </div>
  </ThemeProvider>,
);
