"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard from "@/components/ui/PostCard";
import Spinner from "@/components/ui/Spinner";

export default function RevoicePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [revoicing, setRevoicing] = useState(false);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      const res = await fetch("/api/revoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selectedPost.id, context }),
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
