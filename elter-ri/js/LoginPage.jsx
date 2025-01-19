import "./Login.css";
import { Button } from "../../src/components/Button/Button";
import React from "react";
import elter_logo from "../static/custom-images/elter_logo.svg"

function LoginPage({ buttonText, imagePath, link }) {
  return (
    <div className="wrapper">
      <div className="login">
        {imagePath && <img src={elter_logo} height={"100px"} />}
        <p> It is necessary to be a valid member of elter group to access the service. If you are not a member, you will be automatically presented an application upon login. The application will be reviewed by eLTER heads. </p>
        <Button title={buttonText} link={link}></Button>
      </div>
    </div>
  );
}

export default LoginPage;
