import { ServerCard, ServerCardInline, ServerCardCompact } from "./ServerCard";
import React from "react";

export default {
  title: "Components/ServerCard",
  component: ServerCard,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "inline", "compact"],
      description: "Visual variant of the card",
    },
    isActive: {
      control: "boolean",
      description: "Whether the server is running",
    },
    isReady: {
      control: "boolean",
      description: "Whether the server is fully ready",
    },
    progress: {
      control: "range",
      min: 0,
      max: 100,
      step: 5,
      description: "Spawn progress percentage (0-100)",
    },
    title: {
      control: "text",
      description: "Server name",
    },
    description: {
      control: "text",
      description: "Server description",
    },
    lastActivity: {
      control: "date",
      description: "Last activity timestamp",
    },
  },
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

// Default args for server cards
const defaultArgs = {
  title: "My Jupyter Server",
  description: "Python 3.11 with CUDA support",
  isActive: true,
  isReady: false,
  progress: 45,
  lastActivity: Date.now() - 3600000, // 1 hour ago
  handleOpen: () => alert("Open clicked"),
  handleStop: () => alert("Stop clicked"),
  handleDelete: () => alert("Delete clicked"),
  handleStart: () => alert("Start clicked"),
  handleQuickStart: () => alert("Quick Start clicked"),
};

// Default Variant Story
export const Default = {
  name: "Default Variant",
  args: { ...defaultArgs },
  render: (args) => <ServerCard {...args} />,
};

// Inline Variant Story
export const Inline = {
  name: "Inline Variant",
  args: { ...defaultArgs, progress: 60 },
  render: (args) => <ServerCardInline {...args} />,
};

// Compact Variant Story
export const Compact = {
  name: "Compact Variant",
  args: { ...defaultArgs, progress: 75 },
  render: (args) => <ServerCardCompact {...args} />,
};
