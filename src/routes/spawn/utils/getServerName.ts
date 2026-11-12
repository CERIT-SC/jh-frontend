/**
 * Extracts the server name from the current URL path.
 *
 * JupyterHub spawn URLs follow the pattern `/spawn/{userName}/{serverName}`.
 * The default server has no name segment (`/hub/spawn`,
 * `/hub/spawn/{userName}`) — that is the "Start a new server" flow.
 *
 * @returns The decoded server name, or null when the URL carries none.
 */
export function getServerName(): string | null {
  // `/hub/spawn/{userName}`
  const match = window.location.pathname.match(/\/spawn\/[^/]+\/([^/?#]+)/);
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]) || null;
  } catch {
    return match[1];
  }
}
