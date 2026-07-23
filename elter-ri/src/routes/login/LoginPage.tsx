import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  H1,
  Muted,
  P,
  Separator,
} from "@e-infra/design-system";
import { LogIn, BookOpen, Users } from "lucide-react";
import React from "react";

interface LoginPageProps {
  /** Text to display on the login button */
  buttonText: string;
  /** OAuth login URL */
  link: string;
  /** Optional description text shown below the heading */
  description?: string;
  /** Optional member link text (e.g. "MetaCentrum" or "eLTER") */
  memberLinkText?: string;
  /** Optional member link URL */
  memberLinkHref?: string;
  /** Optional docs link text */
  docsLinkText?: string;
  /** Optional docs link URL */
  docsLinkHref?: string;
  /** Optional light-mode logo src */
  logoLightSrc?: string;
  /** Optional dark-mode logo src */
  logoDarkSrc?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
  buttonText,
  link,
  description,
  memberLinkText = "MetaCentrum",
  memberLinkHref = "https://profile.e-infra.cz/profile/organizations",
  docsLinkText = "Documentation",
  docsLinkHref = "https://docs.cerit.io/en/docs/web-apps/jupyterhub",
  logoLightSrc = "/static/custom-images/e-INFRA_logo.svg",
  logoDarkSrc = "/static/custom-images/e-INFRA_logo_White.svg",
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Card
        variant="default"
        animation="translate"
        className="w-full max-w-lg overflow-hidden border-border/50 bg-surface/80 shadow-xl backdrop-blur-md supports-backdrop-filter:bg-surface/60"
      >
        <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8">
          {/* Logo */}
          <img
            src={logoLightSrc}
            alt="JupyterHub"
            className="block h-16 w-auto object-contain dark:hidden sm:h-12"
          />
          <img
            src={logoDarkSrc}
            alt="JupyterHub"
            className="hidden h-16 w-auto object-contain dark:block sm:h-12"
          />
          {/* Welcome heading */}
          <div className="flex flex-col items-center gap-2 text-center">
            <H1 className="text-2xl sm:text-3xl">Welcome to JupyterHub</H1>
            <Muted className="text-sm sm:text-base">
              Sign in to access your JupyterHub workspace
            </Muted>
          </div>
        </CardHeader>

        <Separator className="mx-6 w-auto" />

        <CardContent className="flex flex-col gap-5 px-6 py-6 sm:px-8">
          {/* Info section */}
          <P className="text-center text-sm leading-relaxed">
            {description ? (
              <>
                {description}{" "}
                {memberLinkHref && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-1 py-0 text-sm font-normal text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      window.location.href = memberLinkHref;
                    }}
                  >
                    {memberLinkText}
                  </Button>
                )}
              </>
            ) : (
              <>
                You need to be a valid member of{" "}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-1 py-0 text-sm font-normal text-primary underline-offset-4 hover:underline"
                  onClick={() => {
                    window.location.href = memberLinkHref;
                  }}
                >
                  {memberLinkText}
                </Button>{" "}
                to access JupyterHub.
              </>
            )}
          </P>

          {/* Quick links grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              variant="ghost"
              className="h-auto whitespace-normal justify-start gap-3 p-3 border"
              onClick={() => {
                window.location.href =
                  "https://docs.cerit.io/en/docs/platform/access#account";
              }}
            >
              <Users className="h-5 w-5 shrink-0" />
              <span className="text-sm text-left">Check membership</span>
            </Button>

            <Button
              variant="ghost"
              className="h-auto whitespace-normal justify-start gap-3 p-3 border"
              onClick={() => {
                window.location.href = docsLinkHref;
              }}
            >
              <BookOpen className="h-5 w-5 shrink-0" />
              <span className="text-sm text-left">{docsLinkText}</span>
            </Button>
          </div>
        </CardContent>

        <Separator className="mx-6 w-auto" />

        <CardFooter className="flex flex-col items-center gap-4 px-6 py-6 sm:px-8">
          {/* Sign in button */}
          <Button
            size="lg"
            className="w-full gap-2 text-base"
            onClick={() => {
              window.location.href = link;
            }}
          >
            <LogIn className="h-5 w-5" />
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
