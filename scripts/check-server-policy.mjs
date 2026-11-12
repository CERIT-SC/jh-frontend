// Run with node scripts/check-server-policy.mjs (uses the installed esbuild).
import assert from "node:assert/strict";
import process from "node:process";
import { Buffer } from "node:buffer";
import { createRequire } from "node:module";
import { build } from "esbuild";

const { outputFiles } = await build({
  stdin: {
    contents: 'export * from "./src/utils/serverPolicy.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const policy = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`
);
assert.equal(
  typeof policy.resolveServerPolicy,
  "function",
  "server policy resolver must exist",
);
assert.equal(
  typeof policy.homeServers,
  "function",
  "home server projection must exist",
);
assert.deepEqual(policy.resolveServerPolicy(undefined), {
  default_server: false,
  named_servers: 15,
});
assert.deepEqual(
  policy.resolveServerPolicy({ default_server: true, named_servers: 0 }),
  { default_server: true, named_servers: 0 },
);
assert.equal(
  policy.resolveServerPolicy({ named_servers: null }).named_servers,
  null,
);
assert.equal(
  policy.resolveServerPolicy({ named_servers: -1 }).named_servers,
  0,
);
assert.equal(
  policy.resolveServerPolicy({ named_servers: true }).named_servers,
  0,
);
const enabled = { default_server: true, named_servers: 0 };
assert.deepEqual(policy.homeServers({}, enabled)[""], {
  active: false,
  ready: false,
});
const running = { "": { active: true, ready: true, url: "/user/alice/" } };
assert.equal(policy.homeServers(running, enabled)[""].ready, true);
assert.equal(
  Object.keys(running).length,
  1,
  "projection must not mutate source",
);
assert.equal(policy.namedServerCount({ ...running, notebook: {} }), 1);
assert.equal(policy.canCreateNamedServer(enabled, 0), false);
assert.equal(policy.canCreateNamedServer({ named_servers: 2 }, 2), false);
assert.equal(policy.canCreateNamedServer({ named_servers: 2 }, 1), true);
assert.equal(policy.canCreateNamedServer({ named_servers: null }, 100), true);
console.log("Server policy regression checks passed.");

// Exercise the real API methods without network requests.
const apiBuild = await build({
  entryPoints: ["src/api/JupyterHubAPI.ts"],
  bundle: true,
  packages: "external",
  platform: "node",
  format: "cjs",
  write: false,
});
const apiModule = { exports: {} };
new Function("require", "module", "exports", apiBuild.outputFiles[0].text)(
  createRequire(import.meta.url),
  apiModule,
  apiModule.exports,
);
const api = new apiModule.exports.JupyterHubApiClient("/hub/api", "test-xsrf");
const requests = [];
api.client.defaults.adapter = async (config) => {
  requests.push(config.url);
  return {
    data: {},
    status: 204,
    statusText: "No Content",
    headers: {},
    config,
  };
};
await api.stopNamedServer("alice", "", false);
assert.equal(requests.pop(), "/users/alice/server?_xsrf=test-xsrf");
await api.stopNamedServer("alice", "notebook", false);
assert.equal(requests.pop(), "/users/alice/servers/notebook?_xsrf=test-xsrf");
await assert.rejects(
  api.stopNamedServer("alice", "", true),
  /cannot be deleted/,
);
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async (url) => {
    requests.push(url);
    return { ok: true, headers: { get: () => null } };
  };
  await api.startNamedServer("alice", "");
  assert.equal(requests.pop(), "/hub/api/users/alice/server");
  await api.startNamedServer("alice", "notebook");
  assert.equal(requests.pop(), "/hub/api/users/alice/servers/notebook");
} finally {
  globalThis.fetch = originalFetch;
}
console.log("Default/named API endpoint regression checks passed.");
