import "./Login.css";
import { Button } from "./stories/Button";

function LoginPage({ buttonText, infoText, imagePath, link }) {
  return (
    <div className="wrapper">
      <div className="login">
        <img src={imagePath} height={"100px"} />
        <p>
          It is necessary to be a valid member of MetaCentrum to access
          JupyterHub, you can check membership status{" "}
          <a href="https://profile.e-infra.cz/profile/organizations">here</a> or
          consult{" "}
          <a href="https://docs.cerit.io/en/web-apps/jupyterhub#metacentrum-membership">
            documentation
          </a>{" "}
          for more information. You can also check resources utilization in{" "}
          <a href="https://grafana.hub.cloud.e-infra.cz/d/H5q_43FVk/jupyterhub">
            grafana
          </a>
          .{" "}
        </p>
        <Button title={buttonText} link={link}></Button>
      </div>
    </div>
  );
}

export default LoginPage;
