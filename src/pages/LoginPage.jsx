import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  Separator,
  Link,
  PanelFooter,
  Small,
  Button,
} from "@e-infra/design-system";
import React from "react";

function LoginPage({ buttonText, imagePath, link }) {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Panel className="w-full max-w-xl shadow-lg">
          <PanelHeader>
            <PanelTitle>
              <img src={imagePath} />
            </PanelTitle>
          </PanelHeader>
          <Separator />
          <PanelContent>
            <Small>
              It is necessary to be a valid member of MetaCentrum to access
              JupyterHub, you can check membership status{" "}
              <Link href="https://profile.e-infra.cz/profile/organizations">
                here
              </Link>{" "}
              or consult{" "}
              <Link href="https://docs.cerit.io/en/docs/platform/access#account">
                documentation
              </Link>{" "}
              for more information. More information on the JupyterHub instance
              can be found in{" "}
              <Link href="https://docs.cerit.io/en/docs/web-apps/jupyterhub">
                JupyterHub documentation
              </Link>
              .{" "}
            </Small>
          </PanelContent>
          <Separator />
          <PanelFooter>
            <Button onClick={() => (window.location.href = link)}>
              {buttonText}
            </Button>
          </PanelFooter>
        </Panel>
      </div>
    </>
  );
}
export default LoginPage;
