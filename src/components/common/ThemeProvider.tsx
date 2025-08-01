"use client";

import React, { useEffect, useState, useCallback } from "react";

// Convert hex color to HSL format for CSS variables
const hexToHSL = (hex: string): string => {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Parse the hex values
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else {
    console.warn("Invalid hex color:", hex);
    return "0 0% 0%"; // Default to black if invalid
  }

  // Find the min and max values to determine luminance
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Calculate HSL values
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  // Return HSL formatted as CSS variable value
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Helper function to check if a color is dark
const isDarkColor = (hex: string): boolean => {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  cardColor?: string;
  borderColor?: string;
  fontFamily?: string;
}

export default function ThemeProvider({
  children,
  themeSettings,
  fontFamily = "GeistSans, sans-serif",
}: {
  children: React.ReactNode;
  themeSettings?: ThemeSettings;
  fontFamily?: string;
}) {
  // Apply theme settings to CSS variables
  const applyThemeSettings = useCallback(
    (settings: ThemeSettings) => {
      if (typeof window === "undefined") return;

      const root = document.documentElement;

      // Apply all theme variables
      if (settings.primaryColor) {
        root.style.setProperty("--primary", hexToHSL(settings.primaryColor));
      }

      if (settings.secondaryColor) {
        root.style.setProperty(
          "--secondary",
          hexToHSL(settings.secondaryColor)
        );
      }

      if (settings.accentColor) {
        root.style.setProperty("--accent", hexToHSL(settings.accentColor));
      }

      if (settings.backgroundColor) {
        root.style.setProperty(
          "--background",
          hexToHSL(settings.backgroundColor)
        );
      }

      if (settings.textColor) {
        root.style.setProperty("--foreground", hexToHSL(settings.textColor));
      }

      if (settings.mutedColor) {
        root.style.setProperty(
          "--muted-foreground",
          hexToHSL(settings.mutedColor)
        );
      }

      if (settings.cardColor) {
        root.style.setProperty("--card", hexToHSL(settings.cardColor));
      }

      if (settings.borderColor) {
        root.style.setProperty("--border", hexToHSL(settings.borderColor));
        root.style.setProperty("--input", hexToHSL(settings.borderColor));
      }

      // Set font family
      if (settings.fontFamily) {
        document.body.style.fontFamily = settings.fontFamily;
      } else if (fontFamily) {
        document.body.style.fontFamily = fontFamily;
      }

      // Apply foreground colors based on darkness of background colors
      root.style.setProperty("--primary-foreground", "0 0% 100%"); // Always white for primary buttons

      root.style.setProperty(
        "--secondary-foreground",
        settings.secondaryColor && isDarkColor(settings.secondaryColor)
          ? "0 0% 100%" // White text for dark backgrounds
          : "222.2 84% 4.9%" // Black text for light backgrounds
      );

      root.style.setProperty(
        "--accent-foreground",
        settings.accentColor && isDarkColor(settings.accentColor)
          ? "0 0% 100%"
          : "222.2 84% 4.9%"
      );

      root.style.setProperty(
        "--card-foreground",
        settings.cardColor && isDarkColor(settings.cardColor)
          ? "0 0% 100%"
          : "222.2 84% 4.9%"
      );

      // Set popover colors to match card colors for consistency
      root.style.setProperty(
        "--popover",
        getComputedStyle(root).getPropertyValue("--card")
      );
      root.style.setProperty(
        "--popover-foreground",
        getComputedStyle(root).getPropertyValue("--card-foreground")
      );
    },
    [fontFamily]
  );

  // Apply theme settings when component mounts or settings change
  useEffect(() => {
    if (themeSettings) {
      applyThemeSettings(themeSettings);
    }
  }, [themeSettings, applyThemeSettings]);

  return <>{children}</>;
}
