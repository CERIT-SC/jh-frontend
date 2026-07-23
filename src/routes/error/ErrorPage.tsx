import { useCallback, useMemo } from "react";
import { Card, CardContent, H1, P } from "@e-infra/design-system";
import { Footer, JupyterHubHeader } from "@components/layout";
import { Button } from "@components/ui";
import { Home } from "lucide-react";
import { sanitizeHtml } from "@utils";
/**
 * Global config injected by JupyterHub's Jinja2 template (error.html).
 * Maps to the error template variables: status_code, status_message, message_html, message, extra_error_html
 */
declare const appConfig: {
  userName: string;
  statusCode?: number;
  statusMessage?: string;
  messageHtml?: string;
  message?: string;
  extraErrorHtml?: string;
};

const ErrorPage: React.FC = () => {
  const userName = appConfig.userName ?? "";
  const statusCode = appConfig.statusCode;
  const statusMessage = appConfig.statusMessage ?? "Error";
  const messageHtml = appConfig.messageHtml;
  const message = appConfig.message;
  const extraErrorHtml = appConfig.extraErrorHtml;

  const handleGoHome = useCallback(() => {
    window.location.href = "/hub/home";
  }, []);

  // Remove redirects parameter from URL on mount (jupyterhub template)
  useCallback(() => {
    if (window.location.search.length <= 1) {
      return;
    }
    const searchParameters = window.location.search.slice(1).split("&");
    for (let i = 0; i < searchParameters.length; i++) {
      if (searchParameters[i].split("=")[0] === "redirects") {
        // Remove redirects from search parameters
        searchParameters.splice(i, 1);
        let newSearch = "";
        if (searchParameters.length) {
          newSearch = "?" + searchParameters.join("&");
        }
        const newUrl =
          window.location.origin +
          window.location.pathname +
          newSearch +
          window.location.hash;
        window.history.replaceState({}, "", newUrl);
        return;
      }
    }
  }, []);

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedMessageHtml = useMemo(
    () => (messageHtml ? sanitizeHtml(messageHtml) : null),
    [messageHtml],
  );
  const sanitizedExtraErrorHtml = useMemo(
    () => (extraErrorHtml ? sanitizeHtml(extraErrorHtml) : null),
    [extraErrorHtml],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <JupyterHubHeader userName={userName} />

      <div className="container grow mx-auto px-4 py-8 space-y-8 place-content-center">
        <Card className="full max-w-lg mx-auto bg-background backdrop-blur supports-backdrop-filter:bg-background/60">
          <CardContent>
            <div className="flex flex-col items-center gap-6 text-center">
              {/* Error header */}
              <div className="text-center">
                <H1>
                  {statusCode
                    ? `${statusCode} : ${statusMessage}`
                    : statusMessage}
                </H1>
              </div>

              {/* Error detail */}
              <div className="space-y-4">
                {sanitizedMessageHtml ? (
                  <div className="text-center text-text-muted max-w-md">
                    <P
                      dangerouslySetInnerHTML={{ __html: sanitizedMessageHtml }}
                    />
                  </div>
                ) : message ? (
                  <div className="text-center text-text-muted max-w-md">
                    <P>{message}</P>
                  </div>
                ) : null}

                {sanitizedExtraErrorHtml ? (
                  <div className="text-center text-text-muted max-w-md">
                    <P
                      dangerouslySetInnerHTML={{
                        __html: sanitizedExtraErrorHtml,
                      }}
                    />
                  </div>
                ) : null}
              </div>

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
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer className="flex-none" />
    </div>
  );
};

export default ErrorPage;
