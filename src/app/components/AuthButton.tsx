"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";

type AuthButtonProps = {
  isLoggedIn: boolean;
};

export default function AuthButton({ isLoggedIn }: AuthButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (isLoggedIn) {
    return (
      <button
        onClick={handleSignOut}
        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
      >
        Sign Out
      </button>
    );
  }

  if (pathname === "/auth") return null;

  return (
    <Link
      href="/auth"
      className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
    >
      Sign In
    </Link>
  );
}