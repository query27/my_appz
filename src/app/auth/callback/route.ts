import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server-client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Check if user has already completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .single();

      if (profile?.onboarding_complete) {
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        return NextResponse.redirect(`${origin}/onboarding/business`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}