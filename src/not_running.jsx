import React from "react";
import NotRunning from "./NotRunning";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/600.css";
import "./index.css";

const root = createRoot(document.getElementById("root"));
console.log(root);
root.render(<NotRunning />);
