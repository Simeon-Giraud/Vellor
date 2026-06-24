import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { getUserState } from "@/lib/userState";
import * as cheerio from "cheerio";
import { scoreGeoFactors } from "@/lib/ai/gemini";
import { generateRewrites } from "@/lib/ai/claude";
import { strictRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function extractDateModified(html: string): string | null {
  try {
    const $ = cheerio.load(html);
    
    // 1. Try JSON-LD script tags
    let dateStr: string | null = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).text();
        const match = jsonText.match(/"dateModified"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          dateStr = match[1];
          return false; // break loop
        }
      } catch (_) {}
    });
    
    if (dateStr) return dateStr;

    // 2. Try HTML meta tags
    const metaTags = [
      'meta[property="article:modified_time"]',
      'meta[name="dateModified"]',
      'meta[itemprop="dateModified"]',
      'meta[name="revised"]',
      'meta[name="last-modified"]'
    ];

    for (const selector of metaTags) {
      const val = $(selector).attr('content');
      if (val) {
        return val;
      }
    }
  } catch (e) {
    console.error("Failed to parse dateModified:", e);
  }
  return null;
}

function getRootDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return url;
  }
}

async function fetchWithTimeout(url: string, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Vellor-Content-Auditor/1.0",
      }
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function parseRobotsTxt(content: string, botsToCheck: string[]): Record<string, boolean> {
  const allowed: Record<string, boolean> = {};
  botsToCheck.forEach(bot => allowed[bot] = true); // Default to allowed

  const lines = content.split('\n').map(l => l.trim().toLowerCase());
  let currentAgents: string[] = [];

  for (const line of lines) {
    if (line.startsWith('#') || !line) continue;

    if (line.startsWith('user-agent:')) {
      const agent = line.replace('user-agent:', '').trim();
      if (currentAgents.length > 0 && !lines[lines.indexOf(line) - 1]?.startsWith('user-agent:')) {
        currentAgents = []; // Reset if we started a new block and previous wasn't user-agent
      }
      currentAgents.push(agent);
    } else if (line.startsWith('disallow:')) {
      const path = line.replace('disallow:', '').trim();
      if (path === '/') {
        // If disallowed root path
        currentAgents.forEach(agent => {
          if (agent === '*') {
            botsToCheck.forEach(bot => {
              allowed[bot] = false;
            });
          } else {
            const matchingBot = botsToCheck.find(bot => bot.toLowerCase() === agent);
            if (matchingBot) {
              allowed[matchingBot] = false;
            }
          }
        });
      }
    }
  }
  return allowed;
}

function generateLlmsTxtContent(url: string): string {
  try {
    const parsed = new URL(url);
    const brandName = parsed.hostname.replace('www.', '').split('.')[0];
    const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    return `# ${capitalizedBrand}
> Generative Engine Optimization index for ${capitalizedBrand}.

## Main Resources
- [Home Page](${parsed.protocol}//${parsed.hostname}/)
- [Pricing Page](${parsed.protocol}//${parsed.hostname}/pricing)
- [Sign Up](${parsed.protocol}//${parsed.hostname}/sign-up)
- [Sign In](${parsed.protocol}//${parsed.hostname}/sign-in)
- [About Us](${parsed.protocol}//${parsed.hostname}/about)

## Documentation & Info
- [Privacy Policy](${parsed.protocol}//${parsed.hostname}/privacy)
- [Terms of Service](${parsed.protocol}//${parsed.hostname}/terms)
`;
  } catch {
    return `# Website Information
- [Home Page](${url})
`;
  }
}

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
        blufStructure: true,
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

      const technicalAudit = {
        robotsTxtAllowed: {
          GPTBot: true,
          "OAI-SearchBot": true,
          ClaudeBot: true,
          "Google-Extended": false,
          PerplexityBot: true
        },
        llmsTxtPresent: false,
        generatedLlmsTxt: `# Acme SaaS\n> Generative Engine Optimization index for Acme SaaS.\n\n## Main Resources\n- [Home Page](https://acme-saas.com/)\n- [Pricing Page](https://acme-saas.com/pricing)\n- [Sign Up](https://acme-saas.com/sign-up)\n- [Sign In](https://acme-saas.com/sign-in)\n`
      };

      const freshnessAudit = {
        dateModified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        daysSinceModified: 45,
        isStale: false,
        freshnessLabel: "At Risk (45 days ago)"
      };

      return NextResponse.json({
        url: targetUrl,
        scores,
        rewrites,
        technicalAudit,
        freshnessAudit
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

    // 2. Extract DateModified before stripping script tags
    const dateModified = extractDateModified(html);
    let daysSinceModified: number | null = null;
    let isStale = false;
    let freshnessLabel = "Unknown";
    if (dateModified) {
      const modTime = new Date(dateModified).getTime();
      if (!isNaN(modTime)) {
        const diff = Date.now() - modTime;
        daysSinceModified = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (daysSinceModified >= 90) {
          isStale = true;
          freshnessLabel = `Stale (${daysSinceModified} days ago)`;
        } else if (daysSinceModified >= 30) {
          freshnessLabel = `At Risk (${daysSinceModified} days ago)`;
        } else {
          freshnessLabel = `Fresh (${daysSinceModified} days ago)`;
        }
      }
    }
    const freshnessAudit = {
      dateModified,
      daysSinceModified,
      isStale,
      freshnessLabel
    };

    // 3. Parse robots.txt and check for llms.txt in parallel
    const rootDomain = getRootDomain(targetUrl);
    const botsToCheck = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "Google-Extended", "PerplexityBot"];
    let robotsTxtAllowed: Record<string, boolean> = {};
    botsToCheck.forEach(bot => robotsTxtAllowed[bot] = true); // Default to allowed
    let llmsTxtPresent = false;

    try {
      const [robotsRes, llmsRes] = await Promise.allSettled([
        fetchWithTimeout(`${rootDomain}/robots.txt`, {}, 5000),
        fetchWithTimeout(`${rootDomain}/llms.txt`, { method: "HEAD" }, 5000)
      ]);

      if (robotsRes.status === "fulfilled" && robotsRes.value.ok) {
        const robotsText = await robotsRes.value.text();
        robotsTxtAllowed = parseRobotsTxt(robotsText, botsToCheck);
      }

      if (llmsRes.status === "fulfilled" && llmsRes.value.ok) {
        llmsTxtPresent = true;
      }
    } catch (e) {
      console.warn("Failed to check technical audit files:", e);
    }

    const generatedLlmsTxt = generateLlmsTxtContent(targetUrl);

    const technicalAudit = {
      robotsTxtAllowed,
      llmsTxtPresent,
      generatedLlmsTxt
    };

    // 4. Extract Text using Cheerio
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, img, svg, video").remove();
    const textContent = $("body").text().replace(/\s+/g, " ").trim();

    if (!textContent) {
      return NextResponse.json({ error: "No readable content found on page" }, { status: 400 });
    }

    // 5. Score GEO Factors (Gemini Flash)
    const scores = await scoreGeoFactors(targetUrl, textContent);

    // 6. Generate Rewrites (Claude Sonnet)
    const rewrites = await generateRewrites(targetUrl, textContent, scores);

    return NextResponse.json({
      url: targetUrl,
      scores,
      rewrites,
      technicalAudit,
      freshnessAudit
    });
  } catch (error: any) {
    console.error("[Audit API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
