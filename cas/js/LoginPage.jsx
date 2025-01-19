import "./Login.css";
import { Button } from "../../src/components/Button/Button";
import React from "react";

function LoginPage({ buttonText, imagePath, link }) {
  return (
    <div className="wrapper">
      <div className="login">
        {imagePath && <img src={imagePath} height={"100px"} />}
        <p> It is necessary to be a valid member of bioconductor group to access the service. If you are not a member, you will be automatically presented an application upon login. The application will be reviewed by course professors or instructors. </p>
        <Button title={buttonText} link={link}></Button>
      </div>
    </div>
  );
}

export default LoginPage;
