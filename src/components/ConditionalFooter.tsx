"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Exclude footer from these paths
  const excludedPaths = [
    "/dashboard",
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
  ];

  // Check if current path should exclude footer
  const shouldExclude = excludedPaths.some((path) =>
    pathname?.startsWith(path)
  );

  if (shouldExclude) {
    return null;
  }

  return <Footer />;
}
