"use client";

import { motion } from "framer-motion";

export default function VoiceProfileCard({ voiceProfile }) {
  if (!voiceProfile) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🎤</div>
          <h3 className="text-base font-semibold mb-1">No Voice Profile Yet</h3>
          <p className="text-text-dim text-sm">Upload your LinkedIn archive to build your voice profile.</p>
        </div>
      </div>
    );
  }

  const confidence = voiceProfile?.confidence_level || "none";
  const postCount = voiceProfile?.post_count_analyzed || 0;
  const confidencePct =
    confidence === "full" ? 92 : confidence === "limited" ? 55 : confidence === "bootstrap-only" ? 30 : 0;

  const confidenceColor =
    confidence === "full" ? "#34D399" : confidence === "limited" ? "#FBBF24" : "#878BA0";

  const confidenceLabel =
    confidence === "full" ? "Full" : confidence === "limited" ? "Limited" : "Building";

  // Extract structural patterns
  const patterns = voiceProfile?.structural_patterns || {};
  const topFormats = patterns.topFormats || [];
  const toneCharacteristics = patterns.toneCharacteristics || [];
  const commonThemes = patterns.commonThemes || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-surface to-surface-2 border border-border rounded-xl p-5 md:p-6 overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Accent gradient blob in background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -z-10" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-5 md:mb-6">
          <div className="flex items-center justify-between mb-3 gap-2.5 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="text-2xl md:text-3xl">🎤</div>
              <h3 className="text-base md:text-lg font-semibold tracking-tight">Your Voice</h3>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-text-dim uppercase tracking-wider px-2.5 py-1.5 bg-surface rounded-lg whitespace-nowrap">
              {confidenceLabel} Confidence
            </span>
          </div>
          <p className="text-text-dim text-sm">{postCount} posts analyzed</p>
        </motion.div>

        {/* Confidence meter */}
        <motion.div variants={itemVariants} className="mb-5 md:mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] md:text-[11px] font-bold text-text-dim uppercase tracking-wider">
              Confidence Level
            </label>
            <span className="text-[12px] md:text-[13px] font-semibold text-text-primary">{confidencePct}%</span>
          </div>
          <div className="h-2 bg-bg rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: confidenceColor }}
              initial={{ width: 0 }}
              animate={{ width: `${confidencePct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Voice characteristics grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5 md:gap-3 mb-5 md:mb-6">
          {/* Top formats */}
          <div className="bg-surface rounded-lg p-3 md:p-3.5 border border-border/50">
            <div className="text-[9px] md:text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">
              Top Formats
            </div>
            <div className="space-y-1">
              {topFormats.length > 0 ? (
                topFormats.slice(0, 2).map((format, idx) => (
                  <div key={idx} className="text-xs md:text-sm font-medium text-text-primary">
                    • {format.type || format}
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-text-dim italic">Building...</div>
              )}
            </div>
          </div>

          {/* Tone characteristics */}
          <div className="bg-surface rounded-lg p-3 md:p-3.5 border border-border/50">
            <div className="text-[9px] md:text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">
              Tone
            </div>
            <div className="space-y-1">
              {toneCharacteristics.length > 0 ? (
                toneCharacteristics.slice(0, 2).map((tone, idx) => (
                  <div key={idx} className="text-xs md:text-sm font-medium text-text-primary">
                    • {tone}
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-text-dim italic">Analyzing...</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Common themes */}
        {commonThemes.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="text-[9px] md:text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2.5">
              Common Themes
            </div>
            <div className="flex flex-wrap gap-2">
              {commonThemes.slice(0, 3).map((theme, idx) => (
                <motion.span
                  key={idx}
                  className="px-2.5 md:px-3 py-1 bg-accent/10 border border-accent/25 text-accent-light text-[11px] md:text-xs font-medium rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {theme}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
