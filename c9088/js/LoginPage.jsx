import "./Login.css";
import { Button } from "../../src/components/Button/Button";
import React from "react";

function LoginPage({ buttonText, imagePath, link }) {
  return (
    <div className="wrapper">
      <div className="login">
        {imagePath && <img src={imagePath} height={"100px"} />}
        <Button title={buttonText} link={link}></Button>
      </div>
    </div>
  );
}

export default LoginPage;
