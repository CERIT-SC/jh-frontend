import AnouncmentMessage from "./AnouncmentMessage";
import React from "react";

export default {
  title: "Example/Button",
  component: AnouncmentMessage,
  parameters: {
    layout: "centered",
  },
};

export const Primary = {
  args: {
    style: "warning",
    children : ( <div>
        <h2> Scheduled maintenance and reboot on 16th - 18th Dec 2024 </h2>
        <p>
        {" "}
        We will have scheduled maintenance and cluster reboot between 16th and
        17th of December 2024. All running notebooks will be interrupted and
        have to be started again.{" "}
        </p>
    </div>
    )
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
  },
};

export const Secondary = {
  args: {
    title: "Secondary Drop Down",
    primary: false,
  },
};
