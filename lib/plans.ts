export const PLANS = {
  starter: {
    name: 'Starter',
    maxProjects: 5,
    maxPromptsPerProject: 20,
    maxOnDemandRunsPerMonth: 5,
    maxCompetitors: 1,
    dataHistoryDays: 30,
    runIntervalDays: 7, // weekly
  },
  growth: {
    name: 'Growth',
    maxProjects: 10,
    maxPromptsPerProject: 50,
    maxOnDemandRunsPerMonth: 10,
    maxCompetitors: 3,
    dataHistoryDays: 60,
    runIntervalDays: 3, // every 3 days
  },
  pro: {
    name: 'Pro',
    maxProjects: Infinity,
    maxPromptsPerProject: 100,
    maxOnDemandRunsPerMonth: 25, // 20-25
    maxCompetitors: Infinity,
    dataHistoryDays: 365,
    runIntervalDays: 1, // daily
  },
} as const;

