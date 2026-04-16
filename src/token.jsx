import React from "react";
import TokenPage from "./pages/TokenPage";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "./styles/index.css";
import { ThemeProvider } from "./components/ThemeProvider";

const root = createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider defaultTheme="system">
    <div>
      <TokenPage />
    </div>
  </ThemeProvider>,
);
