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
import HubLogo from "../../../public/static/custom-images/hub-rectangle.svg";
import HubLogoDark from "../../../public/static/custom-images/hub-rectangle-dark.svg";

interface LoginPageProps {
  /** Text to display on the login button */
  buttonText: string;
  /** OAuth login URL */
  link: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ buttonText, link }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {/* Main login card with glassmorphism */}
      <Card
        variant="default"
        animation="translate"
        className="w-full max-w-lg overflow-hidden border-border/50 bg-surface/80 shadow-xl backdrop-blur-md supports-backdrop-filter:bg-surface/80"
      >
        <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8">
          {/* Logo */}
          <img
            src="/static/custom-images/e-INFRA_logo.svg"
            alt="e-INFRA CZ"
            className="block h-16 w-auto object-contain dark:hidden sm:h-12"
          />
          <img
            src="/static/custom-images/e-INFRA_logo_White.svg"
            alt="e-INFRA CZ"
            className="hidden h-16 w-auto object-contain dark:block sm:h-12"
          />
          {/* Welcome heading */}
          <div className="flex flex-col items-center gap-2 text-center">
            <H1 className="text-2xl sm:text-3xl">Welcome Back</H1>
            <Muted className="text-sm sm:text-base">
              Sign in to access your JupyterHub workspace
            </Muted>
          </div>
        </CardHeader>

        <Separator className="mx-6 w-auto" />

        <CardContent className="flex flex-col gap-5 px-6 py-6 sm:px-8">
          {/* Info section */}
          <P className="text-center text-sm leading-relaxed sm:text-base">
            You need to be a valid member of{" "}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1 py-0 text-sm font-normal text-primary underline-offset-4 hover:underline"
              onClick={() => {
                window.location.href =
                  "https://profile.e-infra.cz/profile/organizations";
              }}
            >
              MetaCentrum
            </Button>{" "}
            to access JupyterHub.
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
              <span className="text-sm text-left">Check membership status</span>
            </Button>

            <Button
              variant="ghost"
              className="h-auto whitespace-normal justify-start gap-3 p-3 border"
              onClick={() => {
                window.location.href =
                  "https://docs.cerit.io/en/docs/web-apps/jupyterhub";
              }}
            >
              <BookOpen className="h-5 w-5 shrink-0" />
              <span className="text-sm text-left">
                JupyterHub documentation
              </span>
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
