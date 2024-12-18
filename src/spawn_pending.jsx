import React from "react";
import SpawnPending from "./SpawnPending";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(<SpawnPending />);
