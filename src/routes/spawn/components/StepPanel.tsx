/**
 * @fileoverview Reusable step panel for the spawn form.
 *
 * Replaces three near-identical Panel blocks in the original FormPage.tsx.
 * Adding a new step is now a one-liner instead of copying ~45 lines of JSX.
 */

import type React from "react";
import { CircleQuestionMark } from "lucide-react";
import { Button, Separator } from "@e-infra/design-system";
import {
  Panel,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@components/ui";

interface StepPanelProps {
  /** DOM id for anchor navigation (e.g. "image-section"). */
  id: string;
  /** 1-based step number shown in the title. */
  stepNumber: number;
  /** Title text after "Step N: ". */
  title: string;
  /** Optional description rendered below the title. */
  description?: string;
  /** Documentation URL opened by the help button. */
  helpUrl: string;
  /** Panel body. */
  children: React.ReactNode;
}

function StepPanel({
  id,
  stepNumber,
  title,
  description,
  helpUrl,
  children,
}: StepPanelProps) {
  const openHelp = () => window.open(helpUrl, "_blank");

  // Two title layout variants: with description uses top padding + margin,
  // without description uses uniform padding (preserves original styling).
  const titleClassName = description
    ? "mb-2 px-6 pt-6 text-2xl"
    : "p-6 text-2xl";

  return (
    <Panel id={id} className="scroll-mt-20 p-0 bg-background relative">
      <Button
        variant="ghost"
        size="icon-lg"
        className="absolute top-4 right-4"
        onClick={openHelp}
      >
        <CircleQuestionMark size={52} />
      </Button>
      <PanelTitle className={titleClassName}>
        Step {stepNumber}: {title}
      </PanelTitle>
      {description && (
        <PanelDescription className="px-6">{description}</PanelDescription>
      )}
      <Separator className={description ? "mt-2" : ""} />
      <PanelContent className="p-6">{children}</PanelContent>
    </Panel>
  );
}

export default StepPanel;
