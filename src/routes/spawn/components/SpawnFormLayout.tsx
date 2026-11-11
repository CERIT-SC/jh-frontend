/**
 * @fileoverview Page chrome for the spawn form.
 *
 * Wraps the header, announcement banner, alert stack, page heading, and
 * footer so FormPage.tsx can stay focused on form composition.
 */

import type React from "react";
import { JupyterHubHeader, Footer } from "@components/layout";
import { Alert, Announcement } from "@components/ui";
import {
  Alert as DSAlert,
  Content,
  ContentBody,
  ContentHeading,
} from "@e-infra/design-system";
import { AlertTriangle } from "lucide-react";
import type { ConfigProblem } from "@src-types/spawnOptions";
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
  /** Persistent schema problems (blocking ones mean Start is disabled). */
  problems?: ConfigProblem[];
  /** Page body (the form sections + overview). */
  children: React.ReactNode;
}

function SpawnFormLayout({
  userName,
  announcement,
  serverName,
  alerts,
  onRemoveAlert,
  problems,
  children,
}: SpawnFormLayoutProps) {
  return (
    <div className="">
      <JupyterHubHeader userName={userName} />
      <Alert alerts={alerts} onRemove={onRemoveAlert} />
      {announcement && (
        <Announcement
          className="mx-auto w-full max-w-7xl space-y-8 md:px-6 lg:px-8 xl:px-10 pt-4 px-2 lg:container"
          message={announcement}
          variant="warning"
        />
      )}
      {problems && problems.length > 0 && (
        <div className="mx-auto w-full max-w-7xl px-2 pt-4 lg:container md:px-6 lg:px-8 xl:px-10">
          {problems.map((problem, index) => (
            <DSAlert
              key={`${index}-${problem.message}`}
              variant={problem.blocking ? "error" : "warning"}
              className="mb-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{problem.message}</span>
            </DSAlert>
          ))}
        </div>
      )}
      <Content className="py-8 px-2 lg:container">
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
