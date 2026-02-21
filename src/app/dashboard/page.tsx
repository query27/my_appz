import { createSupabaseServerClient } from "@/app/lib/supabase/server-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → send to auth
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Onboarding not done → send back
  if (!profile?.onboarding_complete) redirect("/onboarding/business");

  return (
    <div className="min-h-screen bg-[#0a1a14] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-700/30 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h1 className="text-white font-extrabold text-3xl mb-2">
          Welcome, {profile?.business_name || user.email} 👋
        </h1>
        <p className="text-gray-400 text-sm">
          Your dashboard is coming soon. Onboarding complete!
        </p>
      </div>
    </div>
  );
}