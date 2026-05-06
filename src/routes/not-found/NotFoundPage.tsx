import { useCallback } from "react";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  PanelDescription,
} from "@e-infra/design-system";
import { Footer, JupyterHubHeader } from "@components/layout";
import { Button } from "@components/ui";
import { Orbit, Home } from "lucide-react";
import Logo from "../../../public/static/custom-images/light-background-jupyterhub-logo-square.svg";
/**
 * Global config injected by JupyterHub's Jinja2 template (not_found.html).
 */
declare const appConfig: {
  userName: string;
};

const NotFoundPage: React.FC = () => {
  const userName = appConfig.userName ?? "";

  const handleGoHome = useCallback(() => {
    window.location.href = "/hub/home";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <JupyterHubHeader userName={userName} />

      <div className="container grow mx-auto px-4 py-8 space-y-8 place-content-center">
        <Panel className="my-auto mx-auto w-full max-w-2xl bg-background/90">
          <PanelContent className="flex flex-col items-center gap-6 text-center">
            {/* 404 illustration */}
            <div className="relative flex items-center justify-center mb-4">
              <img
                width={264}
                className="absolute"
                src={Logo}
                alt="404 Not Found"
              />
              <span className="p-4 text-6xl font-bold text-text-muted select-none">
                404
              </span>
            </div>

            <p className="text-center text-text-muted max-w-md">
              The page you are looking for does not exist or has been moved.
              Navigate back to your home page to continue.
            </p>

            {/* Home button */}
            <Button
              variant="default"
              size="lg"
              title="Go Home"
              onClickFun={handleGoHome}
              className="w-auto min-w-[160px]"
            >
              <Home className="h-4 w-4" />
            </Button>
          </PanelContent>
        </Panel>
      </div>

      <Footer className="flex-none" />
    </div>
  );
};

export default NotFoundPage;
