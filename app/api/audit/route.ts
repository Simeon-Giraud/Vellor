import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import * as cheerio from "cheerio";
import { scoreGeoFactors } from "@/lib/ai/gemini";
import { generateRewrites } from "@/lib/ai/claude";
import { strictRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const { success } = await strictRateLimit.limit(user.supabaseId);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Ensure URL has protocol
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;

    // 1. Fetch HTML
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Vellor-Content-Auditor/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
    }

    const html = await response.text();

    // 2. Extract Text using Cheerio
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, img, svg, video").remove();
    const textContent = $("body").text().replace(/\s+/g, " ").trim();

    if (!textContent) {
      return NextResponse.json({ error: "No readable content found on page" }, { status: 400 });
    }

    // 3. Score GEO Factors (Gemini Flash)
    const scores = await scoreGeoFactors(targetUrl, textContent);

    // 4. Generate Rewrites (Claude Sonnet)
    const rewrites = await generateRewrites(targetUrl, textContent, scores);

    return NextResponse.json({
      url: targetUrl,
      scores,
      rewrites,
    });
  } catch (error: any) {
    console.error("[Audit API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
