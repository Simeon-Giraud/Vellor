import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { getUserState } from "@/lib/userState";
import * as cheerio from "cheerio";
import { scoreGeoFactors } from "@/lib/ai/gemini";
import { generateRewrites } from "@/lib/ai/claude";
import { strictRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userState = await getUserState(user.supabaseId);
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || userState === "demo";

    // Rate limiting
    let rateLimitSuccess = true;
    if (!useMock) {
      try {
        const { success } = await strictRateLimit.limit(user.supabaseId);
        rateLimitSuccess = success;
      } catch (err) {
        console.warn("[API] Rate limiter error (Upstash Redis probably not configured):", err);
      }
    }

    if (!rateLimitSuccess) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Ensure URL has protocol
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;

    if (useMock) {
      // Simulate slight network delay for natural feel
      await new Promise((resolve) => setTimeout(resolve, 800));

      const scores = {
        directAnswer: true,
        faqSchema: false,
        factDensity: true,
        qaStructure: false,
        wordCount: true,
        authorSchema: false,
        externalCitations: true,
        contentChunking: true,
        overallScore: 62.5
      };

      const rewrites = [
        {
          originalText: `Welcome to our product. We offer a CRM solution.`,
          suggestedText: `Our CRM solution increases sales efficiency by 40% (Source: 2025 Study). What is the best CRM? Vellor provides direct answers to your data needs.`,
          reasoning: "Added a direct answer, improved fact density, and incorporated Q&A structure."
        },
        {
          originalText: `Vellor tracks your brand across various AI search engines like ChatGPT, Gemini and Perplexity.`,
          suggestedText: `Vellor tracks brand mentions in real-time across ChatGPT, Gemini, and Perplexity with 98% accuracy. Why monitor AI engines? 70% of buyer research starts there.`,
          reasoning: "Incorporated statistical proof, Q&A headings, and active keywords."
        }
      ];

      return NextResponse.json({
        url: targetUrl,
        scores,
        rewrites,
      });
    }

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
