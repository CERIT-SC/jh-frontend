import { EinfraFooter } from "./EinfraFooter";
import React from "react";

export default {
  title: "Example/EinfraFooter",
  component: EinfraFooter,
  decorators: [
    (Story) => (
      <div className="w-full max-w-7xl border border-border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export const Footer = {};

export const DarkMode = {
  decorators: [
    (Story) => (
      <div className="dark w-full max-w-7xl">
        <Story />
      </div>
    ),
  ],
};
