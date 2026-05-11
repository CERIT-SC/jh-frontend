import { useCallback } from "react";
import { Card, CardContent } from "@e-infra/design-system";
import { Footer, JupyterHubHeader } from "@components/layout";
import { Button } from "@components/ui";
import { Home } from "lucide-react";
import { notFound } from "../../../public/static/custom-images";
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
        <Card className="full max-w-lg overflow-hidden border-border/50 bg-surface/80 shadow-xl backdrop-blur-md supports-backdrop-filter:bg-surface/60 mx-auto">
          <CardContent className="flex flex-col items-center gap-6 text-center">
            {/* 404 illustration */}
            <div className="relative flex items-center justify-center">
              <img
                width={264}
                className=""
                src={notFound}
                alt="404 Not Found"
              />
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
          </CardContent>
        </Card>
      </div>

      <Footer className="flex-none" />
    </div>
  );
};

export default NotFoundPage;
