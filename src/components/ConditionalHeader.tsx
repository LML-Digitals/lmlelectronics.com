"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Exclude header from these paths
  const excludedPaths = [
    "/dashboard",
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
  ];

  // Check if current path should exclude header
  const shouldExclude = excludedPaths.some((path) =>
    pathname?.startsWith(path)
  );

  if (shouldExclude) {
    return null;
  }

  return <Header />;
}
