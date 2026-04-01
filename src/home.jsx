import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "./styles/index.css";
import HomePage from "./pages/HomePage";

const root = createRoot(document.getElementById("root"));
root.render(<HomePage />);
