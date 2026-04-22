import {
  ServerCard,
  ServerCardInline,
  ServerCardCompact,
  EmptyServerCard,
} from "./ServerCard";
import React from "react";
import { H3, P } from "@e-infra/design-system";

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
  lastActivity: Date.now() - 3600000, // 1 hour ago
  handleOpen: () => alert("Open clicked"),
  handleStop: () => alert("Stop clicked"),
  handleDelete: () => alert("Delete clicked"),
  handleStart: () => alert("Start clicked"),
};

// ServerCard Stories
export const Default = {
  args: defaultArgs,
};

export const Inactive = {
  args: {
    ...defaultArgs,
    isActive: false,
  },
};

export const Inline = {
  render: () => <ServerCardInline {...defaultArgs} />,
};

export const Compact = {
  render: () => <ServerCardCompact {...defaultArgs} />,
};

export const CompactInactive = {
  render: () => <ServerCardCompact {...defaultArgs} isActive={false} />,
};

// EmptyServerCard Stories
export const EmptyDefault = {
  name: "Empty (Default)",
  args: {
    handleAdd: () => alert("Add clicked"),
    label: "Add Server",
    variant: "default",
  },
  render: (args) => <EmptyServerCard {...args} />,
};

export const EmptyInline = {
  name: "Empty (Inline)",
  args: {
    handleAdd: () => alert("Add clicked"),
    label: "Add New Server",
    variant: "inline",
  },
  render: (args) => <EmptyServerCard {...args} />,
};

export const EmptyCompact = {
  name: "Empty (Compact)",
  args: {
    handleAdd: () => alert("Add clicked"),
    label: "+ Add New Server",
    variant: "compact",
  },
  render: (args) => <EmptyServerCard {...args} />,
};

// All Variants Overview
export const AllVariants = {
  name: "All Variants Overview",
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <H3 className="mb-3">ServerCard Variants</H3>
        <div className="flex flex-col gap-4">
          <div>
            <P className="mb-2">Default</P>
            <ServerCard {...defaultArgs} />
          </div>
          <div>
            <P className="mb-2">Inline</P>
            <ServerCardInline {...defaultArgs} />
          </div>
          <div>
            <P className="mb-2">Compact</P>
            <ServerCardCompact {...defaultArgs} />
          </div>
        </div>
      </div>

      <div>
        <H3 className="mb-3">EmptyServerCard Variants</H3>
        <div className="flex flex-col gap-4">
          <div>
            <P className="mb-2">Default</P>
            <EmptyServerCard handleAdd={() => alert("Add")} variant="default" />
          </div>
          <div>
            <P className="mb-2">Inline</P>
            <EmptyServerCard handleAdd={() => alert("Add")} variant="inline" />
          </div>
          <div>
            <P className="mb-2">Compact</P>
            <EmptyServerCard handleAdd={() => alert("Add")} variant="compact" />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Grid Layout Example
export const GridLayout = {
  name: "Grid Layout Example",
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <ServerCard {...defaultArgs} title="Server 1" />
      <ServerCard {...defaultArgs} title="Server 2" isActive={false} />
      <ServerCard {...defaultArgs} title="Server 3" />
      <EmptyServerCard handleAdd={() => alert("Add")} variant="default" />
    </div>
  ),
};

// List Layout Example
export const ListLayout = {
  name: "List Layout Example",
  render: () => (
    <div className="flex flex-col gap-2">
      <ServerCardInline {...defaultArgs} title="Production Server" />
      <ServerCardInline {...defaultArgs} title="Dev Server" isActive={false} />
      <ServerCardInline {...defaultArgs} title="Test Server" />
      <EmptyServerCard handleAdd={() => alert("Add")} variant="inline" />
    </div>
  ),
};
