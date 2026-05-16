import { prisma } from '@/lib/prisma'

export async function getUserSubscription(clerkUserId: string) {
  return prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: {
      subscriptionStatus: true,
      stripePriceId: true,
    },
  })
}

export function isSubscriptionActive(status: string | null | undefined): boolean {
  return status === 'active'
}
