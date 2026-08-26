import React, { useState } from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Separator,
} from "@e-infra/design-system";
import { Book, LogOut, Menu } from "lucide-react";
import { ModeToggle } from "../ui/ModeToggle";
import { elterDatalabsLogo } from "../../../public/static/custom-images/index";
interface JupyterHubHeaderProps {
  userName: string;
}

export const JupyterHubHeader: React.FC<JupyterHubHeaderProps> = ({
  userName,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            {/* Desktop Nav */}
            <NavigationMenu className="hidden md:flex">
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

          {/* Desktop Right — hidden on mobile */}
          <HeaderRight className="hidden md:flex">
            <span className="ml-2">{userName}</span>
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </HeaderRight>

          {/* Mobile hamburger — direct child of HeaderContent, pushed right */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 p-4">
                <a
                  href="/hub/home"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-text transition-colors hover:bg-secondary hover:text-primary"
                >
                  Home
                </a>
                <a
                  href="/hub/token"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-text transition-colors hover:bg-secondary hover:text-primary"
                >
                  Token
                </a>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-3 py-2 text-base font-medium"
                  onClick={() => {
                    setMobileOpen(false);
                    window.open(
                      "https://docs.cerit.io/en/docs/web-apps/jupyterhub",
                      "_blank",
                    );
                  }}
                >
                  <Book className="h-5 w-5" />
                  Documentation
                </Button>
              </nav>

              <Separator />

              <div className="flex flex-col gap-1 p-4">
                <span className="px-3 text-sm font-medium text-text">
                  {userName}
                </span>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-3 py-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>

              <Separator />

              <div className="p-4">
                <ModeToggle variant="full" />
              </div>
            </SheetContent>
          </Sheet>
        </HeaderContent>
      </Header>
    </>
  );
};
