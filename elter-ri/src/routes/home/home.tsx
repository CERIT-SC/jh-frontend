import React from "react";
import { createRoot } from "react-dom/client";
import "../../styles/index.css";
import { ThemeProvider } from "@components/layout";
import HomePage from "./HomePage";

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider defaultTheme="system">
    <HomePage />
  </ThemeProvider>,
);
