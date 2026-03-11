"use client";

import { useState } from "react";
import Pill from "@/components/ui/Pill";
import Spinner from "@/components/ui/Spinner";
import UpgradePrompt from "@/components/UpgradePrompt";

const FORMATS = ["Story", "Framework", "Hot Take", "Listicle", "Question"];

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Story");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);

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
    <div className="max-w-[700px] mx-auto">
      <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Generate New Post</h1>
      <p className="text-text-muted text-sm mb-7">Enter a topic or rough idea. We'll write it in your voice.</p>

      <UpgradePrompt generationsUsed={generationsUsed} maxFree={3} />

      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <label className="text-[11px] font-bold text-text-dim block mb-2 uppercase tracking-wider">
          Topic or idea
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Why most consultants underprice their services and how to fix it..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg text-sm bg-bg border border-border text-text-primary outline-none resize-y leading-relaxed focus:border-accent"
          style={{ fontFamily: "inherit" }}
        />

        <label className="text-[11px] font-bold text-text-dim block mt-5 mb-2.5 uppercase tracking-wider">
          Format
        </label>
        <div className="flex gap-2 flex-wrap">
          {FORMATS.map((f) => (
            <Pill key={f} text={f} active={format === f} onClick={() => setFormat(f)} />
          ))}
        </div>

        <div className="mt-4 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/25 text-[13px] text-accent-light leading-relaxed">
          ✦ Your hook-driven stories average the highest engagement.{" "}
          {format === "Story" ? "Great choice." : `Consider trying "Story" format for best results.`}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="mt-4 w-full py-3 rounded-lg text-[15px] font-bold text-white border-none cursor-pointer transition-all"
          style={{
            background: loading || !topic.trim() ? "#262936" : "linear-gradient(135deg, #7C6AEF, #9B8DF5)",
            cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating in your voice..." : "Generate Post ✦"}
        </button>
      </div>

      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading && <Spinner text="Matching your voice profile..." />}

      {result && !loading && (
        <div className="bg-surface border border-accent/25 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-accent-light uppercase tracking-wider">✦ Generated Post</span>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-transparent text-text-muted border border-border cursor-pointer hover:text-text-primary"
              >
                ↻ Regenerate
              </button>
              <button
                onClick={() => copy(result)}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-accent/10 text-accent-light border border-accent/25 cursor-pointer"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-text-primary whitespace-pre-wrap m-0">{result}</p>
        </div>
      )}
    </div>
  );
}
