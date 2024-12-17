import { TileSelector } from "./TileSelector";

export default {
  title: "Example/TileSelector",
  component: TileSelector,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    backgroundColor: { control: "color" },
  },
};

export const Primary = {
  args: {
    title: "Select your lucky number",
    numberOptions: [1, 2, 3, 6, 8, 99, 0, 67],
  },
};
