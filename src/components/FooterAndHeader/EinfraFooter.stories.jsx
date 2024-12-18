import { EinfraFooter } from "./EinfraFooter";
import React from "react";

export default {
  title: "Example/EinfraFooter",
  component: EinfraFooter,
  decorators: [
    (Story) => (
      <div style={{ border: "1px solid #ccc", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export const Footer = {
};
