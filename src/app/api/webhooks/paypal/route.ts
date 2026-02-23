import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentGatewayConfig } from '@/lib/config';
import { processOrderCompletion } from '@/lib/fulfillment-service';
import crypto from 'crypto';

/**
 * POST /api/webhooks/paypal
 * Handle PayPal Webhooks (Live)
 */
export async function POST(request: NextRequest) {
    try {
        const payload = await request.text();
        const headers = request.headers;

        // 1. Verify PayPal Webhook Signature (Placeholder for production verification)
        // In production, use PayPal SDK or manual verification logic with PayPal-Auth-Algo, etc.
        const transmissionId = headers.get('paypal-transmission-id');
        const timestamp = headers.get('paypal-transmission-time');
        const webhookId = paymentGatewayConfig.paypal.webhookId;
        const signature = headers.get('paypal-transmission-sig');

        if (!transmissionId || !signature || !webhookId) {
            console.warn('[PayPal Webhook] Missing verification headers');
            // return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
        }

        const event = JSON.parse(payload);
        console.log(`[PayPal Webhook] Received event: ${event.event_type}`);

        // Log Activity
        await prisma.staffActivity.create({
            data: {
                staffId: 'system',
                action: `paypal_webhook_${event.event_type}`,
                targetId: event.id,
                targetType: 'paypal_event',
                details: payload,
            },
        });

        // 2. Handle Event Type
        switch (event.event_type) {
            case 'CHECKOUT.ORDER.APPROVED':
                // PayPal Webhook when order is approved
                await handleOrderApproved(event.resource);
                break;

            case 'PAYMENT.CAPTURE.COMPLETED':
                // When payment is actually captured
                await handleCaptureCompleted(event.resource);
                break;

            case 'PAYMENT.CAPTURE.DENIED':
                await handleCaptureDenied(event.resource);
                break;

            default:
                console.log(`[PayPal Webhook] Unhandled event: ${event.event_type}`);
        }

        return NextResponse.json({ acknowledged: true });
    } catch (error: any) {
        console.error('[PayPal Webhook] Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

/**
 * Handle Order Approved
 * Usually followed by Capture, but we can log intent here
 */
async function handleOrderApproved(resource: any) {
    const orderId = resource.id; // PayPal Order ID
    console.log(`[PayPal Webhook] Order Approved: ${orderId}`);
    // In a real flow, you might want to call Capture if not auto-captured
}

/**
 * Handle Capture Completed (Success)
 */
async function handleCaptureCompleted(resource: any) {
    const paypalTransactionId = resource.id;
    const paypalOrderId = resource.supplementary_data?.related_ids?.order_id || resource.parent_payment;

    try {
        // Find transaction by PayPal Order ID (we stored it in transactionId)
        const transaction = await prisma.transaction.findFirst({
            where: {
                OR: [
                    { transactionId: paypalOrderId },
                    { transactionId: paypalTransactionId }
                ]
            },
        });

        if (!transaction) {
            console.warn(`[PayPal Webhook] Transaction not found for PayPal ID: ${paypalOrderId || paypalTransactionId}`);
            return;
        }

        if (transaction.status !== 'completed') {
            await processOrderCompletion(transaction.orderId, transaction.transactionId!);
            console.log(`[PayPal Webhook] Order ${transaction.orderId} fulfilled.`);
        }
    } catch (error) {
        console.error(`[PayPal Webhook] Capture fulfillment failed:`, error);
    }
}

/**
 * Handle Capture Denied
 */
async function handleCaptureDenied(resource: any) {
    const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;

    if (!paypalOrderId) return;

    const transaction = await prisma.transaction.findFirst({
        where: { transactionId: paypalOrderId },
    });

    if (transaction) {
        await prisma.$transaction([
            prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'failed',
                    errorMessage: 'PayPal capture denied',
                    updatedAt: new Date(),
                },
            }),
            prisma.order.update({
                where: { orderNumber: transaction.orderId },
                data: {
                    status: 'failed',
                    updatedAt: new Date(),
                },
            }),
        ]);
    }
}
