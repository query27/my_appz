"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const hiddenRoutes = ["/auth", "/dashboard"];

  const shouldHide = hiddenRoutes.some((route) => pathname?.startsWith(route));

  if (shouldHide) return null;

  return <>{children}</>;
}