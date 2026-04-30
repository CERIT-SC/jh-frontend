import type { Meta, StoryObj } from "@storybook/react";
import { InfoBox } from "./InfoBox";
import type { InfoBoxProps } from "./InfoBox";
import { HelpCircle, Settings, BookOpen } from "lucide-react";

const meta: Meta<typeof InfoBox> = {
  title: "UI/InfoBox",
  component: InfoBox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A tooltip/popover hybrid that displays contextual information triggered by an icon.
The content panel stays visible while the cursor hovers over either the trigger icon
or the panel itself, and smoothly animates out when the cursor leaves both.

### Features
- **Hover persistence**: Content stays open while hovering trigger or content
- **Keyboard navigation**: Enter/Space to toggle, Escape to close
- **Focus management**: Proper ARIA attributes and focus return on close
- **Smooth animations**: Configurable enter/exit transitions
- **Customizable**: Custom trigger icons, positions, alignment, and max width
- **Accessible**: WCAG 2.1 AA compliant with ARIA roles and keyboard support
- **Reduced motion**: Respects \`prefers-reduced-motion\` media query
        `,
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Position of the content panel relative to the trigger",
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Alignment of the content panel along the cross-axis",
    },
    maxWidth: {
      control: "number",
      description: "Maximum width of the content panel in pixels",
    },
    animationDuration: {
      control: "number",
      description: "Duration of enter/exit animations in milliseconds",
    },
    closeDelay: {
      control: "number",
      description: "Grace period before closing after cursor leaves (ms)",
    },
    disabled: {
      control: "boolean",
      description: "Disables the InfoBox interaction entirely",
    },
    triggerAriaLabel: {
      control: "text",
      description: "Accessible label for the trigger button",
    },
  },
  args: {
    position: "top",
    align: "center",
    maxWidth: 320,
    animationDuration: 200,
    closeDelay: 150,
    disabled: false,
    triggerAriaLabel: "More information",
  },
};

export default meta;
type Story = StoryObj<typeof InfoBox>;

/* ── Basic Stories ───────────────────────────── */

export const Default: Story = {
  name: "Default (Simple Text)",
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This is a simple informational message displayed in the InfoBox.</p>
    </InfoBox>
  ),
};

export const WithDocumentationLink: Story = {
  name: "With Documentation Link",
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p className="mb-2">
        Select the Docker image for your notebook server. Custom images may take
        longer to pull on first launch.
      </p>
      <a
        href="https://docs.cerit.io/en/docs/web-apps/jupyterhub"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary-700 transition-colors"
      >
        See available images →
      </a>
    </InfoBox>
  ),
};

export const RichContent: Story = {
  name: "Rich Content (Multiple Elements)",
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p className="font-semibold text-text-heading mb-1">GPU Resources</p>
      <p className="mb-2">
        Each GPU type has a limited number of available units. Green squares
        indicate free GPUs; red squares indicate GPUs currently in use.
      </p>
      <ul className="list-disc list-inside space-y-0.5 mb-2 text-text-muted">
        <li>A100 — 8 total</li>
        <li>V100 — 4 total</li>
        <li>RTX 4090 — 2 total</li>
      </ul>
      <a
        href="https://docs.cerit.io/en/docs/computing/gpu"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary-700 transition-colors"
      >
        GPU documentation →
      </a>
    </InfoBox>
  ),
};

/* ── Position Variants ───────────────────────── */

export const PositionTop: Story = {
  name: "Position: Top",
  args: { position: "top" },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This InfoBox appears above the trigger icon.</p>
    </InfoBox>
  ),
};

export const PositionBottom: Story = {
  name: "Position: Bottom",
  args: { position: "bottom" },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This InfoBox appears below the trigger icon.</p>
    </InfoBox>
  ),
};

export const PositionLeft: Story = {
  name: "Position: Left",
  args: { position: "left" },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This InfoBox appears to the left of the trigger icon.</p>
    </InfoBox>
  ),
};

export const PositionRight: Story = {
  name: "Position: Right",
  args: { position: "right" },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This InfoBox appears to the right of the trigger icon.</p>
    </InfoBox>
  ),
};

/* ── Alignment Variants ──────────────────────── */

export const AlignStart: Story = {
  name: "Align: Start",
  args: { position: "top", align: "start" },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This InfoBox is aligned to the start edge of the trigger.</p>
    </InfoBox>
  ),
};

export const AlignEnd: Story = {
  name: "Align: End",
  args: { position: "top", align: "end" },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This InfoBox is aligned to the end edge of the trigger.</p>
    </InfoBox>
  ),
};

/* ── Custom Trigger Icon ─────────────────────── */

export const CustomHelpIcon: Story = {
  name: "Custom Trigger: Help Circle",
  render: (args: InfoBoxProps) => (
    <InfoBox
      {...args}
      triggerIcon={<HelpCircle className="h-4 w-4" />}
      triggerAriaLabel="Help"
    >
      <p>Need help? Check the documentation for detailed instructions.</p>
    </InfoBox>
  ),
};

export const CustomSettingsIcon: Story = {
  name: "Custom Trigger: Settings",
  render: (args: InfoBoxProps) => (
    <InfoBox
      {...args}
      triggerIcon={<Settings className="h-4 w-4" />}
      triggerAriaLabel="Settings info"
    >
      <p>Configure your server settings in the resource section below.</p>
    </InfoBox>
  ),
};

export const CustomBookIcon: Story = {
  name: "Custom Trigger: Book Open",
  render: (args: InfoBoxProps) => (
    <InfoBox
      {...args}
      triggerIcon={<BookOpen className="h-4 w-4" />}
      triggerAriaLabel="Documentation"
    >
      <p className="mb-2">
        Refer to the user guide for advanced configuration.
      </p>
      <a
        href="https://docs.cerit.io"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary-700 transition-colors"
      >
        User Guide →
      </a>
    </InfoBox>
  ),
};

/* ── Sizing & Animation ──────────────────────── */

export const WideContent: Story = {
  name: "Wide Content (maxWidth: 480)",
  args: { maxWidth: 480 },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>
        This InfoBox has a wider content area to accommodate longer descriptions
        or more complex layouts without wrapping awkwardly.
      </p>
    </InfoBox>
  ),
};

export const SlowAnimation: Story = {
  name: "Slow Animation (500ms)",
  args: { animationDuration: 500 },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>This InfoBox uses a slower 500ms animation for demonstration.</p>
    </InfoBox>
  ),
};

export const NoCloseDelay: Story = {
  name: "No Close Delay (0ms)",
  args: { closeDelay: 0 },
  render: (args: InfoBoxProps) => (
    <InfoBox {...args}>
      <p>
        This InfoBox closes immediately when the cursor leaves, with no grace
        period.
      </p>
    </InfoBox>
  ),
};

/* ── Disabled State ──────────────────────────── */

export const Disabled: Story = {
  name: "Disabled",
  args: { disabled: true },
  render: (args: InfoBoxProps) => (
    <div className="flex items-center gap-2">
      <InfoBox {...args}>
        <p>This InfoBox is disabled and cannot be interacted with.</p>
      </InfoBox>
      <span className="text-sm text-text-muted">(disabled)</span>
    </div>
  ),
};

/* ── Integration Example ─────────────────────── */

export const FieldHeaderIntegration: Story = {
  name: "Integration: Field Header",
  render: (args: InfoBoxProps) => (
    <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
      <span className="text-base font-semibold text-text-heading">
        Docker Image
      </span>
      <InfoBox {...args} position="top" align="start">
        <p className="mb-2">
          Choose a pre-configured Docker image for your JupyterHub notebook
          server. Each image comes with a specific set of pre-installed
          packages.
        </p>
        <a
          href="https://docs.cerit.io/en/docs/web-apps/jupyterhub/images"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary-700 transition-colors"
        >
          Browse all images →
        </a>
      </InfoBox>
    </div>
  ),
};

export const MultipleInfoBoxes: Story = {
  name: "Integration: Multiple InfoBoxes",
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-surface rounded-lg border border-border max-w-md">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-heading min-w-[100px]">
          Image
        </span>
        <InfoBox position="top" align="start">
          <p>Select the Docker image for your notebook server.</p>
        </InfoBox>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-heading min-w-[100px]">
          Resources
        </span>
        <InfoBox position="top" align="start">
          <p className="mb-2">
            Configure CPU, memory, and GPU resources for your server.
          </p>
          <a
            href="https://docs.cerit.io/en/docs/computing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-700 transition-colors"
          >
            Resource guide →
          </a>
        </InfoBox>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-heading min-w-[100px]">
          Storage
        </span>
        <InfoBox
          position="top"
          align="start"
          triggerIcon={<HelpCircle className="h-4 w-4" />}
          triggerAriaLabel="Storage help"
        >
          <p>
            Your home directory is persistent across sessions. Additional
            volumes can be mounted if needed.
          </p>
        </InfoBox>
      </div>
    </div>
  ),
};
