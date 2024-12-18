import AnouncmentMessage from "./AnouncmentMessage";
import React from "react";

export default {
  title: "Example/AnouncmentMessage",
  component: AnouncmentMessage,
  parameters: {
    layout: "centered",
  },
};

export const Warning = {
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

export const New = {
    args: {
      style: "new",
      children : ( <div>
        There are so many new features!!
      </div>
      )
    },
  };
