"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Pill from "@/components/ui/Pill";
import Spinner from "@/components/ui/Spinner";
import UpgradePrompt from "@/components/UpgradePrompt";
import VoiceProfileCard from "@/components/ui/VoiceProfileCard";

const FORMATS = ["Story", "Framework", "Hot Take", "Listicle", "Question"];

// Mock voice profile for demo mode
const DEMO_VOICE_PROFILE = {
  id: "demo-user-id",
  user_id: "demo-user-id",
  confidence_level: "full",
  post_count_analyzed: 85,
  profile_summary: "You have a conversational, vulnerability-driven style focused on actionable consulting insights with data-backed examples.",
  traits: ["Actionable", "Data-driven", "Conversational", "Vulnerable"],
  structural_patterns: {
    topFormats: [
      { type: "Hook-driven Story", avgPercentile: 85, pct: 35 },
      { type: "Framework", avgPercentile: 78, pct: 28 },
      { type: "Hot Take", avgPercentile: 72, pct: 22 },
    ],
    toneCharacteristics: ["Vulnerable", "Conversational", "Direct"],
    commonThemes: ["Entrepreneurship", "Leadership", "Business Growth"],
  },
};

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Story");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [voiceProfile, setVoiceProfile] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabase = createClient();

  // Load voice profile on mount
  useEffect(() => {
    loadVoiceProfile();
  }, []);

  async function loadVoiceProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Demo mode: use mock profile
        console.log("🎭 DEMO MODE: Using mock voice profile");
        setIsDemoMode(true);
        setVoiceProfile(DEMO_VOICE_PROFILE);
        setVoiceLoading(false);
        return;
      }

      const { data } = await supabase
        .from("voice_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setVoiceProfile(data || DEMO_VOICE_PROFILE);
    } catch (err) {
      console.error("Error loading voice profile:", err);
      // Fall back to demo profile on error
      setVoiceProfile(DEMO_VOICE_PROFILE);
    } finally {
      setVoiceLoading(false);
    }
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, format }),
      });
      const data = await res.json();

      if (data.error) {
        if (data.upgrade) {
          setGenerationsUsed(data.generationsUsed || 3);
        }
        setError(data.error);
      } else {
        setResult(data.output);
        setGenerationsUsed(data.generationsUsed || 0);
      }
    } catch (e) {
      setError("Generation failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Generate New Post</h1>
        <p className="text-text-muted text-sm">Enter a topic and we'll write it in your voice.</p>
      </div>

      <UpgradePrompt generationsUsed={generationsUsed} maxFree={3} />

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
        {/* Left: Voice Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:sticky lg:top-7 lg:h-fit"
        >
          {voiceLoading ? (
            <div className="bg-surface border border-border rounded-xl p-6 h-[400px] flex items-center justify-center">
              <Spinner text="Loading your voice..." />
            </div>
          ) : (
            <VoiceProfileCard voiceProfile={voiceProfile} />
          )}
        </motion.div>

        {/* Right: Generation Interface */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Input Section */}
          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <label className="text-[11px] font-bold text-text-dim block mb-2.5 uppercase tracking-wider">
              Topic or idea
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Why most consultants underprice their services and how to fix it..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg text-sm bg-bg border border-border text-text-primary outline-none resize-none leading-relaxed focus:border-accent transition-colors"
              style={{ fontFamily: "inherit" }}
            />

            <label className="text-[11px] font-bold text-text-dim block mt-5 mb-3 uppercase tracking-wider">
              Format
            </label>
            <div className="flex gap-2 flex-wrap mb-5">
              {FORMATS.map((f) => (
                <Pill key={f} text={f} active={format === f} onClick={() => setFormat(f)} />
              ))}
            </div>

            {/* Smart recommendation */}
            <motion.div
              className="mb-5 px-4 py-3 rounded-lg bg-accent/10 border border-accent/25 text-[13px] text-accent-light leading-relaxed"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-semibold">✦ Recommendation:</span>{" "}
              {format === "Story"
                ? "Your hook-driven stories get the best engagement. Perfect choice!"
                : `Your "${format}" posts perform well. Try "Story" format to maximize reach.`}
            </motion.div>

            {/* Generate button */}
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              whileHover={!loading && topic.trim() ? { scale: 1.02 } : {}}
              whileTap={!loading && topic.trim() ? { scale: 0.98 } : {}}
              className="w-full py-3 rounded-lg text-[15px] font-bold text-white border-none cursor-pointer transition-all"
              style={{
                background:
                  loading || !topic.trim()
                    ? "#262936"
                    : "linear-gradient(135deg, #7C6AEF, #9B8DF5)",
                cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-lg">⚡</span>
                  Generating in your voice...
                </span>
              ) : (
                "Generate Post ✦"
              )}
            </motion.button>
          </div>

          {/* Error state */}
          <AnimatePresence>
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-sm text-red-400 mb-6"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result section */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Spinner text="Matching your voice profile..." />
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-surface border border-accent/25 rounded-xl p-6 overflow-hidden relative"
              >
                {/* Accent gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10" />

                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-accent-light uppercase tracking-wider">✦ Generated Post</span>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={handleGenerate}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-transparent text-text-muted border border-border cursor-pointer hover:text-text-primary hover:border-text-primary transition-all"
                    >
                      ↻ Regenerate
                    </motion.button>
                    <motion.button
                      onClick={() => copy(result)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent/10 text-accent-light border border-accent/25 cursor-pointer hover:bg-accent/20 transition-all"
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </motion.button>
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-text-primary whitespace-pre-wrap m-0">{result}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
