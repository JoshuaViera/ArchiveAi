import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-sm font-extrabold text-white">
            A
          </div>
          <span className="font-bold text-base tracking-tight">ArchiveAI</span>
        </div>
        <Link
           href="/dashboard"
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-accent/10 text-accent-light border border-accent/25 no-underline transition-all hover:bg-accent/20"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent-light border border-accent/25 mb-8">
          For solo consultants & freelancers
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
          Your LinkedIn voice,
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
            on autopilot.
          </span>
        </h1>

        <p className="text-lg text-text-muted max-w-xl mb-10 leading-relaxed">
          Upload your LinkedIn archive. We'll learn your writing voice, surface
          your best ideas, and generate new posts that sound exactly like you —
          in under 5 minutes.
        </p>

        <Link
          href="/dashboard"
          className="px-8 py-3.5 rounded-xl text-base font-bold text-white no-underline transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #7C6AEF, #9B8DF5)" }}
        >
          Get started free →
        </Link>
        <p className="text-xs text-text-dim mt-4">
          3 free generations. No credit card required.
        </p>

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 w-full text-left">
          {[
            {
              icon: "☰",
              title: "Mine your archive",
              desc: "See every post you've ever written — sorted, searchable, and scored by performance.",
            },
            {
              icon: "✦",
              title: "Generate in your voice",
              desc: "Enter a topic. Get a LinkedIn post that sounds like you wrote it on your best day.",
            },
            {
              icon: "↻",
              title: "Re-voice old gold",
              desc: "Take your best post from 2022 and refresh it for today's audience and context.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-base font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed m-0">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-text-dim border-t border-border">
        ArchiveAI · Your content, your voice, your data.
      </footer>
    </div>
  );
}
