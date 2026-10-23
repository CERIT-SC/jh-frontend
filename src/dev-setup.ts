/**
 * @fileoverview Dev-only bootstrap: mocks `appConfig` and injects the
 * per-instance fixture (wire + instance config) so the app runs without
 * JupyterHub's Jinja2 rendering.
 *
 * The fixture is selected by `?instance=<name>`, then `VITE_INSTANCE`, then
 * `hub`. Injection mirrors the backend exactly: the wire goes into the
 * `<script type="application/json" id="spawn-options">` element the strict
 * reader consumes; the `instance` block into `#instance-config`. A fixture
 * without `spawn_options` renders the blocked, empty form — the same
 * observable failure a page without backend emission gets in production.
 */

import { FIXTURES, type InstanceFixture } from "./fixtures/instances";

/** Shape of a single spawner entry in the home-page mock. */
interface DevSpawner {
  last_activity: string;
  url: string;
  active: boolean;
  ready: boolean;
}

/** Dev-only window globals (mocked appConfig). */
interface DevWindow extends Window {
  appConfig?: Record<string, unknown>;
}

function getDevWindow(): DevWindow {
  return window as DevWindow;
}
function injectJsonScript(id: string, content: unknown): void {
  let element = document.getElementById(id);
  if (!(element instanceof HTMLScriptElement)) {
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/json";
    document.body.appendChild(script);
    element = script;
  }
  element.textContent = JSON.stringify(content);
}

function injectFixture(fixture: InstanceFixture): void {
  injectJsonScript("spawn-options", fixture.wire);
  if (fixture.instance !== undefined) {
    injectJsonScript("instance-config", fixture.instance);
  }
}

export default function initDev() {
  const pathname = window.location.pathname;
  const devWindow = getDevWindow();

  if (pathname.includes("error.html")) {
    // Dev config for error page
    devWindow.appConfig = {
      userName: "dev",
      statusCode: 500,
      statusMessage: "Internal Server Error",
      messageHtml: undefined,
      message: "An error occurred while processing your request.",
      extraErrorHtml: undefined,
    };
  } else if (
    pathname.includes("home.html") ||
    pathname.includes("spawn.html") ||
    pathname.includes("login.html")
  ) {
    // Dev config for home page and other pages with spawners
    const mockSpawners: Record<string, DevSpawner> = Array.from(
      { length: 5 },
      (_, i) => `spawner${i + 1}`,
    ).reduce<Record<string, DevSpawner>>((acc, spawner) => {
      acc[spawner] = {
        last_activity: new Date().toISOString(),
        url: `/user/${spawner}`,
        active: Math.random() < 0.5,
        ready: Math.random() < 0.5,
      };
      return acc;
    }, {});

    devWindow.appConfig = {
      spawners: {
        test: {
          last_activity: "2024-11-24T15:48:29.604740Z",
          url: "/user/test",
          active: true,
          ready: false,
        },
        test1: {
          last_activity: "2024-11-24T15:46:56.719146Z",
          url: "/user/test1",
          active: false,
          ready: false,
        },
        ...mockSpawners,
      },
      default_server_active: false,
      url: "http://localhost",
      userName: "dev",
      announcement: "",
      xsrf: "sample-xsrf-token",
    };
  } else {
    // Default dev config for other pages
    devWindow.appConfig = {
      userName: "dev",
      xsrf: "sample-xsrf-token",
    };
  }

  // Per-instance fixture: ?instance=<name> beats VITE_INSTANCE beats hub.
  const name =
    new URLSearchParams(window.location.search).get("instance") ??
    import.meta.env.VITE_INSTANCE ??
    "hub";
  const fixture = FIXTURES[name];
  if (fixture) {
    injectFixture(fixture);
    console.log(`Dev mode — instance fixture: ${name}`, fixture);
  } else {
    console.warn(`Dev mode — unknown instance fixture "${name}", using hub.`);
    injectFixture(FIXTURES.hub);
  }
}
