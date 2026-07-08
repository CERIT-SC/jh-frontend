import {
  ServerCard,
  ServerCardInline,
  ServerCardCompact,
  EmptyServerCard,
} from "./ServerCard";
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
    cpuUsage: {
      control: "range",
      min: 0,
      max: 100,
      step: 1,
      description:
        "CPU usage percentage (0-100), only visible when active+ready",
    },
    memoryUsed: {
      control: "number",
      description: "Memory usage in bytes, only visible when active+ready",
    },
    memoryLimit: {
      control: "number",
      description: "Memory limit in bytes, only visible when active+ready",
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

// Running with resource usage
const runningArgs = {
  ...defaultArgs,
  isActive: true,
  isReady: true,
  progress: undefined,
  cpuUsage: 35,
  memoryUsed: 2147483648, // 2 GB
  memoryLimit: 4294967296, // 4 GB
};

// Convert cpuUsage from percentage (0-100) to ratio (0-1) for the component
const withCpuRatio = (args) => ({
  ...args,
  cpuUsage: args.cpuUsage !== undefined ? args.cpuUsage / 100 : undefined,
});

// Default Variant Story
export const Default = {
  name: "Default Variant",
  args: { ...defaultArgs },
  render: (args) => <ServerCard {...withCpuRatio(args)} />,
};

// Inline Variant Story
export const Inline = {
  name: "Inline Variant",
  args: { ...defaultArgs, progress: 60 },
  render: (args) => <ServerCardInline {...withCpuRatio(args)} />,
};

// Compact Variant Story
export const Compact = {
  name: "Compact Variant",
  args: { ...defaultArgs, progress: 75 },
  render: (args) => <ServerCardCompact {...withCpuRatio(args)} />,
};

// Default Variant — Running with Resource Usage
export const DefaultWithUsage = {
  name: "Default — Running with Usage",
  args: { ...runningArgs },
  render: (args) => <ServerCard {...withCpuRatio(args)} />,
};

// Inline Variant — Running with Resource Usage
export const InlineWithUsage = {
  name: "Inline — Running with Usage",
  args: { ...runningArgs },
  render: (args) => <ServerCardInline {...withCpuRatio(args)} />,
};

// Compact Variant — Running with Resource Usage
export const CompactWithUsage = {
  name: "Compact — Running with Usage",
  args: { ...runningArgs },
  render: (args) => <ServerCardCompact {...withCpuRatio(args)} />,
};

// High CPU usage
export const HighCpuUsage = {
  name: "High CPU Usage",
  args: {
    ...runningArgs,
    cpuUsage: 92,
    memoryUsed: 3865470566, // ~3.6 GB
    memoryLimit: 4294967296, // 4 GB
  },
  render: (args) => <ServerCard {...withCpuRatio(args)} />,
};

// Low resource usage
export const LowUsage = {
  name: "Low Resource Usage",
  args: {
    ...runningArgs,
    cpuUsage: 0.4,
    memoryUsed: 749543424, // ~715 MB
    memoryLimit: 4294967296, // 4 GB
  },
  render: (args) => <ServerCard {...withCpuRatio(args)} />,
};

// Stopped server — shows last activity, no usage badges
export const Stopped = {
  name: "Stopped Server",
  args: {
    ...defaultArgs,
    isActive: false,
    isReady: false,
    progress: undefined,
    lastActivity: Date.now() - 7200000, // 2 hours ago
  },
  render: (args) => <ServerCard {...withCpuRatio(args)} />,
};

// Empty Server Card variants
export const EmptyDefault = {
  name: "Empty — Default",
  args: {
    onClick: () => alert("Add server clicked"),
  },
  render: (args) => <EmptyServerCard {...args} />,
};

export const EmptyInline = {
  name: "Empty — Inline",
  args: {
    onClick: () => alert("Add server clicked"),
    variant: "inline",
  },
  render: (args) => <EmptyServerCard {...args} />,
};

export const EmptyCompact = {
  name: "Empty — Compact",
  args: {
    onClick: () => alert("Add server clicked"),
    variant: "compact",
  },
  render: (args) => <EmptyServerCard {...args} />,
};
