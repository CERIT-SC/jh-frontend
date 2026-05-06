import type { Meta, StoryObj } from "@storybook/react";
import { GPUStatusIndicator, GPUSquare } from "./GPUStatusIndicator";

const meta: Meta<typeof GPUStatusIndicator> = {
  title: "Components/GPUStatusIndicator",
  component: GPUStatusIndicator,
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label for the GPU type (e.g., 'A100', 'V100')",
    },
    free: {
      control: { type: "number", min: 0 },
      description: "Number of free/available GPUs",
    },
    total: {
      control: { type: "number", min: 1 },
      description: "Total number of GPUs",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of each GPU square",
    },
    gap: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Gap between GPU squares",
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A GPU status indicator that displays a labeled row of colored squares representing
individual GPU status for a single GPU type.

Each square represents one physical GPU:
- **Green** (success) for free/available GPUs
- **Red** (error) for used/busy GPUs
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GPUStatusIndicator>;

export const Default: Story = {
  args: {
    label: "A100",
    free: 2,
    total: 4,
  },
};

export const SmallSize: Story = {
  args: {
    label: "A100",
    free: 2,
    total: 4,
    size: "sm",
    gap: "sm",
  },
};

export const LargeSize: Story = {
  args: {
    label: "A100",
    free: 2,
    total: 4,
    size: "lg",
    gap: "lg",
  },
};

// Legend Example
export const Legend: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <GPUSquare status="free" size="sm" />
        <span className="text-sm text-text-muted">Free</span>
      </div>
      <div className="flex items-center gap-2">
        <GPUSquare status="used" size="sm" />
        <span className="text-sm text-text-muted">Used</span>
      </div>
    </div>
  ),
};
