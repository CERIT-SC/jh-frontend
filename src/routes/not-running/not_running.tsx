import React from "react";
import NotRunning from "./NotRunning";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "../../styles/index.css";
import { ThemeProvider } from "@components/layout";

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider defaultTheme="system">
    <NotRunning />
  </ThemeProvider>,
);
