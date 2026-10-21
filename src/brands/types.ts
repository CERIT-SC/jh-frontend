/**
 * @fileoverview Brand definitions.
 *
 * PALETTES ARE CODE, NOT CONFIG: palettes are vetted design-system themes
 * switched by `<html data-theme>` (`setup.css` default, `elter_setup.css`,
 * `eosc_setup.css`). Never inject colors at runtime. A new brand = a
 * design-system theme file + `src/brands/<id>/` slots + a registry entry;
 * any brand-specific global CSS must be scoped under `[data-theme="<id>"]`.
 */

import type { ComponentType } from "react";

/** Props of the hub header slot. */
export interface JupyterHubHeaderProps {
  userName: string;
}

/** Props of the login page slot (the route entry supplies them). */
export interface LoginPageProps {
  /** Text to display on the login button */
  buttonText: string;
  /** OAuth login URL */
  link: string;
}

/** A brand: theme id + assets + copy + structural slot components. */
export interface BrandDefinition {
  /** Equals <html data-theme>; "origin" = design-system default (:root). */
  id: string;
  /** Primary logo pair (light/dark) used by brand slots. */
  logos: { light: string; dark: string };
  copy: {
    operator_names: string[];
    docs_url: string;
    support_email: string;
  };
  slots: {
    Header: ComponentType<JupyterHubHeaderProps>;
    Footer: ComponentType<{ className?: string }>;
    LoginPage: ComponentType<LoginPageProps>;
  };
}
