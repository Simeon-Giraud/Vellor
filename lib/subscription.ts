import { prisma } from '@/lib/prisma'

export async function getUserSubscription(supabaseUserId: string) {
  return prisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
    select: {
      subscriptionStatus: true,
      stripePriceId: true,
    },
  })
}

export function isSubscriptionActive(status: string | null | undefined): boolean {
  return status === 'active'
}
