import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendTrialExpiryEmail } from '@/lib/email'
import Stripe from 'stripe'



export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
    if (isDev && (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_placeholder')) {
      console.warn('[webhook] Bypassing signature verification (development/test mode)')
      event = JSON.parse(body) as Stripe.Event
    } else {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    }
  } catch (err: any) {
    console.error('[webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const supabaseUserId = session.metadata?.supabaseUserId
        if (!supabaseUserId) break
        await prisma.user.update({
          where: { supabaseId: supabaseUserId },
          data: {
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            subscriptionStatus: session.payment_status === 'no_payment_required' ? 'trialing' : 'active',
          },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'active' },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'past_due' },
        })
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripePriceId: sub.items.data[0]?.price?.id ?? null,
            subscriptionStatus: sub.status,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'canceled' },
        })
        break
      }

      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const trialEnd = sub.trial_end ? sub.trial_end * 1000 : Date.now() + 3 * 24 * 60 * 60 * 1000
        const trialEndsAt = new Date(trialEnd)

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { trialEndsAt },
        })

        // Find the user to get their email and preferences
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          include: { preferences: true },
        })

        if (user && user.email) {
          if (!user.preferences || user.preferences.emailAlerts) {
            const daysLeft = Math.ceil((trialEnd - Date.now()) / (1000 * 3600 * 24))
            const daysCount = daysLeft > 0 ? daysLeft : 3
            await sendTrialExpiryEmail(user.email, daysCount)
          } else {
            console.log(`[webhook] User ${user.email} disabled trial expiry email alerts.`)
          }
        }

        console.log(`[webhook] Trial ending soon for customer ${customerId}`)
        break
      }

      default:
        console.log(`[webhook] unhandled event: ${event.type}`)
    }
  } catch (err) {
    console.error('[webhook] handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
