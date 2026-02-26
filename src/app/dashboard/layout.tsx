import { createSupabaseServerClient } from "@/app/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_complete) redirect("/onboarding/business");

  const userName    = profile?.full_name || profile?.business_name || user.email || "User";
  const userEmail   = user.email || "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1a14",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
      }}
    >
      {/* Global sidebar — shows on every dashboard page */}
      <Sidebar userName={userName} userEmail={userEmail} />

      {/* Page content — pushed right by sidebar width */}
      <div
        style={{
          flex: 1,
          marginLeft: 240,
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.3s ease",
        }}
        id="gc-main-content"
      >
        {children}
      </div>
    </div>
  );
}