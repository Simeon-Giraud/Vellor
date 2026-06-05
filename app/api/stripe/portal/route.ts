import { getCurrentDbUser } from "@/lib/auth";
import { NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { supabaseId: userId } })
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[portal]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
