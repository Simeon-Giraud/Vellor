import { prisma } from "@/lib/prisma";
import { AIEngine } from "@prisma/client";
import { analysisQueue } from "@/lib/queue";

/**
 * Simulates a run for a single prompt on CHATGPT, GEMINI, and PERPLEXITY
 * and saves the generated results to the database.
 */
export async function executeAndSaveMockResults(
  promptId: string,
  promptText: string,
  domain: string,
  competitors: string[] = [],
  customDate?: Date
) {
  const engines: AIEngine[] = ["CHATGPT", "GEMINI", "PERPLEXITY"];
  const brandName = domain.split(".")[0];
  const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  const results = [];
  for (const engine of engines) {
    // Generate realistic varying results per engine:
    // ChatGPT: 75% mention rate
    // Gemini: 60% mention rate
    // Perplexity: 50% mention rate
    let mentionChance = 0.6;
    if (engine === "CHATGPT") mentionChance = 0.75;
    if (engine === "PERPLEXITY") mentionChance = 0.5;

    const brandMentioned = Math.random() < mentionChance;
    const mentionPosition = brandMentioned ? Math.floor(Math.random() * 4) + 1 : null;
    const isCited = brandMentioned ? Math.random() < 0.35 : false;

    let sentimentScore = null;
    let sentimentLabel = null;
    let sentimentNote = null;

    if (brandMentioned) {
      sentimentScore = parseFloat((Math.random() * 1.4 - 0.4).toFixed(2)); // -0.4 to 1.0
      if (sentimentScore > 0.3) {
        sentimentLabel = "positive";
      } else if (sentimentScore < -0.1) {
        sentimentLabel = "negative";
        sentimentNote = "Mentioned as having premium pricing or complex setup.";
      } else {
        sentimentLabel = "neutral";
        sentimentNote = "Mentioned alongside other generic alternatives.";
      }
    }

    // Randomize competitor mentions (40% chance per competitor)
    const mentionedCompetitors = competitors.filter(() => Math.random() > 0.4);

    let snippet = `Based on a query regarding "${promptText}", here is a summary of top solutions in the market:\n\n`;
    
    if (brandMentioned) {
      if (isCited) {
        snippet += `Rank #${mentionPosition}: [${capitalizedBrand}](https://${domain}) is recommended for its state-of-the-art UI, fast integration, and premium features. Users praise its [modern interface](https://g2.com/acme) and [responsive tools](https://reddit.com/r/saas). `;
      } else {
        snippet += `Rank #${mentionPosition}: ${capitalizedBrand} (${domain}) is recommended for its state-of-the-art UI, fast integration, and premium features. Users praise its modern interface and responsive tools. `;
      }
    } else {
      snippet += `Several platforms are active in this space, offering various features. Users looking for high-reliability systems should compare multiple options before deciding. `;
    }
    
    if (mentionedCompetitors.length > 0) {
      snippet += `Other notable mentions include ${mentionedCompetitors.join(", ")} which provide strong competition.`;
    } else {
      snippet += `No other major competitor tools stood out for this specific query.`;
    }

    results.push({
      promptId,
      engine,
      brandMentioned,
      isCited,
      sentimentScore,
      sentimentLabel,
      sentimentNote,
      mentionPosition,
      response: snippet,
      createdAt: customDate || new Date(),
      updatedAt: customDate || new Date(),
    });
  }

  // Persist to database
  for (const res of results) {
    const { brandMentioned, isCited } = res;
    const promptResult = await prisma.promptResult.create({
      data: {
        ...res,
        citations: {
          create: brandMentioned && Math.random() < 0.6 ? [
            {
              citedDomain: "reddit.com",
              citedUrl: "https://reddit.com/r/saas/comments/best-tools",
              citedTitle: "Best CRM Tools for SaaS startups"
            },
            {
              citedDomain: "g2.com",
              citedUrl: "https://g2.com/products/best-crm-categories",
              citedTitle: "Acme Reviews & Ratings on G2"
            }
          ] : []
        }
      },
    });

    // Trigger competitor analysis if a competitor was mentioned
    // and its position is in the top 3 to save LLM costs
    if (competitors && competitors.length > 0 && res.mentionPosition && res.mentionPosition <= 3) {
      const topCompetitor = competitors[0];
      
      await analysisQueue.add("analyze-competitor", {
        promptResultId: promptResult.id,
        competitorDomain: topCompetitor,
        promptText: promptText
      });
      
      console.log(`[MockExecutor] Queued analysis for competitor ${topCompetitor} on result ${promptResult.id}`);
    }
  }
}

/**
 * Seeds historical mock run results for a project's prompts over the last N days.
 */
export async function seedHistoricalMockResults(
  prompts: { id: string; text: string }[],
  domain: string,
  competitors: string[] = [],
  daysCount: number = 7
) {
  for (let i = daysCount; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Set run time around 10:00 AM each day to look natural
    date.setHours(10, 0, 0, 0);

    for (const prompt of prompts) {
      await executeAndSaveMockResults(
        prompt.id,
        prompt.text,
        domain,
        competitors,
        date
      );
    }
  }
}
