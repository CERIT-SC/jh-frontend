import React from "react";
import { elterDatalabsLogo } from "../../../public/static/custom-images/index";
import {
  Button,
  cn,
  Footer as EInfraFooter,
  FooterContent,
  FooterLeft,
  FooterLeftText,
  FooterLogo,
  FooterRight,
  FooterMeta,
  FooterNavHeading,
  FooterNavLink,
} from "@e-infra/design-system";

interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps): React.ReactElement => {
  return (
    <EInfraFooter className={cn("dark bg-[#0a2033]", className)}>
      <FooterContent>
        <FooterLeft>
          <FooterLogo>
            <a
              href="https://elter-ri.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={elterDatalabsLogo}
                alt="eLTER RI"
                className="h-14 w-auto transition-opacity opacity-90 hover:opacity-100"
              />
            </a>
          </FooterLogo>
          <FooterLeftText>
            Operated by eLTER Research Infrastructure
          </FooterLeftText>
        </FooterLeft>
        <FooterRight>
          <nav className="flex flex-col gap-2">
            <FooterNavHeading>Quick Links</FooterNavHeading>
            <FooterNavLink href="/hub">Home</FooterNavLink>
            <FooterNavLink href="https://docs.cerit.io/en/docs/web-apps/jupyterhub">
              Documentation
            </FooterNavLink>
            <FooterNavLink href="https://portal.elter-ri.eu/">
              eLTER Services
            </FooterNavLink>
          </nav>
          <nav className="flex flex-col gap-2">
            <FooterNavHeading>Information</FooterNavHeading>
            <FooterNavLink href="mailto:office@elter-ri.eu">
              Contacts
            </FooterNavLink>
            <FooterNavLink href="https://elter-ri.eu/community">
              Community
            </FooterNavLink>
          </nav>
        </FooterRight>
      </FooterContent>
      <FooterMeta
        copyright={`Copyright © ${new Date().getFullYear().toString()} e-INFRA CZ`}
      />
    </EInfraFooter>
  );
};
