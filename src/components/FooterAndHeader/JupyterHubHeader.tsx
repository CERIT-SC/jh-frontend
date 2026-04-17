import React, { useState, useEffect } from "react";
// import "./JupyterHubHeader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faBars } from "@fortawesome/free-solid-svg-icons";
import {
  Header,
  Button,
  HeaderContent,
  HeaderLeft,
  HeaderRight,
  NavigationMenuLink,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@e-infra/design-system";
import { HomeIcon, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@e-infra/design-system";
import { ModeToggle } from "../ModeToggle";
import HubLogo from "../../../public/static/custom-images/hub-rectangle.svg";
import HubLogoDark from "../../../public/static/custom-images/hub-rectangle-dark.svg";
interface JupyterHubHeaderProps {
  userName: string;
}

const JupyterHubHeader: React.FC<JupyterHubHeaderProps> = ({ userName }) => {
  const handleLogout = () => {
    window.location.href = "/hub/logout";
  };

  return (
    <>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            {/* Logo */}
            <div className="flex h-10 items-center justify-center">
              <img
                className="h-8 w-auto object-contain block dark:hidden"
                src={HubLogo}
                alt="Logo"
              />
              <img
                className="h-8 w-auto object-contain dark:block hidden"
                src={HubLogoDark}
                alt="Logo"
              />
            </div>
            {/* Nav */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/hub/home">Home</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/hub/token">
                    Token
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </HeaderLeft>
          <HeaderRight>
            <span className="ml-2">{userName}</span>
            <Avatar>
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${userName || "User"}`}
                alt={userName || "User"}
              />
              <AvatarFallback>
                {(userName?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
            <ModeToggle />
          </HeaderRight>
        </HeaderContent>
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
