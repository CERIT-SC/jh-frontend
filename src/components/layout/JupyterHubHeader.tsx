/**
 * @fileoverview Thin brand-slot resolver: renders the active brand's Header.
 * Exports and props unchanged — existing imports and stories keep working.
 */

import React from "react";
import type { JupyterHubHeaderProps } from "../../brands/types";
import { getBrand } from "../../brands/registry";

export const JupyterHubHeader: React.FC<JupyterHubHeaderProps> = ({
  userName,
}) => {
  const BrandHeader = getBrand().slots.Header;
  return <BrandHeader userName={userName} />;
};
