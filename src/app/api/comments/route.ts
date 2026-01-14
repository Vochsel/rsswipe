import { NextRequest, NextResponse } from "next/server";
import { scrapeComments } from "@/lib/scraper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const result = await scrapeComments(url);
  return NextResponse.json(result);
}
