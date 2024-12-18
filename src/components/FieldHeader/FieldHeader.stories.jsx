import {FieldHeader} from "./FieldHeader";
import React from "react";

export default {
  title: "Example/FieldHeader",
  component: FieldHeader,
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

export const NoInfoText = {
  args: {
    title: "No Info Text",
    children : <> i am the only one </>
  },
};

export const WithInfoText = {
    args: {
        title: "No Info Text",
        infoText: "i am hidden",
        children : <> i am the only one </>
    },
};