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
        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm font-semibold"
      >
        Sign Out
      </button>
    );
  }

  if (pathname === "/auth") return null;

  return (
    <div className="flex items-center gap-3">

      {/* Sign In */}
      <Link
        href="/auth"
        className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-emerald-400 hover:text-emerald-400 transition text-sm font-semibold"
      >
        Sign In
      </Link>

      {/* Divider */}
      <span className="text-gray-600 text-lg select-none">|</span>

      {/* Get Started Free */}
      <Link
        href="/auth"
        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 transition text-white text-sm font-semibold whitespace-nowrap"
      >
        Get Started Free
      </Link>

    </div>
  );
}