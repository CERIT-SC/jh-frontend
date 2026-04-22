import React from "react";
import FormPage from "./FormPage";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "../../styles/index.css";
import { ThemeProvider } from "@components/layout";
import devMode from "../../dev-setup";

const root = createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider defaultTheme="system">
    <FormPage />
  </ThemeProvider>,
);
