import { createSupabaseServerClient } from "@/app/lib/supabase/server-client";
import { redirect } from "next/navigation";
import ClientsView from "./ClientsView";

export default async function ClientsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <ClientsView initialClients={clients || []} userId={user.id} />;
}