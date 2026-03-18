"use client";

import { useState } from "react";

export default function UpgradePrompt({ generationsUsed = 0, maxFree = 3 }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_checkout" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Upgrade failed:", e);
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
