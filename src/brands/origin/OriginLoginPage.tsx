/**
 * @fileoverview The origin brand's LoginPage — moved verbatim from
 * `routes/login/LoginPage.tsx` (docs URL and logos now from brand data; the
 * MetaCentrum membership links are origin-specific and stay in the slot).
 */

import React from "react";
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
import { originCopy, originLogos } from "./copy";
import type { LoginPageProps } from "../types";

export const OriginLoginPage: React.FC<LoginPageProps> = ({
  buttonText,
  link,
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
            src={originLogos.light}
            alt="e-INFRA CZ"
            className="block h-16 w-auto object-contain dark:hidden sm:h-12"
          />
          <img
            src={originLogos.dark}
            alt="e-INFRA CZ"
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
              <span className="text-sm text-left">Check membership</span>
            </Button>

            <Button
              variant="ghost"
              className="h-auto whitespace-normal justify-start gap-3 p-3 border"
              onClick={() => {
                window.location.href = originCopy.docs_url;
              }}
            >
              <BookOpen className="h-5 w-5 shrink-0" />
              <span className="text-sm text-left">Documentation</span>
            </Button>
          </div>
        </CardContent>

        <Separator className="mx-6 w-auto" />

        <CardFooter className="flex flex-col items-center gap-4 px-6 py-6 sm:px-8">
          {/* Sign in button */}
          <Button
            size="lg"
            className="w-full gap-2 text-base whitespace-normal h-auto min-h-12 py-3"
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
