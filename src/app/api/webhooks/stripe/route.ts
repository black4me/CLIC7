import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/security';
import { processOrderCompletion } from '@/lib/fulfillment-service';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks with signature verification
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify webhook signature
    if (!WEBHOOK_SECRET) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify signature using custom implementation
    const isValid = verifyWebhookSignature(payload, signature, WEBHOOK_SECRET);

    if (!isValid) {
      console.error('[Stripe Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the event
    const event = JSON.parse(payload);

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: any) {
  const { id, metadata, amount, currency } = paymentIntent;
  const { orderId, customerId } = metadata || {};

  if (!orderId) {
    console.error('[Stripe Webhook] Missing orderId in payment intent metadata');
    return;
  }

  try {
    // Use the central fulfillment service
    await processOrderCompletion(orderId, id);

    console.log(`[Stripe Webhook] Payment completed and fulfillment processed for order: ${orderId}`);
  } catch (error) {
    console.error(`[Stripe Webhook] Fulfillment failed for success event:`, error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: any) {
  const { id, metadata, last_payment_error } = paymentIntent;
  const { orderId } = metadata || {};

  if (!orderId) {
    console.error('[Stripe Webhook] Missing orderId in payment intent metadata');
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Update transaction using same robust pattern
      const transaction = await tx.transaction.findFirst({
        where: { transactionId: id as string }
      });

      if (transaction) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'failed',
            errorMessage: last_payment_error?.message || 'Payment failed',
            gatewayResponse: JSON.stringify(paymentIntent),
            updatedAt: new Date(),
          },
        });
      }

      // Update order
      await tx.order.update({
        where: { orderNumber: orderId },
        data: {
          status: 'failed',
          updatedAt: new Date(),
        },
      });
    });

    console.log(`[Stripe Webhook] Payment marked as failed for order: ${orderId}`);
  } catch (error) {
    console.error(`[Stripe Webhook] Database update failed for failure event:`, error);
  }
}
