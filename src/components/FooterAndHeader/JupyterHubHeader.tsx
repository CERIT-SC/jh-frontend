import React, { useState, useEffect } from "react";
import "./JupyterHubHeader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faBars } from "@fortawesome/free-solid-svg-icons";
import jh_logo from "../../../public/static/custom-images/logo.png"

interface JupyterHubHeaderProps {
  userName: string;
}

const JupyterHubHeader: React.FC<JupyterHubHeaderProps> = ({ userName }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handleResize = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  return (
    <nav className="navbar">
      <span id="jupyterhub-logo" className="navbar-brand">
        <a href="/hub/home">
          <img
            src={jh_logo}
            height={"28px"}
            alt="JupyterHub logo"
            className="jpy-logo"
            title="Home"
          />
        </a>
      </span>

      <button className="navbar-toggler" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      {isMobile ? (
        <div className={`menu ${menuOpen ? "open" : ""}`}>
          <a className="home" href="/hub/home">
            Home
          </a>
          <a className="token" href="/hub/token">
            Token
          </a>
          <span className="me">{userName}</span>
          <a className="logout" href="/hub/logout">
            <FontAwesomeIcon icon={faSignOut} className="icon" />
            Logout
          </a>
        </div>
      ) : (
        <>
          <a className="home" href="/hub/home">
            Home
          </a>
          <a className="token" href="/hub/token">
            Token
          </a>
          <span className="me">{userName}</span>
          <a className="logout" href="/hub/logout">
            <FontAwesomeIcon icon={faSignOut} className="icon" />
            &nbsp;Logout
          </a>
        </>
      )}
    </nav>
  );
};

export default JupyterHubHeader;
