import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseLinkedInArchive, calculatePercentiles } from "@/lib/archive-parser";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Parse the .zip
    const buffer = await file.arrayBuffer();
    const { posts, errors } = await parseLinkedInArchive(buffer);

    if (posts.length === 0) {
      return NextResponse.json({
        error: errors[0] || "No posts found in the archive.",
        errors,
      }, { status: 400 });
    }

    // Calculate percentiles
    const scoredPosts = calculatePercentiles(posts);

    // Insert posts (upsert to handle re-uploads)
    const postsToInsert = scoredPosts.map((p) => ({
      user_id: user.id,
      content: p.content,
      published_at: p.published_at,
      likes: p.likes,
      comments: p.comments,
      shares: p.shares,
      performance_percentile: p.performance_percentile,
    }));

    // Delete existing posts for this user before re-upload
    await supabase.from("posts").delete().eq("user_id", user.id);

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < postsToInsert.length; i += batchSize) {
      const batch = postsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from("posts").insert(batch);
      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json({ error: "Failed to save posts." }, { status: 500 });
      }
    }

    return NextResponse.json({
      postCount: posts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
