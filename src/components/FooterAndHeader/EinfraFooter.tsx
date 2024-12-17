import "./EinfraFooter.css";
import React from "react";

export const EinfraFooter = () => {
  return (
    <footer className="einfra-footer">
      <div className="einfra-img" />
      <p className="einfra-wrapper">
        <a
          className="einfra-docs"
          href="https://docs.cerit.io/en/web-apps/jupyterhub"
        >
          <u>Documentation</u>
        </a>
        <a className="einfra-mail" href="mailto:k8s@ics.muni.cz">
          Contact
        </a>
      </p>
    </footer>
  );
};
