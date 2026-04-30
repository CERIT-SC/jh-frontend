/**
 * @fileoverview Type declarations for JupyterHub-injected appConfig objects.
 *
 * These configurations are injected by JupyterHub's Jinja2 templates into the
 * global scope of each route. Each route has its own specific configuration shape.
 *
 * @see {@link https://jupyterhub.readthedocs.io/en/stable/reference/templates.html} JupyterHub Template Reference
 */

/**
 * Base configuration properties available across all routes.
 */
export interface AppConfigBase {
  /** Current authenticated user's username */
  userName: string;
}

/**
 * Configuration for the home route (`/hub/home`).
 * Injected by `home.html` Jinja2 template.
 */
export interface HomeAppConfig extends AppConfigBase {
  /** XSFRF token for API requests */
  xsrf: string;
  /** Available spawners configuration */
  spawners: Record<string, unknown>;
  /** Whether the default server is currently active */
  default_server_active: boolean;
  /** Default server URL */
  url?: string;
  /** Spawn URL for creating new servers */
  spawnUrl?: string;
}

/**
 * Configuration for the not-running route (`/hub/not-running`).
 * Injected by `not_running.html` Jinja2 template.
 */
export interface NotRunningAppConfig extends AppConfigBase {
  spawnUrl: string;
  serverName: string;
}

/**
 * Configuration for the spawn route (`/hub/spawn/:user/:server`).
 * Injected by `spawn.html` Jinja2 template.
 */
export interface SpawnAppConfig extends AppConfigBase {
  /** POST URL for form submission */
  postUrl: string;
}

/**
 * Configuration for the spawn-pending route (`/hub/spawn-pending/:user/:server`).
 * Injected by `spawn_pending.html` Jinja2 template.
 */
export interface SpawnPendingAppConfig extends AppConfigBase {
  /** URL for SSE progress updates */
  progressUrl: string;
}

/**
 * Configuration for the token route (`/hub/token`).
 * Injected by `token.html` Jinja2 template.
 */
export interface TokenAppConfig extends AppConfigBase {
  /** XSFRF token for API requests */
  xsrf: string;
  /** HTML options for token expiration dropdown */
  token_expires_in_options_html?: string;
}

/**
 * Union type of all route-specific appConfig types.
 * Use this when you need to reference any appConfig type.
 */
export type RouteAppConfig =
  | HomeAppConfig
  | NotRunningAppConfig
  | SpawnAppConfig
  | SpawnPendingAppConfig
  | TokenAppConfig;

/**
 * Global appConfig declaration for routes that need it.
 */
declare global {
  /**
   * Global appConfig object injected by JupyterHub templates.
   */
  const appConfig: Record<string, unknown>;
}
export {};
