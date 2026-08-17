import React from "react";
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
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@e-infra/design-system";
import { Book, LogOut } from "lucide-react";
import { ModeToggle } from "../ui/ModeToggle";
import { elterDatalabsLogo } from "../../../public/static/custom-images/index";
interface JupyterHubHeaderProps {
  userName: string;
}

export const JupyterHubHeader: React.FC<JupyterHubHeaderProps> = ({
  userName,
}) => {
  const handleLogout = () => {
    window.location.href = "/hub/logout";
  };

  return (
    <>
      <Header
        data-theme="elter"
        className="dark text-text bg-background supports-backdrop-filter:bg-background"
      >
        <HeaderContent>
          <HeaderLeft>
            {/* Logo */}
            <div className="flex h-10 items-center justify-center">
              <a href="/hub/home">
                <img
                  className="h-14 w-auto"
                  src={elterDatalabsLogo}
                  alt="Logo"
                />
              </a>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          window.open(
                            "https://docs.cerit.io/en/docs/web-apps/jupyterhub",
                            "_blank",
                          )
                        }
                      >
                        <Book className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Documentation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuList>
            </NavigationMenu>
          </HeaderLeft>
          <HeaderRight>
            <span className="ml-2">{userName}</span>
            <ModeToggle />
            {/* <Avatar>
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${userName || "User"}`}
                alt={userName || "User"}
              />
              <AvatarFallback>
                {(userName?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar> */}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </HeaderRight>
        </HeaderContent>
      </Header>
    </>
  );
};
