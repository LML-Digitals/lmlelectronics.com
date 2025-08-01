"use client";
import { useResponsiveSidebar } from "@/hooks/useSidebarToggle";
import classNames from "classnames";
import { motion } from "framer-motion";
import {
  Calculator,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  Menu,
  X,
  Search,
  Command,
  Sparkles,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UserNav } from "./UserNav";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

import { useSearch } from "@/hooks/useSearch";
import { Loader2 } from "lucide-react";
import { GlobalPriceSearch } from "@/components/price/price-components/GlobalPriceSearch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function Header() {
  const {
    toggleCollapse,
    invokeToggleCollapse,
    isMobile,
    isMobileMenuOpen,
    toggleMobileMenu,
    mounted,
  } = useResponsiveSidebar();

  const { theme } = useTheme();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const { results, isLoading, error } = useSearch(searchQuery);

  const searchResults = [
    {
      group: "Pages",
      items: results?.map((result) => ({
        id: result.id,
        name: result.name,
        href: result.path,
        description: result.description,
      })) || [],
    },
  ];

  const handleCollapseSideBar = () => {
    invokeToggleCollapse();
  };

  const headerStyle = classNames(
    "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 shadow-sm",
    {
      // Adjust padding for desktop sidebar
      "md:pl-6": !toggleCollapse,
      "md:pl-4": toggleCollapse,
    }
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter results based on search query
  const filteredResults = searchQuery
    ? searchResults.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
    : searchResults;

  // Ensure we have valid results to display
  const hasResults = filteredResults?.[0]?.items?.length > 0;

  // Show a minimal header skeleton while loading to avoid blank state
  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse hidden sm:block" />
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerStyle}>
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu toggle */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="shrink-0 md:hidden hover:bg-muted/60 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        )}

        {/* Desktop sidebar toggle */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCollapseSideBar}
            className="shrink-0 hidden md:flex hover:bg-muted/60 transition-colors duration-200"
          >
            {toggleCollapse ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <ChevronsLeft className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}

        {/* Page title and breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Dashboard</span>
          <span>/</span>
          <span>Portal</span>
        </div>

        {/* Search - enhanced styling */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              type="search"
              placeholder="Search anything... (⌘K)"
              className={cn(
                "w-full rounded-lg bg-muted/50 border-0 pl-10 pr-4 py-2.5 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20",
                isMobile ? "text-sm" : "text-sm",
                searchQuery ? "rounded-b-none" : "",
                "hover:bg-muted/70 focus:hover:bg-background"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchExpanded(true);
                if (searchQuery) setShowResults(true);
              }}
              onBlur={() => {
                setIsSearchExpanded(false);
                // Delay hiding results to allow for clicks
                setTimeout(() => setShowResults(false), 200);
              }}
            />

            {/* Search Results - enhanced styling */}
            {searchQuery && (showResults || isSearchExpanded) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 w-full mt-0 rounded-b-lg border border-t-0 bg-popover shadow-xl z-50 backdrop-blur supports-[backdrop-filter]:bg-popover/95"
              >
                <div className="max-h-[300px] overflow-y-auto overflow-x-hidden rounded-b-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Searching...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Search temporarily unavailable</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!hasResults && (
                        <div className="py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No results found</p>
                            <p className="text-xs text-muted-foreground/70">Try a different search term</p>
                          </div>
                        </div>
                      )}
                      {filteredResults.map((group) => (
                        <div key={group.group} className="p-2">
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            {group.group}
                          </div>
                          <div className="space-y-1">
                            {group.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  window.location.href = item.href;
                                  setShowResults(false);
                                  setSearchQuery("");
                                  setIsSearchExpanded(false);
                                }}
                                className="w-full flex items-center gap-3 px-2 py-1.5 text-sm rounded-sm hover:bg-muted/50 transition-colors duration-150 text-left"
                              >
                                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium truncate">{item.name}</span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {item.id}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right side actions - enhanced styling */}
        <div className="flex items-center gap-2">
          {/* Quick stats for staff */}
          {session?.user?.userType === "staff" && (
            <div className="hidden lg:flex items-center gap-3 mr-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30">
                <Activity className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Active</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30">
                <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">+12%</span>
              </div>
            </div>
          )}

          {/* Theme switcher - enhanced */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>


          {/* Staff-only tools - enhanced styling */}
          {session?.user?.userType === "staff" && (
            <>
              <div className="hidden lg:block">
                <GlobalPriceSearch />
              </div>
              <Link href={"/dashboard/calculator"} className="hidden sm:block">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-muted/60 transition-colors duration-200"
                  title="Calculator"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}

          {/* User navigation - enhanced */}
          <div className="ml-2">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
