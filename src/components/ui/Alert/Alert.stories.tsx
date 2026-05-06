import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useCallback } from "react";
import { Alert, type AlertItem } from "./Alert";
import { useAlerts, MAX_VISIBLE_ALERTS } from "@hooks/useAlerts";

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

### AlertCard (Internal)
Individual alert card with animation and auto-dismiss functionality.


## Visible Limit

The \`useAlerts\` hook enforces a maximum of **${MAX_VISIBLE_ALERTS}** visible alerts.
When a new alert is pushed while the limit is reached, the oldest alert is
automatically removed from the state. The \`Alert\` component detects this
removal and plays a smooth exit animation before unmounting the evicted card.

## Variants

- **default**: Neutral styling for general information
- **success**: Green styling with checkmark icon for successful operations
- **warning**: Yellow/amber styling with alert triangle for warnings
- **error**: Red styling with X icon for errors

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

export const AllVariants: Story = {
  name: "All Variants Stacked",
  args: {
    alerts: mockAlerts,
    onRemove: (id) => console.log(`Removed alert: ${id}`),
  },
};

// ── Interactive Limit Demo ────────────────────────────────────────────────

/**
 * Interactive story demonstrating the `MAX_VISIBLE_ALERTS` limit.
 * Click "Push Alert" to add alerts — once the limit of 4 is reached,
 * the oldest alert is automatically evicted with a smooth exit animation.
 */
function AlertLimitDemo() {
  const { alerts, pushAlert, removeAlert } = useAlerts();
  const counterRef = useRef(0);

  const handlePush = useCallback(() => {
    counterRef.current += 1;
    const variants: Array<AlertItem["variant"]> = [
      "error",
      "warning",
      "success",
      "default",
    ];
    pushAlert(`Alert #${counterRef.current} — spam test`, {
      variant: variants[counterRef.current % variants.length],
      autoDismiss: false,
    });
  }, [pushAlert]);

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-end pb-16">
      <Alert alerts={alerts} onRemove={removeAlert} />
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <p className="text-text-muted text-sm text-center">
          Max visible alerts: <strong>{MAX_VISIBLE_ALERTS}</strong> · Current:{" "}
          <strong>{alerts.length}</strong>
        </p>
        <button
          type="button"
          onClick={handlePush}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground cursor-pointer"
        >
          Push Alert
        </button>
      </div>
    </div>
  );
}

export const VisibleLimitDemo: Story = {
  name: `Visible Limit (max ${MAX_VISIBLE_ALERTS}) — Interactive`,
  parameters: {
    docs: {
      description: {
        story: `Demonstrates the automatic eviction of the oldest alert when the visible limit of ${MAX_VISIBLE_ALERTS} is reached. Click "Push Alert" repeatedly to observe the behaviour.`,
      },
    },
  },
  render: () => <AlertLimitDemo />,
};
