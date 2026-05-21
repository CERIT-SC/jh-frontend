import ErrorPage from "./ErrorPage";
import { createRoot } from "react-dom/client";
import "../../styles/index.css";
import { ThemeProvider } from "@components/layout";
import initDev from "../../dev-setup";

// Initialize dev config in development mode
if (import.meta.env.DEV) {
  initDev();
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider defaultTheme="system">
    <ErrorPage />
  </ThemeProvider>,
);
