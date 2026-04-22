import JupyterHubHeader from "./JupyterHubHeader";
import React from "react";

export default {
  title: "Example/JupyterHubHeader",
  component: JupyterHubHeader,
  decorators: [
    (Story) => (
      <div style={{ border: "1px solid #ccc", width: "100vw" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export const Header = {
    args: {
        userName: "Marvin"
    },
};
