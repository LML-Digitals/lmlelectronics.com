"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/stores/useCartStore";
import { CircleDashed } from "lucide-react";

// This component ensures that the store's state is not hydrated until the component is mounted on the client
export function CartStorageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait until after client-side hydration to show the child components
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Force a store initialization to load data from localStorage
  const initializeStore = () => {
    // Access the store once to initialize it
    const _ = useCartStore.getState();
    return null;
  };

  initializeStore();

  // if (!isHydrated) {
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center">
  //     <CircleDashed className="h-12 w-12 animate-spin" />
  //     </div>
  //   );
  // }

  return <>{children}</>;
}
