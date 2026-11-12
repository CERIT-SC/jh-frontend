import type { ServerPolicy } from "@src-types/instanceConfig";

/** Missing policy preserves legacy behavior; invalid explicit limits fail closed. */
export function resolveServerPolicy(value: unknown): ServerPolicy {
  if (value === undefined) return { default_server: false, named_servers: 15 };
  const block =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const limit = block.named_servers;
  return {
    default_server: block.default_server === true,
    named_servers:
      limit === null
        ? null
        : typeof limit === "number" && Number.isSafeInteger(limit) && limit >= 0
          ? limit
          : 0,
  };
}

/** Keep the enabled default slot even when the API omits its stopped server. */
export function homeServers<T extends { active?: boolean; ready?: boolean }>(
  servers: Record<string, T>,
  policy: ServerPolicy,
): Record<string, T | { active: boolean; ready: boolean }> {
  return policy.default_server
    ? { "": { active: false, ready: false }, ...servers }
    : servers;
}

export function namedServerCount(servers: Record<string, unknown>): number {
  return Object.keys(servers).filter((name) => name !== "").length;
}

export function canCreateNamedServer(
  policy: Pick<ServerPolicy, "named_servers">,
  count: number,
): boolean {
  return policy.named_servers === null || count < policy.named_servers;
}
