"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TRENDS = [
  { id: "increased", icon: "📈", label: "Increased", desc: "More likes, comments, and reach than before", color: "emerald" },
  { id: "same", icon: "➡️", label: "About the same", desc: "No noticeable change in engagement", color: "amber" },
  { id: "decreased", icon: "📉", label: "Decreased", desc: "Less engagement than before", color: "red" },
];

export default function FeedbackPage() {
  const [trend, setTrend] = useState(null);
  const [postsPerWeek, setPostsPerWeek] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!trend) return;
    setLoading(true);

    try {
      await fetch("/api/engagement-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementTrend: trend,
          postsPerWeek: postsPerWeek ? parseInt(postsPerWeek) : null,
          notes: notes || null,
        }),
      });
      setSubmitted(true);
    } catch (e) {
      console.error("Submit failed:", e);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[620px] mx-auto py-4">
      <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Engagement Check-in</h1>
      <p className="text-text-muted text-sm mb-8">
        Help us understand how your LinkedIn content is performing. This takes 30 seconds.
      </p>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Trend selection */}
            <div className="mb-8">
              <label className="text-[11px] font-bold text-text-dim block mb-3 uppercase tracking-wider">
                How has your LinkedIn engagement been this month?
              </label>
              <div className="flex flex-col gap-2.5">
                {TRENDS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTrend(t.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      trend === t.id
                        ? t.color === "emerald"
                          ? "bg-emerald-500/10 border-emerald-500/25"
                          : t.color === "amber"
                          ? "bg-amber-500/10 border-amber-500/25"
                          : "bg-red-500/10 border-red-500/25"
                        : "bg-surface border-border hover:border-border-hi"
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className={`text-sm font-semibold ${
                        trend === t.id ? "text-text-primary" : "text-text-muted"
                      }`}>
                        {t.label}
                      </div>
                      <div className="text-xs text-text-dim mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts per week */}
            <div className="mb-6">
              <label className="text-[11px] font-bold text-text-dim block mb-2 uppercase tracking-wider">
                How many posts per week are you publishing?
              </label>
              <div className="flex gap-2">
                {["1", "2", "3", "4", "5+"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPostsPerWeek(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all ${
                      postsPerWeek === n
                        ? "bg-accent/10 text-accent-light border-accent/25"
                        : "bg-transparent text-text-muted border-border hover:border-border-hi"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-[11px] font-bold text-text-dim block mb-2 uppercase tracking-wider">
                Anything else you've noticed? (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. My story-format posts are getting more comments than usual..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg text-sm bg-bg border border-border text-text-primary outline-none resize-none leading-relaxed focus:border-accent"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!trend || loading}
              className="w-full py-3 rounded-xl text-[15px] font-bold text-white border-none cursor-pointer transition-all"
              style={{
                background: !trend || loading ? "#262936" : "linear-gradient(135deg, #7C6AEF, #9B8DF5)",
                cursor: !trend || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Submitting..." : "Submit Check-in"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">✦</div>
            <h2 className="text-xl font-bold mb-2 text-emerald-400">Check-in recorded</h2>
            <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
              Your engagement data helps us fine-tune voice matching and recommend better content strategies.
            </p>
            <div className="bg-surface border border-border rounded-xl p-5 max-w-xs mx-auto text-left">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-text-dim">Trend</span>
                <span className="text-text-primary font-medium">{TRENDS.find((t) => t.id === trend)?.label}</span>
              </div>
              {postsPerWeek && (
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-text-dim">Posts/week</span>
                  <span className="text-text-primary font-medium">{postsPerWeek}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-text-dim">Recorded</span>
                <span className="text-text-primary font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
