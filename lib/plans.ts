export const PLANS = {
  starter: {
    name: 'Starter',
    maxProjects: 5,
    maxPromptsPerProject: 20,
    maxRunsPerMonth: 100,
    maxCompetitors: 1,
    dataHistoryDays: 30,
  },
  growth: {
    name: 'Growth',
    maxProjects: 10,
    maxPromptsPerProject: 50,
    maxRunsPerMonth: 500,
    maxCompetitors: 3,
    dataHistoryDays: 60,
  },
  pro: {
    name: 'Pro',
    maxProjects: Infinity,
    maxPromptsPerProject: 100,
    maxRunsPerMonth: 1000,
    maxCompetitors: Infinity,
    dataHistoryDays: 365,
  },
} as const;
