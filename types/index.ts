// Shared TypeScript types for Vellor

export type AIEngine = "CHATGPT" | "GEMINI" | "PERPLEXITY";

export interface User {
  id: string;
  email: string;
  clerkId: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  domain: string;
  competitors: string[];
  createdAt: Date;
  prompts?: Prompt[];
}

export interface Prompt {
  id: string;
  projectId: string;
  text: string;
  createdAt: Date;
  results?: PromptResult[];
}

export interface PromptResult {
  id: string;
  promptId: string;
  engine: AIEngine;
  response: string;
  brandMentioned: boolean;
  mentionPosition: number | null;
  createdAt: Date;
}

export interface CreateProjectInput {
  domain: string;
  competitors: string[];
}

export interface CreatePromptInput {
  projectId: string;
  text: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalPrompts: number;
  totalResults: number;
  avgMentionRate: number;
}

export interface EngineResult {
  engine: AIEngine;
  mentioned: boolean;
  position: number | null;
  snippet: string;
}
