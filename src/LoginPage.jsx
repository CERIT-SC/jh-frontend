import "./Login.css";
import { Button } from "./components/Button/Button";
import React from "react";

function LoginPage({ buttonText, imagePath, link }) {
  return (
    <div className="wrapper">
      <div className="login">
        <img src={imagePath} height={"100px"} />
        <p>
          It is necessary to be a valid member of MetaCentrum to access
          JupyterHub, you can check membership status{" "}
          <a href="https://profile.e-infra.cz/profile/organizations">here</a> or
          consult{" "}
          <a href="https://docs.cerit.io/en/docs/platform/access#account">
            documentation
          </a>{" "}
          for more information. More information on the JupyterHub instance can be found in{" "}
          <a href="https://docs.cerit.io/en/docs/web-apps/jupyterhub">
            JupyterHub documentation
          </a>
          .{" "}
        </p>
        <Button title={buttonText} link={link}></Button>
      </div>
    </div>
  );
}

export default LoginPage;
