/**
 * @fileoverview Thin brand-slot resolver: renders the active brand's Header.
 * Exports and props unchanged — existing imports and stories keep working.
 */

import React from "react";
import type { JupyterHubHeaderProps } from "../../brands/types";
import { getBrand } from "../../brands/registry";
import { getInstanceConfig } from "@utils/instanceConfig";

export const JupyterHubHeader: React.FC<JupyterHubHeaderProps> = ({
  userName,
  logo,
}) => {
  const BrandHeader = getBrand().slots.Header;
  // Configured header logo (`instance.pages.header.logo`) overrides the
  // brand's bundled one; absent/invalid → the brand assets render unchanged.
  const resolved = logo ?? getInstanceConfig().config.pages.header?.logo;
  return <BrandHeader userName={userName} logo={resolved} />;
};
