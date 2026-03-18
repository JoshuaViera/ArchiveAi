import Sidebar from "@/components/Sidebar";

// Demo voice profile for sidebar display
const DEMO_VOICE_PROFILE = {
  confidence_level: "full",
  post_count_analyzed: 85,
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg text-text-primary overflow-hidden">
      <Sidebar voiceProfile={DEMO_VOICE_PROFILE} />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-9">
        {children}
      </main>
    </div>
  );
}
