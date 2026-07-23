/**
 * Extracts the server name from the current URL path.
 *
 * JupyterHub spawn URLs follow the pattern `/spawn/{userName}/{serverName}`.
 * The server name is the last path segment; this fn returns null when no
 * server name is present (i.e., "Start a new server" flow).
 *
 * @returns The decoded server name, or null if not present.
 */
export function getServerName(): string | null {
  const pathParts = window.location.pathname.split("/");
  // /spawn/{userName}/{serverName}
  try {
    return decodeURIComponent(pathParts[pathParts.length - 1]) || null;
  } catch {
    return pathParts[pathParts.length - 1] || null;
  }
}
