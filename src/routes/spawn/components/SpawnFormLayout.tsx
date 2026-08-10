/**
 * @fileoverview Page chrome for the spawn form.
 *
 * Wraps the header, announcement banner, alert stack, page heading, and
 * footer so FormPage.tsx can stay focused on form composition.
 */

import type React from "react";
import { JupyterHubHeader, Footer } from "@components/layout";
import { Alert, Announcement } from "@components/ui";
import { Content, ContentBody, ContentHeading } from "@e-infra/design-system";
import type { AlertItem } from "@components/ui/Alert/Alert";

interface SpawnFormLayoutProps {
  /** Authenticated user's name (rendered in header). */
  userName: string;
  /** Optional announcement banner message. */
  announcement?: string;
  /** Server name from URL, or null for "new server" flow. */
  serverName: string | null;
  /** Active alerts to display. */
  alerts: AlertItem[];
  /** Called when the user dismisses an alert. */
  onRemoveAlert: (id: string) => void;
  /** Page body (the form sections + overview). */
  children: React.ReactNode;
}

function SpawnFormLayout({
  userName,
  announcement,
  serverName,
  alerts,
  onRemoveAlert,
  children,
}: SpawnFormLayoutProps) {
  return (
    <div className="">
      <JupyterHubHeader userName={userName} />
      <Alert alerts={alerts} onRemove={onRemoveAlert} />
      {announcement && (
        <Announcement
          className="mx-auto mt-6 lg:container"
          message={announcement}
          variant="warning"
        />
      )}
      <Content className="py-8 px-4 lg:container">
        <ContentHeading className="max-w-full">
          {serverName ? (
            <span className="truncate inline-block max-w-full">
              Configure: {serverName}
            </span>
          ) : (
            "Start a new server"
          )}
        </ContentHeading>
        <ContentBody>{children}</ContentBody>
      </Content>
      <Footer />
    </div>
  );
}

export default SpawnFormLayout;
