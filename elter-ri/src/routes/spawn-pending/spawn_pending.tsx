import React from "react";
import SpawnPending from "./SpawnPending";
import { createRoot } from "react-dom/client";
import "../../styles/index.css";
import { ThemeProvider } from "@components/layout";

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider defaultTheme="system">
    <SpawnPending />
  </ThemeProvider>,
);
