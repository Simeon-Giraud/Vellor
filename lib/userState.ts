import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { cache } from 'react'

export type UserState =
  | 'demo'      // signed up, no card, mock data only
  | 'trialing'  // card entered, real prompts running, within 7 days
  | 'active'    // paying subscriber
  | 'past_due'  // payment failed
  | 'canceled'  // subscription canceled

async function syncSubscriptionWithStripe(supabaseId: string, stripeCustomerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 1,
      status: 'all',
    })

    const sub = subscriptions.data[0]
    if (sub) {
      return await prisma.user.update({
        where: { supabaseId },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price?.id ?? null,
          subscriptionStatus: sub.status,
          trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        },
        select: {
          subscriptionStatus: true,
        }
      })
    }
  } catch (error) {
    console.error('[stripe-sync] Failed to sync subscription with Stripe:', error)
  }
  return null
}

export const getUserState = cache(async (supabaseId: string): Promise<UserState> => {
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    select: {
      subscriptionStatus: true,
      stripeCustomerId: true,
      trialEndsAt: true
    }
  })
  
  if (!user) return 'demo'

  let status = user.subscriptionStatus

  // If customer has a stripeCustomerId but status is still 'demo' (or null), try to sync on-the-fly
  if (user.stripeCustomerId && (!status || status === 'demo')) {
    const synced = await syncSubscriptionWithStripe(supabaseId, user.stripeCustomerId)
    if (synced) {
      status = synced.subscriptionStatus
    }
  }
  
  if (status === 'trialing') return 'trialing'
  if (status === 'active') return 'active'
  if (status === 'past_due') return 'past_due'
  if (status === 'canceled') return 'canceled'
  
  return 'demo'
})
