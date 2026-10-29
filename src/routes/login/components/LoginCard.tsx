/**
 * @fileoverview The shared login card. One component owns the layout —
 * geometry, spacing, typography, separators, logo sizing and dark/light
 * switching, link grid, and the sign-in button — so every instance keeps the
 * hub's look. Content arrives as props; text is rendered as React children
 * (never HTML). Brand slots provide their content to this card too.
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
  Separator,
} from "@e-infra/design-system";
import { LogIn } from "lucide-react";
import type { LoginContent } from "@src-types/instanceConfig";

/** One configured (or brand-provided) quick link below the info section. */
export interface LoginCardLink {
  label: string;
  /** Navigation target; rendered as window.location navigation. */
  href: string;
  /** Optional leading icon (brand slots may pass one; configured links do not). */
  icon?: React.ReactNode;
}

export interface LoginCardProps {
  heading: string;
  /** Empty string hides the subtitle. */
  subtitle: string;
  /** Same-origin logo pair; both images may share one source. */
  logo?: LoginContent["logo"];
  /** Info section above the links (e.g. a membership paragraph). */
  info?: React.ReactNode;
  links: LoginCardLink[];
  /** Text on the sign-in button. */
  buttonText: string;
  /** Sign-in destination (the route's OAuth login URL). */
  link: string;
}

/** Hides a failed <img> without touching anything else on the page. */
function hideOnError(event: React.SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.style.display = "none";
}

export const LoginCard: React.FC<LoginCardProps> = ({
  heading,
  subtitle,
  logo,
  info,
  links,
  buttonText,
  link,
}) => {
  const hasInfo = info !== undefined && info !== null;
  const hasLinks = links.length > 0;
  const hasContent = hasInfo || hasLinks;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Card
        variant="default"
        animation="translate"
        className="w-full max-w-lg overflow-hidden border-border/50 bg-surface/80 shadow-xl backdrop-blur-md supports-backdrop-filter:bg-surface/60"
      >
        <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8">
          {logo && (
            <>
              {/* Without a dark variant the one logo shows in both modes;
                  with one, the light image yields in dark mode. */}
              <img
                src={logo.src}
                alt={logo.alt}
                onError={hideOnError}
                className={`block h-16 w-auto max-w-full object-contain sm:h-12${
                  logo.dark_src ? " dark:hidden" : ""
                }`}
              />
              {logo.dark_src && (
                <img
                  src={logo.dark_src}
                  alt={logo.alt}
                  onError={hideOnError}
                  className="hidden h-16 w-auto max-w-full object-contain dark:block sm:h-12"
                />
              )}
            </>
          )}
          <div className="flex flex-col items-center gap-2 text-center">
            <H1 className="text-2xl sm:text-3xl">{heading}</H1>
            {subtitle !== "" && (
              <Muted className="text-sm sm:text-base">{subtitle}</Muted>
            )}
          </div>
        </CardHeader>

        {hasContent && <Separator className="mx-6 w-auto" />}

        {hasContent && (
          <CardContent className="flex flex-col gap-5 px-6 py-6 sm:px-8">
            {info}
            {hasLinks && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {links.map((entry) => (
                  <Button
                    key={entry.label}
                    variant="ghost"
                    className="h-auto whitespace-normal justify-start gap-3 p-3 border"
                    onClick={() => {
                      window.location.href = entry.href;
                    }}
                  >
                    {entry.icon}
                    <span className="text-sm text-left">{entry.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        )}

        <Separator className="mx-6 w-auto" />

        <CardFooter className="flex flex-col items-center gap-4 px-6 py-6 sm:px-8">
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
