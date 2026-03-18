"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard from "@/components/ui/PostCard";
import Spinner from "@/components/ui/Spinner";

// Demo posts for unauthenticated users
const DEMO_POSTS = [
  { id: "demo-1", content: "I lost my biggest client last Tuesday.\n\nNot because of price. Not because of quality.\n\nBecause I forgot to reply to one email.\n\nHere\u2019s what that taught me about the real reason consultants lose clients \u2014 and it has nothing to do with your deliverables.\n\nThe relationship IS the deliverable.\n\nEvery unanswered message is a signal. Every delayed reply says \u201Cyou\u2019re not my priority.\u201D\n\nI\u2019ve since built a 24-hour reply rule into my practice. No exceptions.\n\nSix months later, retention is up 40%.", published_at: "2024-11-14", post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 95, likes: 847, comments: 93, shares: 41 },
  { id: "demo-2", content: "Unpopular opinion: Most consultants don\u2019t have a lead gen problem.\n\nThey have a positioning problem.\n\nIf you can\u2019t explain what you do in one sentence \u2014 to your mom \u2014 you\u2019re not clear enough.\n\nClarity is the ultimate growth hack. Everything else is noise.", published_at: "2024-09-22", post_type: "hot-take", hook_style: "contrarian-claim", performance_percentile: 88, likes: 612, comments: 78, shares: 35 },
  { id: "demo-3", content: "The framework that doubled my consulting rate in 6 months:\n\n1. Track every hour for 2 weeks \u2014 all of them\n2. Calculate your effective hourly rate (revenue \u00F7 ALL hours, not just billable)\n3. Identify the bottom 20% of tasks by rate\n4. Eliminate, delegate, or reprice those tasks\n5. Repeat quarterly\n\nMost consultants are shocked when they see the real number.\n\nThe gap is where your profit is hiding.", published_at: "2024-08-03", post_type: "framework", hook_style: "promise-of-outcome", performance_percentile: 82, likes: 534, comments: 67, shares: 52 },
  { id: "demo-4", content: "Nobody talks about the loneliness of solo consulting.\n\nYou leave a team of 30. Suddenly it\u2019s just you and your laptop.\n\nNo watercooler. No brainstorm sessions. No one to tell you \u201Cgood job.\u201D\n\nI joined a peer mastermind group 6 months in. Changed everything.\n\nIf you\u2019re going solo, budget for community the same way you budget for software.", published_at: "2024-07-08", post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 71, likes: 198, comments: 42, shares: 16 },
];

export default function RevoicePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [revoicing, setRevoicing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Demo mode
      console.log("\uD83C\uDFAD DEMO MODE: Using mock posts for revoice");
      setIsDemoMode(true);
      setPosts(DEMO_POSTS);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("performance_percentile", { ascending: false })
      .limit(20);

    setPosts(data || []);
    setLoading(false);
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoice = async () => {
    if (!selectedPost) return;
    setRevoicing(true);
    setResult("");

    try {
      const body = isDemoMode
        ? { postContent: selectedPost.content, postType: selectedPost.post_type, postDate: selectedPost.published_at, context }
        : { postId: selectedPost.id, context };

      const res = await fetch("/api/revoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(data.output);
      }
    } catch (e) {
      setResult("Re-voicing failed. Please try again.");
    }
    setRevoicing(false);
  };

  if (loading) return <Spinner text="Loading your posts..." />;

  return (
    <div className="max-w-[940px] mx-auto">
      <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Re-voice</h1>
      <p className="text-text-muted text-sm mb-7">
        {selectedPost ? "Update an old post with fresh framing and your current voice." : "Select a post from your archive to re-voice."}
      </p>

      {!selectedPost ? (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-16 text-text-dim">
              No posts in your archive yet. Upload your LinkedIn archive first.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} onRevoice={setSelectedPost} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <button
            onClick={() => { setSelectedPost(null); setResult(""); setContext(""); }}
            className="bg-transparent border-none text-text-muted cursor-pointer text-[13px] p-0 mb-5 block hover:text-text-primary"
          >
            ← Back to post list
          </button>

          <div className={`grid gap-5 ${result && !revoicing ? "grid-cols-2" : "grid-cols-1"}`}>
            {/* Original */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold text-text-dim uppercase tracking-wider">
                  Original · {selectedPost.published_at ? new Date(selectedPost.published_at).toLocaleDateString() : ""}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 uppercase">
                  {selectedPost.post_type || "unclassified"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap m-0">
                {selectedPost.content}
              </p>
              <div className="flex gap-5 mt-4 pt-3.5 border-t border-border">
                {[["♥", selectedPost.likes], ["💬", selectedPost.comments], ["↗", selectedPost.shares]].map(([icon, val], i) => (
                  <span key={i} className="text-[13px] text-text-muted">{icon} <span className="font-semibold">{val}</span></span>
                ))}
              </div>
            </div>

            {/* Re-voiced */}
            {result && !revoicing && (
              <div className="bg-surface border border-accent/25 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold text-accent-light uppercase tracking-wider">✦ Re-voiced · 2026</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRevoice}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-transparent text-text-muted border border-border cursor-pointer"
                    >↻</button>
                    <button
                      onClick={() => copy(result)}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-accent/10 text-accent-light border border-accent/25 cursor-pointer"
                    >{copied ? "✓" : "Copy"}</button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap m-0">{result}</p>
              </div>
            )}
          </div>

          {/* Context input */}
          {!result && !revoicing && (
            <div className="bg-surface border border-border rounded-xl p-6 mt-5">
              <label className="text-[11px] font-bold text-text-dim block mb-2 uppercase tracking-wider">
                Context note (optional)
              </label>
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Update for the AI boom context of 2026..."
                className="w-full px-4 py-3 rounded-lg text-sm bg-bg border border-border text-text-primary outline-none focus:border-accent"
                style={{ fontFamily: "inherit" }}
              />
              <button
                onClick={handleRevoice}
                className="mt-4 w-full py-3 rounded-lg text-[15px] font-bold text-white border-none cursor-pointer"
                style={{ background: "linear-gradient(135deg, #7C6AEF, #9B8DF5)" }}
              >
                Re-voice This Post ✦
              </button>
            </div>
          )}

          {revoicing && <div className="mt-5"><Spinner text="Updating framing & voice for 2026..." /></div>}
        </div>
      )}
    </div>
  );
}
