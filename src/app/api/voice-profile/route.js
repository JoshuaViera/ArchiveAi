import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: voiceProfile } = await supabase
      .from("voice_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!voiceProfile) {
      return NextResponse.json({ error: "No voice profile found." }, { status: 404 });
    }

    return NextResponse.json(voiceProfile);
  } catch (e) {
    console.error("Voice profile fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch voice profile." }, { status: 500 });
  }
}
