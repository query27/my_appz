import { createSupabaseServerClient } from "@/app/lib/supabase/server-client";
import { redirect } from "next/navigation";
import GentleChaseDashboard from "./GentleChaseDashboard";

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

  // Build display name — use full name, business name, or fall back to email
  const userName = profile?.full_name || profile?.business_name || user.email || "User";
  const userEmail = user.email || "";
  const businessName = profile?.business_name || "";

  return (
    <GentleChaseDashboard
      userName={userName}
      userEmail={userEmail}
      businessName={businessName}
    />
  );
}