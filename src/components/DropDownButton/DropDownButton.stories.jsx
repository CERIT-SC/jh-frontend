import { DropDownButton, DropDownOption } from "./DropDownButton";
import React from "react";

export default {
  title: "Example/DropDownButton",
  component: DropDownButton,
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
    title: "Primary Drop Down",
    children: <DropDownOption title={"option"}></DropDownOption>,
  },
};

export const InputDropdown = {
  args: {
    title: "Input Drop Down",
    children: <input></input>,
  },
};

export const infoDropdown = {
  args: {
    title: "Info Drop Down",
    infoText:
      "Provide image name in format repo/image_name:tag or repo/image_name. No tag will be interpreted as latest.",
    children: <DropDownOption title={"option"}></DropDownOption>
  },
};

export const Secondary = {
  args: {
    title: "Secondary Drop Down",
    primary: false,
    children: <DropDownOption title={"option"}></DropDownOption>
  },
};
