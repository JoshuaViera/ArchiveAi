"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard from "@/components/ui/PostCard";
import Pill from "@/components/ui/Pill";
import Spinner from "@/components/ui/Spinner";

const FILTER_TYPES = ["All", "hook-driven-story", "framework", "hot-take", "listicle", "question"];
const FILTER_LABELS = { "All": "All", "hook-driven-story": "Story", "framework": "Framework", "hot-take": "Hot Take", "listicle": "Listicle", "question": "Question" };

export default function ArchivePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("percentile");
  const [filterType, setFilterType] = useState("All");

  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("performance_percentile", { ascending: false });

    setPosts(data || []);
    setLoading(false);
  }

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
        // Trigger analysis
        await fetch("/api/archive/analyze", { method: "POST" });
        setUploadMsg(`Done! ${data.postCount} posts analyzed.`);
        loadPosts();
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

  return (
    <div className="max-w-[940px] mx-auto">
      <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Archive</h1>
      <p className="text-text-muted text-sm mb-6">
        {posts.length > 0 ? `${posts.length} posts · searchable, sortable, ready to re-voice.` : "Upload your LinkedIn archive to get started."}
      </p>

      {/* Upload area */}
      {posts.length === 0 && !loading && (
        <div className="bg-surface border-2 border-dashed border-border rounded-xl p-12 text-center mb-8">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold mb-2">Upload your LinkedIn archive</h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            Go to LinkedIn → Settings → Get a copy of your data → Download. Then upload the .zip file here.
          </p>
          <label className="inline-block px-8 py-3 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #7C6AEF, #9B8DF5)" }}>
            {uploading ? "Processing..." : "Choose .zip file"}
            <input type="file" accept=".zip" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          {uploadMsg && <p className="text-sm text-text-muted mt-4">{uploadMsg}</p>}
        </div>
      )}

      {loading && <Spinner text="Loading your archive..." />}

      {/* Search & sort */}
      {posts.length > 0 && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your posts..."
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg text-sm bg-bg border border-border text-text-primary outline-none focus:border-accent"
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
            <label className="px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-surface border border-border text-text-muted cursor-pointer hover:text-text-primary">
              + Upload more
              <input type="file" accept=".zip" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          <div className="flex gap-2 mb-5 flex-wrap">
            {FILTER_TYPES.map((t) => (
              <Pill key={t} text={FILTER_LABELS[t]} active={filterType === t} onClick={() => setFilterType(t)} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-text-dim">No posts match your filters.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
