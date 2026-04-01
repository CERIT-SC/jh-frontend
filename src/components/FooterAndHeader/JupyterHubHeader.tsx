import React, { useState, useEffect } from "react";
// import "./JupyterHubHeader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faBars } from "@fortawesome/free-solid-svg-icons";
// import jh_logo from "../../../public/static/custom-images/logo.png";
import { Header, Button } from "@e-infra/design-system";
import { HomeIcon, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@e-infra/design-system";

interface JupyterHubHeaderProps {
  userName: string;
}

const JupyterHubHeader: React.FC<JupyterHubHeaderProps> = ({ userName }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    window.location.href = "/hub/logout";
  };

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
    <>
      <Header
        variant="navigation"
        navigationItems={[
          { label: "Home", href: "/hub/home" },
          { label: "Token", href: "/hub/token" },
        ]}
      >
        <Avatar>
          <AvatarImage
            src={`https://ui-avatars.com/api/?name=${userName}`}
            alt={userName}
          />
          <AvatarFallback>{userName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="ml-2">{userName}</span>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </Header>
    </>
    // <nav className="navbar">
    //   <span id="jupyterhub-logo" className="navbar-brand">
    //     <a href="/hub/home">
    //       <img
    //         src={jh_logo}
    //         height={"28px"}
    //         alt="JupyterHub logo"
    //         className="jpy-logo"
    //         title="Home"
    //       />
    //     </a>
    //   </span>

    //   <button className="navbar-toggler" onClick={toggleMenu}>
    //     <FontAwesomeIcon icon={faBars} />
    //   </button>

    //   {isMobile ? (
    //     <div className={`menu ${menuOpen ? "open" : ""}`}>
    //       <a className="home" href="/hub/home">
    //         Home
    //       </a>
    //       <a className="token" href="/hub/token">
    //         Token
    //       </a>
    //       <span className="me">{userName}</span>
    //       <a className="logout" href="/hub/logout">
    //         <FontAwesomeIcon icon={faSignOut} className="icon" />
    //         Logout
    //       </a>
    //     </div>
    //   ) : (
    //     <>
    //       <a className="home" href="/hub/home">
    //         Home
    //       </a>
    //       <a className="token" href="/hub/token">
    //         Token
    //       </a>
    //       <span className="me">{userName}</span>
    //       <a className="logout" href="/hub/logout">
    //         <FontAwesomeIcon icon={faSignOut} className="icon" />
    //         &nbsp;Logout
    //       </a>
    //     </>
    //   )}
    // </nav>
  );
};

export default JupyterHubHeader;
