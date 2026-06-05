import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2026-02-25.preview' as any,
})

