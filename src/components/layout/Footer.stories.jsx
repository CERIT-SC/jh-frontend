import { Footer } from "./Footer";
import React from "react";

export default {
  title: "Example/Footer",
  component: Footer,
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

export const Default = {};

export const DarkMode = {
  decorators: [
    (Story) => (
      <div className="dark w-full max-w-7xl">
        <Story />
      </div>
    ),
  ],
};
