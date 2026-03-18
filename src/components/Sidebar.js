"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "◉", label: "Dashboard" },
  { href: "/dashboard/archive", icon: "☰", label: "Archive" },
  { href: "/dashboard/generate", icon: "✦", label: "Generate" },
  { href: "/dashboard/revoice", icon: "↻", label: "Re-voice" },
  { href: "/dashboard/onboarding", icon: "🎤", label: "Voice Setup" },
  { href: "/dashboard/feedback", icon: "📊", label: "Check-in" },
];

export default function Sidebar({ voiceProfile }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const confidence = voiceProfile?.confidence_level || "none";
  const postCount = voiceProfile?.post_count_analyzed || 0;
  const confidencePct =
    confidence === "full" ? 92 : confidence === "limited" ? 55 : confidence === "bootstrap-only" ? 30 : 0;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-xs font-extrabold text-white">
            A
          </div>
          <span className="font-bold text-sm tracking-tight">ArchiveAI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-transparent border-none text-text-muted cursor-pointer text-xl p-1"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-bg/95 pt-14">
          <nav className="p-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg text-base font-medium py-3 px-4 no-underline transition-all ${
                    isActive
                      ? "bg-accent/10 text-accent-light"
                      : "text-text-muted hover:text-text-primary hover:bg-surface"
                  }`}
                >
                  <span className="text-lg w-6 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-border mt-4 pt-4">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg text-base font-medium py-3 px-4 no-underline text-text-dim hover:text-text-primary hover:bg-surface transition-all"
              >
                <span className="text-lg w-6 text-center">↩</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className="hidden md:flex bg-surface border-r border-border flex-col flex-shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 60 : 210 }}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b border-border min-h-[56px] ${
            collapsed ? "px-2.5 py-4 justify-center" : "px-5 py-4 justify-between"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-[7px] bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-[13px] font-extrabold text-white">
                A
              </div>
              <span className="font-bold text-[15px] tracking-tight">ArchiveAI</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-transparent border-none text-text-dim cursor-pointer text-sm p-1"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav className="p-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg border-none cursor-pointer text-sm font-medium transition-all no-underline ${
                  collapsed ? "py-2.5 justify-center" : "py-2.5 px-4"
                } ${
                  isActive
                    ? "bg-accent/10 text-accent-light"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                <span className="text-[15px] w-5 text-center">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Voice confidence */}
        {!collapsed && (
          <div className="mt-auto border-t border-border">
            <div className="p-5">
              <div className="text-[10px] text-text-dim uppercase tracking-wider mb-2 font-semibold">
                Voice Confidence
              </div>
              <div className="h-[5px] bg-bg rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${confidencePct}%`,
                    background: confidence === "full" ? "#34D399" : confidence === "limited" ? "#FBBF24" : "#878BA0",
                  }}
                />
              </div>
              <div className="text-[11px] text-text-dim mt-1.5">
                {postCount > 0 ? `${postCount} posts · ${confidence === "full" ? "Full" : "Limited"} confidence` : "No archive uploaded"}
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-5 py-3.5 border-t border-border text-text-dim text-xs no-underline hover:text-text-muted hover:bg-surface-2 transition-all"
            >
              <span>↩</span>
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
