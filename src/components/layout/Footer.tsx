/**
 * @fileoverview Thin brand-slot resolver: renders the active brand's Footer.
 * Exports and props unchanged — existing imports and stories keep working.
 */

import React from "react";
import { getBrand } from "../../brands/registry";
import { getInstanceConfig } from "@utils/instanceConfig";

interface FooterProps {
  className?: string;
}

function FooterComponent({ className }: FooterProps): React.ReactElement {
  const BrandFooter = getBrand().slots.Footer;
  // Configured footer logo (`instance.pages.footer.logo`) overrides the
  const logo = getInstanceConfig().config.pages.footer?.logo;
  return <BrandFooter className={className} logo={logo} />;
}

export const Footer = React.memo(FooterComponent);
