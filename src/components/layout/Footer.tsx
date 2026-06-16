import React from "react";
import { einfraLogo } from "../../../public/static/custom-images";
import { einfraLogoDark } from "../../../public/static/custom-images";
import { Button, cn } from "@e-infra/design-system";
import { Mail, FileText, ArrowUpRight } from "lucide-react";

interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps): React.ReactElement => {
  return (
    <footer
      className={cn(
        "relative overflow-hidden bg-background/60 backdrop-blur-xl supports-backdrop-filter:backdrop-blur-xl px-6 py-5",
        className,
      )}
    >
      {/* Gradient accent bar at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        {/* Main content row — vertically aligned */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left — Logo & operator */}
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <img
              src={einfraLogo}
              alt="e-INFRA CZ"
              className="h-8 w-auto object-contain transition-opacity opacity-90 hover:opacity-100 block dark:hidden"
            />
            <img
              src={einfraLogoDark}
              alt="e-INFRA CZ"
              className="h-8 w-auto object-contain transition-opacity opacity-90 hover:opacity-100 hidden dark:block"
            />
            <p className="text-sm font-medium text-text-muted">
              Operated by <span className="text-text">CERIT-SC</span>,{" "}
              <span className="text-text">ICS MUNI</span>
            </p>
          </div>

          {/* Right — Links with visual treatment */}
          <nav className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://docs.cerit.io/en/docs/web-apps/jupyterhub",
                  "_blank",
                )
              }
            >
              <FileText className="h-4 w-4" />
              <span>Documentation</span>
              <ArrowUpRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "mailto:k8s@cerit-sc.cz")}
            >
              <Mail className="h-4 w-4" />
              <span>k8s@cerit-sc.cz</span>
            </Button>
          </nav>
        </div>

        {/* Divider with gradient */}
        <div className="relative py-2">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Copyright row */}
        <div className="flex flex-col items-center justify-between gap-2 pb-1 sm:flex-row">
          <p className="text-xs font-medium tracking-wide text-text-muted/80">
            Copyright © 2026 — All rights reserved
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            <span className="text-xs text-text-muted/70">e-INFRA CZ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
