import React from "react";
import LoginPage from "../LoginPage";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "../index.css";

const root = createRoot(document.getElementById("root"));
console.log(root);
root.render(
  <LoginPage
    buttonText="Sign in via unified login e-INFRA CZ AAI"
    infoText="Login"
    imagePath="logo-einfra_barvy.svg"
  />,
);
