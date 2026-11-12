import LoginPage from "./LoginPage";
import { createRoot } from "react-dom/client";
import "../../styles/index.css";
import { ThemeProvider } from "@components/layout";
import initDev from "../../dev-setup";
import { getInstanceConfig } from "@utils/instanceConfig";

if (import.meta.env.DEV) {
  initDev();
}

// Instance-config problems (e.g. malformed login content) are logged once
// per page load, here at the entry — the reader memoizes, so nothing logs
// per render. Never blocks the sign-in button.
for (const problem of getInstanceConfig().problems) {
  console.warn(`Instance config problem: ${problem.message}`);
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider defaultTheme="system">
    <div>
      <LoginPage
        buttonText="Sign in via unified login e-INFRA CZ AAI"
        link="/hub/oauth_login?next=%2Fhub%2F"
      />
    </div>
  </ThemeProvider>,
);
