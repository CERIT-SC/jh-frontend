// import "./EinfraFooter.css";
import React from "react";
import einfra_logo from "../../../public/static/custom-images/logo-einfra_barvy.svg";
import { Footer } from "@e-infra/design-system";

export const EinfraFooter = () => {
  return (
    <Footer logo={einfra_logo} />
    // <footer className="einfra-footer">
    //   <img src={einfra_logo} className="einfra-img" />
    //   <p className="einfra-wrapper">
    //     <a
    //       className="einfra-docs"
    //       href="https://docs.cerit-sc.cz/en/docs/web-apps/jupyterhub"
    //     >
    //       <u>Documentation</u>
    //     </a>
    //     <a className="einfra-mail" href="mailto:k8s@ics.muni.cz">
    //       Contact
    //     </a>
    //   </p>
    // </footer>
  );
};
