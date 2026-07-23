import { useCallback, useEffect } from "react";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  PanelDescription,
} from "@e-infra/design-system";
import { Footer, JupyterHubHeader } from "@components/layout";
import { Button } from "@components/ui";
import { Loader2 } from "lucide-react";

/**
 * Global config injected by JupyterHub's Jinja2 template (stop_pending.html).
 */
declare const appConfig: {
  progressUrl: string;
  userName: string;
};

const StopPendingPage: React.FC = () => {
  const userName = appConfig.userName ?? "";

  // Handle page refresh via button
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // Auto-refresh after 5 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.location.reload();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <JupyterHubHeader userName={userName} />

      <div className="container grow mx-auto px-4 py-8 space-y-8 place-content-center">
        <Panel className="my-auto mx-auto w-full max-w-2xl">
          <PanelHeader>
            <PanelTitle>Your server is stopping</PanelTitle>
            <PanelDescription>
              You will be able to start it again once it has finished stopping.
            </PanelDescription>
          </PanelHeader>

          <PanelContent className="flex flex-col items-center space-y-6">
            {/* Spinner */}
            <div className="text-primary">
              <Loader2 className="animate-spin" size={48} />
            </div>

            {/* Refresh button */}
            <Button
              variant="default"
              size="lg"
              title="Refresh"
              onClickFun={handleRefresh}
              className="w-auto min-w-[120px]"
            />
          </PanelContent>
        </Panel>
      </div>

      <Footer className="flex-none" />
    </div>
  );
};

export default StopPendingPage;
