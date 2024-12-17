import { DropDownMenu } from "./DropDownMenu";
import { gpu_instance } from "../data/formData"

export default {
  title: "Example/DropDownMenu",
  component: DropDownMenu,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    backgroundColor: { control: "color" },
  },
};

export const NoDefault = {
  args: {
    title: "With No Default Option",
    menuOptions: gpu_instance
  },
};

export const WithDefault = {
  args: {
    title: "With Default Option",
    menuOptions: gpu_instance,
    defaultOption: gpu_instance[2]
  },
};
