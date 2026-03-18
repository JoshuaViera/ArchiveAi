"use client";

import { useState } from "react";

export default function UpgradePrompt({ generationsUsed = 0, maxFree = 3 }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.alreadyActive) {
        setError("You already have an active subscription. Refresh the page.");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      console.error("Upgrade failed:", e);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (generationsUsed < maxFree) return null;

  return (
    <div className="bg-surface border border-accent/25 rounded-xl p-6 text-center">
      <div className="text-4xl mb-3">✦</div>
      <h3 className="text-lg font-bold text-text-primary mb-2">
        You've used your {maxFree} free generations
      </h3>
      <p className="text-sm text-text-muted mb-5 max-w-md mx-auto">
        Upgrade to unlimited post generation, re-voicing, and full archive analytics.
      </p>
      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="px-8 py-3 rounded-lg text-[15px] font-bold text-white border-none cursor-pointer transition-all w-full max-w-xs"
        style={{
          background: loading ? "#262936" : "linear-gradient(135deg, #7C6AEF, #9B8DF5)",
        }}
      >
        {loading ? "Redirecting to checkout..." : "Upgrade Now"}
      </button>
    </div>
  );
}
