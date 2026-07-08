import { Button } from "./Button";
import React from "react";

export default {
  title: "Example/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "error",
        "outline",
        "secondary",
        "ghost",
        "link",
        "tertiary",
        "info",
        "success",
        "warning",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    title: {
      control: "text",
    },
    link: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
  },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};

export const Default = {
  args: {
    variant: "default",
    size: "default",
    title: "Default Button",
  },
};

export const Secondary = {
  args: {
    variant: "secondary",
    size: "default",
    title: "Secondary Button",
  },
};

export const Tertiary = {
  args: {
    variant: "tertiary",
    size: "default",
    title: "Tertiary Button",
  },
};

export const Outline = {
  args: {
    variant: "outline",
    size: "default",
    title: "Outline Button",
  },
};

export const Ghost = {
  args: {
    variant: "ghost",
    size: "default",
    title: "Ghost Button",
  },
};

export const Link = {
  args: {
    variant: "link",
    size: "default",
    title: "Link Button",
  },
};

export const Error = {
  args: {
    variant: "error",
    size: "default",
    title: "Error Button",
  },
};

export const Info = {
  args: {
    variant: "info",
    size: "default",
    title: "Info Button",
  },
};

export const Success = {
  args: {
    variant: "success",
    size: "default",
    title: "Success Button",
  },
};

export const Warning = {
  args: {
    variant: "warning",
    size: "default",
    title: "Warning Button",
  },
};

export const Small = {
  args: {
    variant: "default",
    size: "sm",
    title: "Small Button",
  },
};

export const Large = {
  args: {
    variant: "default",
    size: "lg",
    title: "Large Button",
  },
};

export const Icon = {
  args: {
    variant: "default",
    size: "icon",
    title: "🔍",
  },
};

export const Disabled = {
  args: {
    variant: "default",
    size: "default",
    title: "Disabled Button",
    disabled: true,
  },
};

export const WithLink = {
  args: {
    variant: "default",
    size: "default",
    title: "Navigate Button",
    link: "/hub/spawn",
  },
};

export const AllVariants = {
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <Button {...args} variant="default" title="Default" />
      <Button {...args} variant="secondary" title="Secondary" />
      <Button {...args} variant="tertiary" title="Tertiary" />
      <Button {...args} variant="outline" title="Outline" />
      <Button {...args} variant="ghost" title="Ghost" />
      <Button {...args} variant="link" title="Link" />
      <Button {...args} variant="error" title="Error" />
      <Button {...args} variant="info" title="Info" />
      <Button {...args} variant="success" title="Success" />
      <Button {...args} variant="warning" title="Warning" />
    </div>
  ),
  args: {
    size: "default",
  },
};

export const AllSizes = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} size="sm" title="Small" />
      <Button {...args} size="default" title="Default" />
      <Button {...args} size="lg" title="Large" />
      <Button {...args} size="icon" title="🔍" />
    </div>
  ),
  args: {
    variant: "default",
  },
};
