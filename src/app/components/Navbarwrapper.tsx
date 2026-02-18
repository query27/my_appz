"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/auth") return null;

  return <>{children}</>;
}