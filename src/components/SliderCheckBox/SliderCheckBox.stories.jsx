import { SliderCheckBox } from "./SliderCheckBox";
import React from "react";

export default {
  title: "Example/SliderCheckBox",
  component: SliderCheckBox,
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

export const WithChildren = {
    args: {
        title: "I have Children",
        onChange: () => {},
        children: "I am his child"
    },
};

export const WithoutChildren = {
    args: {
        title: "I have no Children",
        onChange: () => {},
    },
};
