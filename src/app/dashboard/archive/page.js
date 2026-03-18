"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/ui/PostCard";
import Pill from "@/components/ui/Pill";
import Spinner from "@/components/ui/Spinner";

const FILTER_TYPES = ["All", "hook-driven-story", "framework", "hot-take", "listicle", "question"];
const FILTER_LABELS = { "All": "All", "hook-driven-story": "Story", "framework": "Framework", "hot-take": "Hot Take", "listicle": "Listicle", "question": "Question" };

// ─── DEMO ARCHIVE ─────────────────────────────────────────
const DEMO_POSTS = [
  {
    id: "1", content: "I lost my biggest client last Tuesday.\n\nNot because of price. Not because of quality.\n\nBecause I forgot to reply to one email.\n\nHere\u2019s what that taught me about the real reason consultants lose clients \u2014 and it has nothing to do with your deliverables.\n\nThe relationship IS the deliverable.\n\nEvery unanswered message is a signal. Every delayed reply says \u201Cyou\u2019re not my priority.\u201D\n\nI\u2019ve since built a 24-hour reply rule into my practice. No exceptions. Even if the reply is \u201CGot it \u2014 will get back to you Thursday.\u201D\n\nSix months later, retention is up 40%.\n\nThe best business development strategy isn\u2019t a better pitch deck. It\u2019s a faster inbox.",
    published_at: "2025-11-14", likes: 847, comments: 93, shares: 41, post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 99,
  },
  {
    id: "2", content: "Unpopular opinion: Most consultants don\u2019t have a lead gen problem.\n\nThey have a positioning problem.\n\nIf you can\u2019t explain what you do in one sentence \u2014 to your mom \u2014 you\u2019re not clear enough.\n\nClarity is the ultimate growth hack. Everything else is noise.",
    published_at: "2025-09-22", likes: 612, comments: 78, shares: 35, post_type: "hot-take", hook_style: "contrarian-claim", performance_percentile: 96,
  },
  {
    id: "3", content: "The framework that doubled my consulting rate in 6 months:\n\n1. Track every hour for 2 weeks \u2014 all of them\n2. Calculate your effective hourly rate (revenue \u00F7 ALL hours, not just billable)\n3. Identify the bottom 20% of tasks by rate\n4. Eliminate, delegate, or reprice those tasks\n5. Repeat quarterly\n\nMost consultants are shocked when they see the real number. I was billing $200/hr but my effective rate was $47/hr.\n\nThe gap is where your profit is hiding.",
    published_at: "2025-08-03", likes: 534, comments: 67, shares: 52, post_type: "framework", hook_style: "promise-of-outcome", performance_percentile: 94,
  },
  {
    id: "4", content: "I interviewed 20 consultants making $500K+ per year.\n\nEvery single one had the same habit:\n\nThey write. Publicly. Every week.\n\nNot because they love writing.\n\nBecause writing is the only scalable way to build trust with people you haven\u2019t met yet.\n\nYour network is finite. Your content is not.\n\nIf you\u2019re a consultant not posting on LinkedIn, you\u2019re leaving money on the table. Not maybe. Definitely.",
    published_at: "2025-06-17", likes: 489, comments: 55, shares: 29, post_type: "hook-driven-story", hook_style: "data-point", performance_percentile: 91,
  },
  {
    id: "5", content: "3 things I wish I knew before going solo:\n\n\u2192 Your first 3 clients will come from your last employer\u2019s network. Plan for that.\n\u2192 Pricing is a story, not a spreadsheet. The narrative around your rate matters more than the number.\n\u2192 You\u2019ll spend 40% of your time on non-billable work. Build that into your rate from day one.\n\nThe consultants who struggle aren\u2019t less talented. They\u2019re less prepared for the business side.",
    published_at: "2025-05-01", likes: 421, comments: 48, shares: 31, post_type: "listicle", hook_style: "personal-anecdote", performance_percentile: 88,
  },
  {
    id: "6", content: "What\u2019s the one thing you changed in your consulting practice this year that had the biggest impact?\n\nFor me: I stopped sending proposals. I send 1-page scope docs instead.\n\nClose rate went from 30% to 65%.\n\nSimpler is almost always better.",
    published_at: "2025-03-28", likes: 378, comments: 112, shares: 18, post_type: "question", hook_style: "question", performance_percentile: 85,
  },
  {
    id: "7", content: "Your proposal is too long.\n\nI know because mine was too.\n\n15 pages. Custom graphics. A table of contents.\n\nNobody read past page 2.\n\nNow I send a 1-page scope doc: problem, approach, timeline, price. That\u2019s it.\n\nMy close rate doubled.\n\nThe length of your proposal is inversely proportional to your confidence in what you\u2019re selling.",
    published_at: "2025-02-10", likes: 356, comments: 44, shares: 27, post_type: "hook-driven-story", hook_style: "contrarian-claim", performance_percentile: 82,
  },
  {
    id: "8", content: "I raised my rate by 50% last month.\n\nLost zero clients.\n\nHere\u2019s the exact script I used:\n\n\u201CHey [name], I\u2019m updating my rates for 2025. Starting next month, my rate moves to $X. I wanted to give you advance notice because I value our relationship. If you\u2019d like to lock in the current rate for 90 days, I\u2019m happy to do that.\u201D\n\n100% of clients chose the 90-day lock. And when it expired, nobody left.\n\nMost consultants wait way too long to raise prices. Stop waiting.",
    published_at: "2025-01-05", likes: 298, comments: 39, shares: 22, post_type: "hook-driven-story", hook_style: "data-point", performance_percentile: 76,
  },
  {
    id: "9", content: "The best consultants I know don\u2019t sell hours.\n\nThey sell outcomes.\n\nHours have a ceiling. Outcomes don\u2019t.\n\nIf your client\u2019s problem is worth $500K to solve, your fee should reflect the value \u2014 not the time.",
    published_at: "2024-11-20", likes: 267, comments: 35, shares: 19, post_type: "hot-take", hook_style: "contrarian-claim", performance_percentile: 72,
  },
  {
    id: "10", content: "What\u2019s the biggest mistake you made in your first year of consulting?\n\nI\u2019ll go first: I said yes to everything.\n\nEvery project. Every client. Every timeline.\n\nIt nearly broke me. Saying no is a skill \u2014 and it\u2019s the most profitable one you\u2019ll learn.",
    published_at: "2024-09-15", likes: 234, comments: 88, shares: 14, post_type: "question", hook_style: "question", performance_percentile: 68,
  },
  {
    id: "11", content: "Nobody talks about the loneliness of solo consulting.\n\nYou leave a team of 30. Suddenly it\u2019s just you and your laptop.\n\nNo watercooler. No brainstorm sessions. No one to tell you \u201Cgood job.\u201D\n\nI joined a peer mastermind group 6 months in. Changed everything.\n\nIf you\u2019re going solo, budget for community the same way you budget for software.",
    published_at: "2024-07-08", likes: 198, comments: 42, shares: 16, post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 61,
  },
  {
    id: "12", content: "How I structure my week as a solo consultant:\n\nMonday: Deep work (client deliverables only)\nTuesday: Calls and meetings\nWednesday: Deep work\nThursday: Business development + content\nFriday: Admin, invoicing, planning next week\n\nThe key: client work never touches Thursday or Friday. That\u2019s how you build a business, not just a job.",
    published_at: "2024-05-20", likes: 178, comments: 31, shares: 20, post_type: "framework", hook_style: "promise-of-outcome", performance_percentile: 55,
  },
];

export default function ArchivePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("percentile");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    // Load demo posts immediately
    setPosts(DEMO_POSTS);
    setLoading(false);
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg("Processing your archive...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/archive/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        setUploadMsg(`Error: ${data.error}`);
      } else {
        setUploadMsg(`Uploaded ${data.postCount} posts. Analyzing...`);
        await fetch("/api/archive/analyze", { method: "POST" });
        setUploadMsg(`Done! ${data.postCount} posts analyzed.`);
      }
    } catch (err) {
      setUploadMsg("Upload failed. Please try again.");
    }
    setUploading(false);
  }

  const filtered = posts
    .filter((p) => filterType === "All" || p.post_type === filterType)
    .filter((p) => !search || p.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "percentile") return (b.performance_percentile || 0) - (a.performance_percentile || 0);
      if (sortBy === "recent") return new Date(b.published_at) - new Date(a.published_at);
      if (sortBy === "comments") return b.comments - a.comments;
      if (sortBy === "shares") return b.shares - a.shares;
      return b.likes - a.likes;
    });

  if (loading) return <Spinner text="Loading your archive..." />;

  return (
    <div className="max-w-[940px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Archive</h1>
          <p className="text-text-muted text-sm m-0">
            {posts.length} posts · searchable, sortable, ready to re-voice.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-surface border border-border text-text-muted cursor-pointer hover:text-text-primary hover:border-border-hi transition-all">
          📁 Upload archive
          <input type="file" accept=".zip" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {uploadMsg && (
        <div className="bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-muted mb-5">
          {uploadMsg}
        </div>
      )}

      {/* Search & sort */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your posts..."
          className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg text-sm bg-bg border border-border text-text-primary outline-none focus:border-accent"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-[13px] bg-surface border border-border text-text-primary cursor-pointer"
        >
          <option value="percentile">Top performing</option>
          <option value="recent">Most recent</option>
          <option value="likes">Most likes</option>
          <option value="comments">Most comments</option>
          <option value="shares">Most shares</option>
        </select>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTER_TYPES.map((t) => (
          <Pill key={t} text={FILTER_LABELS[t]} active={filterType === t} onClick={() => setFilterType(t)} />
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: "Total Posts", value: posts.length },
          { label: "Top 10%", value: posts.filter((p) => p.performance_percentile >= 90).length },
          { label: "Most Engaged", value: `${Math.max(...posts.map((p) => p.comments))} comments` },
          { label: "Best Format", value: "Story" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-4 py-2.5 flex-1 min-w-[120px]">
            <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold">{stat.label}</div>
            <div className="text-sm font-bold text-text-primary mt-0.5">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Post list */}
      <div className="flex flex-col gap-3">
        {filtered.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-dim">No posts match your filters.</div>
        )}
      </div>
    </div>
  );
}
