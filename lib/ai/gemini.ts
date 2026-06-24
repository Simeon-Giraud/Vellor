import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface GeoScore {
  directAnswer: boolean;
  faqSchema: boolean;
  factDensity: boolean;
  qaStructure: boolean;
  blufStructure: boolean;
  authorSchema: boolean;
  externalCitations: boolean;
  contentChunking: boolean;
  overallScore: number;
}

export async function scoreGeoFactors(url: string, textContent: string): Promise<GeoScore> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || !apiKey) {
    return {
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
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a Generative Engine Optimization (GEO) expert. Score the following web page content based on 8 GEO factors.
URL: ${url}
Content:
${textContent.substring(0, 15000)}

Score the content against these 8 factors (boolean true/false for each):
1. directAnswer: Is there a clear, concise direct answer to the main topic within the first 50 words?
2. faqSchema: Are there explicit FAQs? (We will infer schema presence based on clear FAQ sections).
3. factDensity: Is the content rich in specific facts, numbers, statistics (e.g., data points/metrics every 150-200 words), and expert quotes with named attributions?
4. qaStructure: Is the page structured with clear Questions as headings and Answers below?
5. blufStructure: Does the page follow the BLUF (Bottom Line Up Front) principle, where headings are immediately followed by a direct 1-to-2 sentence answer?
6. authorSchema: Is an author clearly stated with credentials?
7. externalCitations: Are there clear citations to external sources?
8. contentChunking: Is the content broken down into easy-to-read chunks with headings, lists, and short paragraphs?

Return ONLY a JSON object with boolean values for each factor, and an overallScore (0-100) based on how many are true. Do not return markdown blocks or any other text.
Example format:
{
  "directAnswer": true,
  "faqSchema": false,
  "factDensity": true,
  "qaStructure": false,
  "blufStructure": true,
  "authorSchema": false,
  "externalCitations": true,
  "contentChunking": true,
  "overallScore": 62.5
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const match = responseText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    const score = JSON.parse(match[0]);
    return score as GeoScore;
  } catch (error) {
    console.error("Gemini scoring error:", error);
    // Return a default mock score if it fails
    return {
      directAnswer: false,
      faqSchema: false,
      factDensity: false,
      qaStructure: false,
      blufStructure: false,
      authorSchema: false,
      externalCitations: false,
      contentChunking: false,
      overallScore: 0
    };
  }
}

export async function runGemini(promptText: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || !apiKey) {
    return `Mock Gemini response for: ${promptText}`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 500 }
    });
    return result.response.text();
  } catch (error) {
    console.error("Gemini execution error:", error);
    throw error;
  }
}
