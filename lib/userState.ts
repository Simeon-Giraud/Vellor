import { prisma } from '@/lib/prisma'

export type UserState =
  | 'demo'      // signed up, no card, mock data only
  | 'trialing'  // card entered, real prompts running, within 7 days
  | 'active'    // paying subscriber
  | 'past_due'  // payment failed
  | 'canceled'  // subscription canceled

export async function getUserState(supabaseId: string): Promise<UserState> {
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    select: {
      subscriptionStatus: true,
      stripeCustomerId: true,
      trialEndsAt: true
    }
  })
  
  if (!user) return 'demo'
  if (user.subscriptionStatus === 'trialing') return 'trialing'
  if (user.subscriptionStatus === 'active') return 'active'
  if (user.subscriptionStatus === 'past_due') return 'past_due'
  if (user.subscriptionStatus === 'canceled') return 'canceled'
  
  return 'demo'
}
