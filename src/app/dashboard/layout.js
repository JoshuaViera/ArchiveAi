import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch voice profile for sidebar
  const { data: voiceProfile } = await supabase
    .from("voice_profiles")
    .select("confidence_level, post_count_analyzed")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-bg text-text-primary overflow-hidden">
      <Sidebar voiceProfile={voiceProfile} />
      <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-9">
        {children}
      </main>
    </div>
  );
}
