import { NextResponse } from "next/server";

export async function updateSession(request) {
  // Auth disabled for demo mode — pass through all requests
  return NextResponse.next({ request });
}
