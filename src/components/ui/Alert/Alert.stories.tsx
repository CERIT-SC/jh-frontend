import type { Meta, StoryObj } from "@storybook/react";
import { Alert, type AlertItem } from "./Alert";

// ── Mock Data Helpers ────────────────────────────────────────────────────

const mockAlerts: AlertItem[] = [
  {
    id: "alert-1",
    message: "This is a default alert message",
    variant: "default",
  },
  {
    id: "alert-2",
    message: "Operation completed successfully!",
    variant: "success",
  },
  {
    id: "alert-3",
    message: "This is a warning message. Please review carefully.",
    variant: "warning",
  },
  {
    id: "alert-4",
    message: "An error occurred. Please try again.",
    variant: "error",
  },
];

function createMockAlert(
  id: string,
  message: string,
  variant: AlertItem["variant"] = "default",
  autoDismiss?: boolean,
  duration?: number,
): AlertItem {
  return {
    id,
    message,
    variant,
    autoDismiss,
    duration,
  };
}

// ── Main Meta ─────────────────────────────────────────────────────────────

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Alert components for displaying toast-style notifications in the JupyterHub interface.

## Components

### Alert
A container component that renders a stack of alert notifications positioned at the top-center of the viewport.

**Features:**
- Fixed positioning at top-center of screen
- Supports multiple alerts stacked vertically
- Pointer events disabled on container, enabled on individual alerts
- Responsive width with max-width constraint

### AlertCard (Internal)
Individual alert card with animation and auto-dismiss functionality.

**Features:**
- Enter/exit animations with CSS transitions
- Auto-dismiss with configurable duration (default: 5000ms)
- Click or keyboard (Enter/Space) to dismiss
- Visual variants: default, success, warning, error
- Icon indicators for error, success, and warning variants

## Variants

- **default**: Neutral styling for general information
- **success**: Green styling with checkmark icon for successful operations
- **warning**: Yellow/amber styling with alert triangle for warnings
- **error**: Red styling with X icon for errors

## Usage

\`\`\`tsx
import { Alert } from './components/ui/Alert';
import { useAlerts } from './hooks/useAlerts';

function App() {
  const { alerts, removeAlert } = useAlerts();
  
  return <Alert alerts={alerts} onRemove={removeAlert} />;
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    alerts: {
      control: false,
      description: "Array of alert items to display",
    },
    onRemove: {
      control: false,
      description: "Callback fired when an alert is dismissed",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Alert>;

// ── Alert Stories ────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Single Default Alert",
  args: {
    alerts: [createMockAlert("alert-1", "This is a default alert message")],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const Success: Story = {
  name: "Single Success Alert",
  args: {
    alerts: [
      createMockAlert(
        "alert-success",
        "Operation completed successfully!",
        "success",
      ),
    ],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const Warning: Story = {
  name: "Single Warning Alert",
  args: {
    alerts: [
      createMockAlert(
        "alert-warning",
        "This is a warning message. Please review carefully.",
        "warning",
      ),
    ],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const Error: Story = {
  name: "Single Error Alert",
  args: {
    alerts: [
      createMockAlert(
        "alert-error",
        "An error occurred. Please try again.",
        "error",
      ),
    ],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const AllVariants: Story = {
  name: "All Variants Stacked",
  args: {
    alerts: mockAlerts,
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const AutoDismiss: Story = {
  name: "Auto-Dismiss Alert (3 seconds)",
  args: {
    alerts: [
      createMockAlert(
        "alert-auto",
        "This alert will auto-dismiss in 3 seconds",
        "success",
        true,
        3000,
      ),
    ],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const LongMessage: Story = {
  name: "Alert with Long Message",
  args: {
    alerts: [
      createMockAlert(
        "alert-long",
        "This is a much longer alert message that demonstrates how the Alert component handles extended content. The message should wrap properly and remain readable within the alert container.",
        "default",
      ),
    ],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const Empty: Story = {
  name: "Empty State (No Alerts)",
  args: {
    alerts: [],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const MultipleErrors: Story = {
  name: "Multiple Error Alerts",
  args: {
    alerts: [
      createMockAlert("error-1", "Database connection failed", "error"),
      createMockAlert("error-2", "Authentication timeout", "error"),
      createMockAlert("error-3", "Network unreachable", "error"),
    ],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

export const MixedStack: Story = {
  name: "Mixed Alert Stack",
  args: {
    alerts: [
      createMockAlert("alert-1", "Server starting...", "default"),
      createMockAlert("alert-2", "Image pulled successfully", "success"),
      createMockAlert("alert-3", "High memory usage detected", "warning"),
      createMockAlert("alert-4", "Failed to connect to GPU", "error"),
    ],
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};
