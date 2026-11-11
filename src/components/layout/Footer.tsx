/**
 * @fileoverview Thin brand-slot resolver: renders the active brand's Footer.
 * Exports and props unchanged — existing imports and stories keep working.
 */

import React from "react";
import { getBrand } from "../../brands/registry";

interface FooterProps {
  className?: string;
}

function FooterComponent({ className }: FooterProps): React.ReactElement {
  const BrandFooter = getBrand().slots.Footer;
  return <BrandFooter className={className} />;
}

export const Footer = React.memo(FooterComponent);
