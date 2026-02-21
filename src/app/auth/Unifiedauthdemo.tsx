"use client";

import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UnifiedAuthDemoProps = {
  user: User | null;
};

type Mode = "signup" | "signin";

export default function UnifiedAuthDemo({ user }: UnifiedAuthDemoProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
      }
    );
    return () => listener?.subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setStatus("Signed out successfully");
    router.refresh();
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // After email confirmation, go to onboarding
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setStatus(error ? error.message : "Check your inbox to confirm your account!");
      setLoading(false);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus(error.message);
        setLoading(false);
      } else {
        // Check onboarding status for returning users
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", data.user.id)
          .single();

        if (profile?.onboarding_complete) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding/business");
        }
        router.refresh();
      }
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#0a1a14] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {!currentUser ? (
          <form
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#05080f] via-[#080e1e] to-[#0c1830] p-8 text-slate-100 shadow-[0_35px_90px_rgba(2,6,23,0.7)]"
            onSubmit={handleEmailSubmit}
          >
            {/* Glow blobs */}
            <div className="pointer-events-none absolute -left-6 -top-6 -z-10 h-24 w-32 rounded-full bg-[radial-gradient(circle,_rgba(66,133,244,0.2),_transparent)] blur-xl" />
            <div className="pointer-events-none absolute -bottom-8 right-0 -z-10 h-28 w-40 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.15),_transparent)] blur-xl" />

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">GentleChase</p>
                <h3 className="text-xl font-semibold text-white">
                  {mode === "signup" ? "Create your account" : "Welcome back"}
                </h3>
                {mode === "signup" && (
                  <p className="text-emerald-400 text-xs mt-1">✓ 30 days free · No credit card required</p>
                )}
              </div>
              <div className="flex rounded-full border border-white/10 bg-white/[0.07] p-1 text-xs font-semibold">
                {(["signup", "signin"] as Mode[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={mode === option}
                    onClick={() => { setMode(option); setStatus(""); }}
                    className={`rounded-full px-4 py-1 transition ${
                      mode === option
                        ? "bg-emerald-500/30 text-white shadow shadow-emerald-500/20"
                        : "text-slate-400"
                    }`}
                  >
                    {option === "signup" ? "Sign up" : "Sign in"}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-200">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-base text-white placeholder-slate-500 shadow-inner shadow-black/30 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-base text-white placeholder-slate-500 shadow-inner shadow-black/30 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>

            <div className="relative my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500">or continue with</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {status && (
              <p className="mt-4 text-sm text-slate-300" role="status" aria-live="polite">
                {status}
              </p>
            )}
          </form>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-7 text-slate-200 text-center">
            <p className="text-white font-semibold text-lg mb-2">You&apos;re already signed in!</p>
            <p className="text-slate-400 text-sm mb-6">{currentUser.email}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition mb-3"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}