"use client";
import { useResponsiveSidebar } from "@/hooks/useSidebarToggle";
import type { SideNavItem } from "./types/sidebarTypes";
import classNames from "classnames";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence } from "framer-motion";

export const SideBarMenuItem = ({ item }: { item: SideNavItem }) => {
  const { theme } = useTheme();
  const { toggleCollapse, isMobile, closeMobileMenu } = useResponsiveSidebar();

  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const toggleSubMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubMenuOpen(!subMenuOpen);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeMobileMenu();
    }
  };

  const isActive = item.path === '/dashboard' 
    ? pathname === item.path 
    : pathname === item.path || pathname?.startsWith(item.path + '/');

  const inactiveLink = classNames(
    "flex items-center min-h-[44px] h-full text-muted-foreground py-2.5 px-3 hover:text-foreground hover:bg-muted/60 rounded-lg transition-all duration-200 group relative",
    { ["justify-center"]: toggleCollapse && !isMobile }
  );

  const activeLink = classNames(
    "relative flex items-center min-h-[44px] h-full text-foreground py-2.5 px-3 transition-all duration-200 rounded-lg bg-primary/10 border border-primary/20 shadow-sm",
    {
      "justify-center w-12 transition-all delay-100 duration-100":
        toggleCollapse && !isMobile,
      "text-primary font-medium": true,
    }
  );

  const navMenuDropdownItem =
    "text-sm py-2 px-3 hover:text-foreground hover:bg-muted/40 transition-all duration-200 rounded-md";

  const dropdownMenuHeaderLink = classNames(inactiveLink, {
    ["bg-muted/40 rounded-b-none border-b border-border/50"]: subMenuOpen,
  });

  // For collapsed desktop state, wrap in tooltip
  const MenuItemContent = ({ children }: { children: React.ReactNode }) => {
    if (toggleCollapse && !isMobile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-medium">{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <>{children}</>;
  };

  return (
    <>
      {item.submenu ? (
        <div className="min-w-[18px]">
          <MenuItemContent>
            <button
              type="button"
              className={`${dropdownMenuHeaderLink} ${
                isActive ? activeLink : ""
              } w-full text-left cursor-pointer`}
              onClick={toggleSubMenu}
            >
              <div className={`min-w-[20px] shrink-0 transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              }`}>
                {item.icon}
              </div>
              {(!toggleCollapse || isMobile) && (
                <>
                  <span className="ml-3 text-sm leading-6 font-medium truncate">
                    {item.title}
                  </span>
                  <ChevronRight
                    className={`${
                      subMenuOpen ? "rotate-90" : ""
                    } ml-auto stroke-2 text-xs shrink-0 transition-transform duration-200 text-muted-foreground`}
                  />
                </>
              )}
            </button>
          </MenuItemContent>
          {subMenuOpen && (!toggleCollapse || isMobile) && (
            <div className="bg-muted/30 border-l-2 border-primary/20 ml-3 mt-1">
              <div className="grid gap-y-1 px-3 py-2">
                {item.subMenuItems
                  ?.sort((a, b) => a.title.length - b.title.length)
                  .map((subItem, idx) => {
                    const isSubActive = subItem.path === pathname;
                    return (
                      <Link
                        key={idx}
                        href={subItem.path}
                        className={`${navMenuDropdownItem} ${
                          isSubActive
                            ? "text-primary font-medium bg-primary/10"
                            : "text-muted-foreground"
                        }`}
                        onClick={handleLinkClick}
                      >
                        <span className="truncate">{subItem.title}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hover:pl-1 transition-all duration-200">
          <MenuItemContent>
            <Link
              href={item.path}
              className={`${inactiveLink} ${
                isActive ? activeLink : ""
              }`}
              onClick={handleLinkClick}
            >
              {/* Active indicator */}
              <div
                className={`absolute left-0 w-1 h-full rounded-r-full transition-all duration-200 ${
                  isActive
                    ? "bg-primary w-1 h-8 top-1/2 -translate-y-1/2"
                    : ""
                }`}
              ></div>
              
              <div
                className={classNames(
                  "shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.icon}
              </div>
              
              {(!toggleCollapse || isMobile) && (
                <span className="ml-3 leading-4 font-medium text-sm truncate">
                  {item.title}
                </span>
              )}
            </Link>
          </MenuItemContent>
        </div>
      )}
    </>
  );
};
