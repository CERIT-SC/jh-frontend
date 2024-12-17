import { InfoBox } from "./InfoBox";

export default {
  title: "Example/InfoBox",
  component: InfoBox,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    backgroundColor: { control: "color" },
  },
};

export const Primary = {
  args: {
    infoText: "Info Text",
  },
};
