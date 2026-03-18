"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import BarChart from "@/components/ui/BarChart";
import PostCard from "@/components/ui/PostCard";
import VoiceProfileCard from "@/components/ui/VoiceProfileCard";

export default function DashboardContent({
  totalPosts,
  dateRange,
  bestPercentile,
  voiceProfile,
  formatStats,
  topPosts,
  demoMode,
  bootstrapMode,
}) {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Quick action cards
  const quickActions = [
    {
      href: "/dashboard/generate",
      icon: "✦",
      label: "Generate",
      desc: "Create new posts",
      color: "from-accent to-accent-light",
    },
    {
      href: "/dashboard/revoice",
      icon: "↻",
      label: "Re-voice",
      desc: "Adapt existing posts",
      color: "from-violet-500 to-purple-500",
    },
    {
      href: "/dashboard/archive",
      icon: "☰",
      label: "Browse",
      desc: "View your archive",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <motion.div
      className="w-full max-w-[1200px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-7 md:mb-9">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Dashboard</h1>
        <p className="text-text-muted text-sm">Your LinkedIn content intelligence at a glance.</p>
      </motion.div>

      {/* Demo banner */}
      {demoMode && (
        <motion.div
          variants={itemVariants}
          className="bg-accent/10 border border-accent/25 rounded-xl px-5 py-4 mb-6 flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <span className="text-sm font-semibold text-accent-light">You're viewing a demo</span>
            <p className="text-xs text-text-muted m-0 mt-0.5">Sign up to build your own voice profile and start generating posts.</p>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg text-xs font-bold text-white no-underline"
            style={{ background: "linear-gradient(135deg, #7C6AEF, #9B8DF5)" }}
          >
            Get started
          </Link>
        </motion.div>
      )}

      {/* Bootstrap banner */}
      {bootstrapMode && (
        <motion.div
          variants={itemVariants}
          className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-5 py-4 mb-6 flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <span className="text-sm font-semibold text-amber-400">Bootstrap voice profile active</span>
            <p className="text-xs text-text-muted m-0 mt-0.5">Upload your LinkedIn archive to upgrade to full confidence and unlock analytics.</p>
          </div>
          <Link
            href="/dashboard/archive"
            className="px-5 py-2 rounded-lg text-xs font-bold text-white no-underline bg-amber-500 hover:bg-amber-600 transition-colors"
          >
            Upload archive
          </Link>
        </motion.div>
      )}

      {/* Key Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-3.5 mb-7 md:mb-8">
        <StatCard label="Posts Analyzed" value={totalPosts} sub={dateRange} />
        <StatCard label="Best Format" value="Story" sub="Highest avg engagement" />
        <StatCard label="Top Percentile" value={`${bestPercentile}th`} sub="Your best post" />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-3.5 mb-7 md:mb-8">
        {quickActions.map((action, idx) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={action.href}
              className="block p-5 rounded-xl border border-border bg-surface hover:border-accent/50 transition-all no-underline"
            >
              <div className={`text-3xl mb-3 bg-gradient-to-br ${action.color} bg-clip-text text-transparent`}>
                {action.icon}
              </div>
              <div className="font-semibold text-text-primary mb-1">{action.label}</div>
              <div className="text-xs text-text-muted">{action.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Voice Profile */}
      {voiceProfile && (
        <motion.div variants={itemVariants} className="mb-7 md:mb-8">
          <VoiceProfileCard voiceProfile={voiceProfile} />
        </motion.div>
      )}

      {/* Engagement chart */}
      {formatStats && formatStats.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-surface border border-border rounded-xl p-5 md:p-6 mb-7 md:mb-8 overflow-x-auto"
        >
          <h3 className="text-base font-semibold mb-4">Engagement by Post Format</h3>
          <div className="min-w-full">
            <BarChart data={formatStats} />
          </div>
        </motion.div>
      )}

      {/* Top posts */}
      {topPosts && topPosts.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold m-0">🔥 Your Best Performing Posts</h3>
            <Link href="/dashboard/archive" className="text-accent-light text-[13px] font-semibold no-underline hover:opacity-80 transition-opacity">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {topPosts.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                whileHover={{ x: 8 }}
              >
                <PostCard post={p} compact />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
