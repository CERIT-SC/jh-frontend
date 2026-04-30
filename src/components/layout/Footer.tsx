import React from "react";
import { einfraLogo } from "../../../public/static/custom-images";
import { einfraLogoDark } from "../../../public/static/custom-images";
import { cn, Link } from "@e-infra/design-system";
import { Mail, FileText, ArrowUpRight } from "lucide-react";

interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps): React.ReactElement => {
  return (
    <footer
      className={cn(
        "relative overflow-hidden border-t border-border/60 bg-surface/60 backdrop-blur-xl supports-backdrop-filter:backdrop-blur-xl px-6 py-5",
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
            <Link
              href="https://docs.cerit-sc.cz/en/docs/web-apps/jupyterhub"
              className="group inline-flex items-center gap-2 rounded-lg border border-transparent bg-surface-raised/50 px-4 py-2 text-sm font-medium text-text-muted transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-lg hover:shadow-primary/5"
            >
              <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Documentation</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:translate-y-[-0.5px] group-hover:opacity-60" />
            </Link>
            <Link
              href="mailto:k8s@cerit-sc.cz"
              className="group inline-flex items-center gap-2 rounded-lg border border-transparent bg-surface-raised/50 px-4 py-2 text-sm font-medium text-text-muted transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-lg hover:shadow-primary/5"
            >
              <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>k8s@cerit-sc.cz</span>
            </Link>
          </nav>
        </div>

        {/* Divider with gradient — balanced padding */}
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
