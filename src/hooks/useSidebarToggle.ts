import { create } from 'zustand';
import { useEffect, useState } from 'react';

interface SidebarToggle {
  toggleCollapse: boolean;
  isMobileMenuOpen: boolean;
  isMobile: boolean;
  invokeToggleCollapse: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useSideBarToggle = create<SidebarToggle>((set, get) => ({
  toggleCollapse: false,
  isMobileMenuOpen: false,
  isMobile: false,
  invokeToggleCollapse: () => set({ toggleCollapse: !get().toggleCollapse }),
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setIsMobile: (isMobile: boolean) => set({ isMobile }),
}));

// Custom hook to handle responsive behavior
export const useResponsiveSidebar = () => {
  const {
    toggleCollapse,
    isMobileMenuOpen,
    isMobile,
    invokeToggleCollapse,
    toggleMobileMenu,
    closeMobileMenu,
    setIsMobile,
  } = useSideBarToggle();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileScreen = window.innerWidth < 768;

      setIsMobile(isMobileScreen);

      // Close mobile menu when switching to desktop
      if (!isMobileScreen && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    // Set mounted immediately and check screen size synchronously
    setMounted(true);
    checkScreenSize();

    // Add resize listener with debouncing for better performance
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [isMobileMenuOpen, closeMobileMenu, setIsMobile]);

  return {
    toggleCollapse,
    isMobileMenuOpen,
    isMobile,
    mounted,
    invokeToggleCollapse,
    toggleMobileMenu,
    closeMobileMenu,
  };
};
