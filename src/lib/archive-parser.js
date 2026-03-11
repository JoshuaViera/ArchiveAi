import JSZip from "jszip";
import Papa from "papaparse";

/**
 * Parse a LinkedIn data export .zip file.
 *
 * LinkedIn's GDPR export contains a Shares.csv file with post history.
 * The CSV structure varies by export version, so we handle multiple formats.
 *
 * @param {ArrayBuffer} zipBuffer - The raw .zip file
 * @returns {{ posts: Array, errors: string[] }}
 */
export async function parseLinkedInArchive(zipBuffer) {
  const errors = [];

  // 1. Unzip
  let zip;
  try {
    zip = await JSZip.loadAsync(zipBuffer);
  } catch (e) {
    return { posts: [], errors: ["Could not read the .zip file. Make sure this is a valid LinkedIn data export."] };
  }

  // 2. Find Shares.csv (may be at root or in a subfolder)
  let sharesFile = null;
  const possiblePaths = ["Shares.csv", "shares.csv", "Content/Shares.csv"];

  for (const path of possiblePaths) {
    if (zip.files[path]) {
      sharesFile = zip.files[path];
      break;
    }
  }

  // Fallback: search all files
  if (!sharesFile) {
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.toLowerCase().endsWith("shares.csv") && !file.dir) {
        sharesFile = file;
        break;
      }
    }
  }

  if (!sharesFile) {
    return {
      posts: [],
      errors: [
        "Could not find Shares.csv in the archive. Make sure you downloaded your full LinkedIn data export (Settings → Get a copy of your data → select all).",
      ],
    };
  }

  // 3. Parse CSV
  const csvText = await sharesFile.async("text");
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    errors.push(`CSV parsing warnings: ${parsed.errors.length} rows had issues.`);
  }

  // 4. Extract posts
  // LinkedIn CSVs use varying column names across export versions
  const posts = [];

  for (const row of parsed.data) {
    const content =
      row["sharecommentary"] ||
      row["share commentary"] ||
      row["commentary"] ||
      row["content"] ||
      row["text"] ||
      "";

    const dateStr =
      row["date"] ||
      row["sharedate"] ||
      row["share date"] ||
      row["created"] ||
      row["published"] ||
      "";

    // Skip empty posts, shares without commentary, and media-only shares
    if (!content.trim() || content.trim().length < 20) continue;

    const publishedAt = parseLinkedInDate(dateStr);

    posts.push({
      content: content.trim(),
      published_at: publishedAt,
      // LinkedIn export doesn't include engagement data
      // We'll set these to 0 and note it in the UI
      likes: 0,
      comments: 0,
      shares: 0,
    });
  }

  if (posts.length === 0) {
    errors.push("No posts found in the archive. The Shares.csv file was empty or contained only shared links without commentary.");
  }

  return { posts, errors };
}

/**
 * Parse dates from LinkedIn's various export formats.
 */
function parseLinkedInDate(dateStr) {
  if (!dateStr) return null;

  // Try ISO format first
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso.toISOString();

  // LinkedIn sometimes uses "Mon DD, YYYY" or "YYYY-MM-DD HH:MM:SS"
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/,
  ];

  for (const fmt of formats) {
    const match = dateStr.match(fmt);
    if (match) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
    }
  }

  return null;
}

/**
 * Calculate performance percentile for each post in a set.
 * Uses a simple engagement score: likes + (comments * 2) + (shares * 3).
 */
export function calculatePercentiles(posts) {
  const scored = posts.map((p) => ({
    ...p,
    engagementScore: p.likes + p.comments * 2 + p.shares * 3,
  }));

  scored.sort((a, b) => a.engagementScore - b.engagementScore);

  return scored.map((p, i) => ({
    ...p,
    performance_percentile: Math.round((i / (scored.length - 1 || 1)) * 100),
  }));
}
