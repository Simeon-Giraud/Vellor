import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connection } from '@/lib/queue';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'ok',
    db: 'ok',
    redis: 'ok',
    stripe: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('[Health] DB check failed:', error);
    health.db = 'error';
    health.status = 'error';
  }

  try {
    if (connection.status !== 'ready') {
      await connection.ping();
    }
  } catch (error) {
    console.error('[Health] Redis check failed:', error);
    health.redis = 'error';
    health.status = 'error';
  }

  try {
    // Simple Stripe check - try to retrieve account or just check if initialized
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key missing");
    }
  } catch (error) {
    console.error('[Health] Stripe check failed:', error);
    health.stripe = 'error';
    health.status = 'error';
  }

  return NextResponse.json(health, { status: health.status === 'ok' ? 200 : 503 });
}
