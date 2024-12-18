import { DropDownMenu } from "./DropDownMenu";
import { gpu_instance } from "../../data/formData";

export default {
  title: "Example/DropDownMenu",
  component: DropDownMenu,
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

export const NoDefault = {
  args: {
    title: "With No Default Option",
    menuOptions: gpu_instance,
    formSelect: () => {},
  },
};

export const WithDefault = {
  args: {
    title: "With Default Option",
    menuOptions: gpu_instance,
    formSelect: () => {},
    defaultOption: ["defaultKey", "Default Value"],
  },
};
