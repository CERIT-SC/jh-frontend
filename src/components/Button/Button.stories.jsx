import {Button} from "./Button";
import React from "react";

export default {
  title: "Example/Button",
  component: Button,
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

export const Primary = {
  args: {
    title: "Start",
  },
};

export const Secondary = {
    args: {
      title: "Remove",
      primary: false,
    },
  };

export const Disabled = {
    args: {
      title: "Start",
      disabled: true,
    },
};