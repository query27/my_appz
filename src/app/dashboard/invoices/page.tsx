import { createSupabaseServerClient } from "@/app/lib/supabase/server-client";
import { redirect } from "next/navigation";
import InvoicesView from "./InvoicesView";

export default async function InvoicesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: invoices }, { data: clients }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id, name, email, phone")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  return (
    <InvoicesView
      initialInvoices={invoices || []}
      clients={clients || []}
      userId={user.id}
    />
  );
}