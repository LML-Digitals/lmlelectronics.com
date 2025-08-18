'use client';
import { SIDENAV_ITEMS } from '@/components/dashboard/sidebar/SideNavItems';
import { CUSTOMER_SIDENAV_ITEMS } from './CustomerSideNavItem';
import { useResponsiveSidebar } from '@/hooks/useSidebarToggle';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SideBarMenuGroup from './SidebarMenuGroup';
import { fetchSession } from '@/lib/session';
import { Session } from 'next-auth';
// import {
//   BRAND_KEYS,
//   getClientBrandSettings,
// } from "@/lib/config/brandConfig.client";
import { X, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export const SideBar = () => {
  const {
    toggleCollapse,
    isMobileMenuOpen,
    isMobile,
    mounted,
    closeMobileMenu,
    invokeToggleCollapse,
  } = useResponsiveSidebar();

  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInSession: Session | null | undefined = await fetchSession();

        if (userInSession) {
          setUser(userInSession.user);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load brand logo - make it non-blockin

  const asideVariants = {
    expanded: { width: '18rem' },
    collapsed: { width: '4.5rem' },
  };

  const mobileOverlayVariants = {
    hidden: { opacity: 0, visibility: 'hidden' as const },
    visible: { opacity: 1, visibility: 'visible' as const },
  };

  const mobileSidebarVariants = {
    hidden: { x: '-100%' },
    visible: { x: '0%' },
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeMobileMenu();
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );

  // Show loading skeleton only if not mounted, otherwise show the actual content
  const renderMenuContent = () => {
    if (!mounted || isLoading) {
      return <LoadingSkeleton />;
    }

    return (
      <div className="flex flex-col gap-2">
        {user && user.userType === 'staff'
          ? SIDENAV_ITEMS.map((item, idx) => (
            <SideBarMenuGroup key={idx} menuGroup={item} />
          ))
          : CUSTOMER_SIDENAV_ITEMS.map((item, idx) => (
            <SideBarMenuGroup key={idx} menuGroup={item} />
          ))}
      </div>
    );
  };

  // Mobile sidebar (overlay)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileOverlayVariants}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileSidebarVariants}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-xl z-50 md:hidden"
            >
              <div className="relative flex flex-col h-full">
                {/* Header with close button */}
                <div className="flex items-center justify-between px-4 py-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Link href={'/dashboard'} onClick={handleLinkClick}>
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          width={40}
                          height={40}
                          alt="Brand logo"
                          className="hover:scale-110 transition-all duration-200 rounded-xl object-contain"
                          priority
                        />
                      ) : (
                        <div className="w-[40px] h-[40px] bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            L
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-col">
                      <h1 className="font-bold text-base tracking-wide">
                        Portal
                      </h1>
                      {user && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          {user.userType === 'staff' ? 'Staff' : 'Customer'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeMobileMenu}
                    className="shrink-0 hover:bg-muted"
                  >
                    <X size={20} />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
                  {renderMenuContent()}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/20">
                  <div className="text-xs text-muted-foreground text-center">
                    {user?.email && (
                      <p className="truncate mb-1">{user.email}</p>
                    )}
                    <p>© {new Date().getFullYear()} LML Repair</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop/Tablet sidebar
  return (
    <motion.aside
      initial={false}
      animate={toggleCollapse ? 'collapsed' : 'expanded'}
      variants={asideVariants}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative h-full bg-background border-r shadow-sm hidden md:flex flex-col"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={'/dashboard'} className="shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                width={36}
                height={36}
                alt="Brand logo"
                className="hover:scale-110 transition-all duration-200 rounded-xl object-contain"
                priority
              />
            ) : (
              <div className="w-[36px] h-[36px] bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-primary">L</span>
              </div>
            )}
          </Link>
          {!toggleCollapse && (
            <div className="flex flex-col min-w-0">
              <h1 className="font-bold text-base tracking-wide truncate">
                Portal
              </h1>
              {user && (
                <Badge variant="secondary" className="text-xs w-fit">
                  {user.userType === 'staff' ? 'Staff' : 'Customer'}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={invokeToggleCollapse}
          className="shrink-0 h-8 w-8 hover:bg-muted"
        >
          {toggleCollapse ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
        {renderMenuContent()}
      </nav>

      {/* Footer */}
      {!toggleCollapse && (
        <div className="p-4 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground text-center">
            {user?.email && <p className="truncate mb-1">{user.email}</p>}
            <p>© {new Date().getFullYear()} LML Repair</p>
          </div>
        </div>
      )}
    </motion.aside>
  );
};
