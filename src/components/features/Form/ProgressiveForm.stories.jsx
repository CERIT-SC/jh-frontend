import { ProgressiveForm } from "./ProgressiveForm";
import React from "react";

export default {
  title: "Example/ProgressiveForm",
  component: ProgressiveForm,
  decorators: [
    (Story) => (
      <div style={{ border: "1px solid #ccc", width: "400px", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
        ProgressiveForm is a multi-step form component that allows users to fill out forms in progressive steps.

        ### Features:
        - Supports dynamic step-based navigation.
        - Allows custom form submission handlers.

        ### Props:
        - **steps**: An array of React components representing each step.
        - **submitForm**: A callback function triggered on form submission.
      `,
      },
    },
  },
};

export const Form = {
    args: {
        steps: [<></>, <></>, <></>],
        submitForm: () => {}
    },
};
