"use client";

import { motion } from "framer-motion";

export default function StatCard({ label, value, sub }) {
  return (
    <motion.div
      className="bg-gradient-to-br from-surface to-surface-2 border border-border rounded-xl px-6 py-5 flex-1 min-w-[155px] overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ borderColor: "rgba(124, 106, 239, 0.3)", scale: 1.02 }}
    >
      {/* Subtle accent gradient */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="text-[11px] text-text-dim uppercase tracking-wider mb-2 font-semibold">
          {label}
        </div>
        <motion.div
          className="text-3xl font-bold text-text-primary tracking-tight"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {value}
        </motion.div>
        {sub && (
          <div className="text-xs text-text-dim mt-1.5">{sub}</div>
        )}
      </div>
    </motion.div>
  );
}
