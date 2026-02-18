import UnifiedAuthDemo from "./Unifiedauthdemo";
import { createSupabaseServerClient } from "../lib/supabase/server-client";

export default async function AuthPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <UnifiedAuthDemo user={user} />;
}