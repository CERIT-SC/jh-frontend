import "../../styles/index.css";
import React from "react";
import {
  Button,
  Content,
  ContentHeading,
  P,
  Separator,
} from "@e-infra/design-system";
import { Panel, PanelContent } from "@components/ui";
import { Footer, JupyterHubHeader } from "@components/layout";
import type { NotRunningAppConfig } from "@src-types/appConfig";
import { Play } from "lucide-react";

/**
 * Global config injected by JupyterHub's Jinja2 template (not_running.html).
 */
declare const appConfig: NotRunningAppConfig;

const NotRunning: React.FC = () => {
  const handleLaunchServer = () => {
    window.location.href = appConfig.spawnUrl;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JupyterHubHeader userName={appConfig.userName} />

      <main className="flex-1 w-full flex items-center justify-center py-12">
        <Content className="container mx-auto px-4 max-w-2xl">
          <Panel className="border-border bg-surface/50">
            <PanelContent className="p-8 text-center space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <ContentHeading className="mb-0">
                    Server Not Running
                  </ContentHeading>
                </div>
                <P className="text-muted-foreground max-w-md mx-auto">
                  Your server is currently stopped. Click the button below to
                  start your JupyterHub server.
                </P>
              </div>

              <Separator className="my-4" />

              {/* Server Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Server Name:</span>{" "}
                  <span className="font-medium truncate block">
                    {appConfig.serverName || "default"}
                  </span>
                </div>
              </div>

              {/* Launch Button */}
              <Button
                variant="default"
                size="lg"
                onClick={handleLaunchServer}
                className="bg-primary hover:bg-primary/90 min-w-[200px]"
              >
                <Play className="h-4 w-4 mr-2" />
                Launch Server
              </Button>
            </PanelContent>
          </Panel>
        </Content>
      </main>

      <Footer />
    </div>
  );
};

export default NotRunning;
