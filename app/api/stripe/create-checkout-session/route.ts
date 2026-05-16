import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await req.json()
    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
    }

    // Get or create user in DB
    let user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { clerkUserId: userId },
        email: user.email,
      })
      stripeCustomerId = customer.id
      await prisma.user.update({
        where: { clerkId: userId },
        data: { stripeCustomerId },
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      managed_payments: { enabled: true },
      subscription_data: {
        trial_period_days: 7,
        metadata: { clerkUserId: userId },
      },
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { clerkUserId: userId },
    }, {
      apiVersion: '2026-02-25.preview' as any,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[create-checkout-session]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
