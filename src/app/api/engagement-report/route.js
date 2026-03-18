import { NextResponse } from "next/server";

// In-memory store for demo mode (no DB required)
const reports = [];

export async function POST(request) {
  try {
    const { engagementTrend, postsPerWeek, notes } = await request.json();

    if (!engagementTrend || !["increased", "decreased", "same"].includes(engagementTrend)) {
      return NextResponse.json({ error: "Invalid engagement trend." }, { status: 400 });
    }

    const report = {
      id: `report-${Date.now()}`,
      engagement_trend: engagementTrend,
      posts_per_week: postsPerWeek || null,
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    reports.push(report);
    console.log("📊 Engagement report saved:", report);

    return NextResponse.json({
      success: true,
      report,
      totalReports: reports.length,
    });
  } catch (e) {
    console.error("Engagement report error:", e);
    return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ reports, total: reports.length });
}
