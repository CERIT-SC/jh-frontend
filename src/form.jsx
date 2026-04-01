import React from "react";
import FormPage from "./pages/FormPage";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "./styles/index.css";
import devMode from "./dev-setup";

const root = createRoot(document.getElementById("root"));

root.render(<FormPage />);
