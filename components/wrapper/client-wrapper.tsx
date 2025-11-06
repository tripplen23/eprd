"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <SessionProvider>{children}</SessionProvider>;
}