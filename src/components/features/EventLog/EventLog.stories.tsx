import type { Meta, StoryObj } from "@storybook/react";
import { EventLogList } from "./EventLogList";
import { EventLogItem } from "./EventLogItem";
import { ConnectionStatusIndicator } from "./ConnectionStatusIndicator";
import type { EventLogEntry } from "../../../types/spawnProgress";

// ── Mock Data Helpers ────────────────────────────────────────────────────

function createMockEntry(
  index: number,
  progress: number,
  message: string,
  htmlMessage?: string,
  isFailed?: boolean,
  isReady?: boolean,
): EventLogEntry {
  return {
    id: `event-${index}`,
    index,
    timestamp: Date.now() - (10 - index) * 60000,
    progress,
    message,
    htmlMessage: htmlMessage || null,
    isFailed: isFailed || false,
    isReady: isReady || false,
  };
}

const mockEntries: EventLogEntry[] = [
  createMockEntry(0, 0, "Spawn request received"),
  createMockEntry(1, 10, "Pulling image jupyter/scipy-notebook:latest"),
  createMockEntry(2, 20, "Image pull progress: 25%"),
  createMockEntry(3, 35, "Image pull progress: 50%"),
  createMockEntry(4, 50, "Image pull progress: 75%"),
  createMockEntry(5, 65, "Image pull complete"),
  createMockEntry(6, 70, "Creating container"),
  createMockEntry(7, 80, "Container started"),
  createMockEntry(8, 90, "Initializing server"),
  createMockEntry(9, 100, "Server ready", undefined, false, true),
];

const mockFailedEntries: EventLogEntry[] = [
  createMockEntry(0, 0, "Spawn request received"),
  createMockEntry(1, 10, "Pulling image custom-ml-image:dev"),
  createMockEntry(2, 25, "Image pull progress: 30%"),
  createMockEntry(3, 25, "Error: Image not found", undefined, true, false),
];
// ── Main Meta (EventLogList) ────────────────────────────────────────────

const meta: Meta<typeof EventLogList> = {
  title: "Features/EventLog",
  component: EventLogList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Event Log components for displaying JupyterHub SSE spawn progress events.

## Components

### EventLogList
A virtualized list component for displaying SSE event logs from JupyterHub spawn progress.

### EventLogItem
Renders a single event log entry with timestamp, progress badge, and message.

### ConnectionStatusIndicator
Visual indicator for SSE connection state with reconnection status.

**States:**
- Connected: Green indicator with WiFi icon
- Connecting: Yellow/orange indicator with spinning loader
- Disconnected: Gray indicator with WiFi-off icon
- Error: Red indicator with alert triangle
        `,
      },
    },
  },
  argTypes: {
    entries: {
      control: false,
      description: "Array of event log entries to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EventLogList>;

// ── EventLogList Stories ────────────────────────────────────────────────

export const Default: Story = {
  name: "EventLogList - Default (Spawn Progress)",
  args: {
    entries: mockEntries,
  },
};

export const Empty: Story = {
  name: "EventLogList - Empty State",
  args: {
    entries: [],
  },
};

export const Failed: Story = {
  name: "EventLogList - Failed Spawn",
  args: {
    entries: mockFailedEntries,
  },
};

export const SingleItem: Story = {
  name: "EventLogList - Single Item",
  args: {
    entries: [mockEntries[0]],
  },
};

// ── EventLogItem Stories ────────────────────────────────────────────────

export const ItemDefault: StoryObj<typeof EventLogItem> = {
  name: "EventLogItem - Default",
  render: () => (
    <div className="w-[600px]">
      <EventLogItem entry={mockEntries[3]} />
    </div>
  ),
};

export const ItemReady: StoryObj<typeof EventLogItem> = {
  name: "EventLogItem - Ready State (Success)",
  render: () => (
    <div className="w-[600px]">
      <EventLogItem entry={mockEntries[9]} />
    </div>
  ),
};

export const ItemFailed: StoryObj<typeof EventLogItem> = {
  name: "EventLogItem - Failed State (Error)",
  render: () => (
    <div className="w-[600px]">
      <EventLogItem entry={mockFailedEntries[3]} />
    </div>
  ),
};

export const ItemWithHtmlMessage: StoryObj<typeof EventLogItem> = {
  name: "EventLogItem - With HTML Message",
  render: () => (
    <div className="w-[600px]">
      <EventLogItem
        entry={{
          ...mockEntries[5],
          htmlMessage:
            'Image pull complete. <a href="#" class="text-primary">View image details</a>',
        }}
      />
    </div>
  ),
};

export const ItemLongMessage: StoryObj<typeof EventLogItem> = {
  name: "EventLogItem - Long Message",
  render: () => (
    <div className="w-[600px]">
      <EventLogItem
        entry={{
          ...mockEntries[2],
          message:
            "This is a very long message that should wrap to multiple lines and demonstrate the break-words functionality of the EventLogItem component when dealing with extended log output from the server.",
        }}
      />
    </div>
  ),
};

export const ItemTimestampPrefix: StoryObj<typeof EventLogItem> = {
  name: "EventLogItem - With Timestamp Prefix (Stripped)",
  render: () => (
    <div className="w-[600px]">
      <EventLogItem
        entry={{
          ...mockEntries[1],
          message:
            "2026-04-30T12:00:00Z Pulling image jupyter/base-notebook:latest",
        }}
      />
    </div>
  ),
};

export const ConnectionAllStates: StoryObj = {
  name: "ConnectionStatusIndicator - All States Overview",
  render: () => (
    <div className="flex flex-col gap-4">
      <ConnectionStatusIndicator state="connected" reconnectAttempts={0} />
      <ConnectionStatusIndicator state="connecting" reconnectAttempts={1} />
      <ConnectionStatusIndicator state="disconnected" reconnectAttempts={0} />
      <ConnectionStatusIndicator state="error" reconnectAttempts={5} />
    </div>
  ),
};
