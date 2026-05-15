import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    projects: 1,
    promptsPerProject: 5,
    runsPerMonth: 10,
  },
  PRO: {
    name: "Pro",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    projects: 10,
    promptsPerProject: 50,
    runsPerMonth: 500,
  },
  AGENCY: {
    name: "Agency",
    price: 149,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID,
    projects: 100,
    promptsPerProject: 500,
    runsPerMonth: 5000,
  },
} as const;
