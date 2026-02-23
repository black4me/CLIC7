import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentGatewayConfig } from '@/lib/config';
import { processOrderCompletion } from '@/lib/fulfillment-service';

const WEBHOOK_SECRET = process.env.THAWANI_SECRET_KEY || '';

/**
 * POST /api/webhooks/thawani
 * Handle Thawani Webhooks
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate Request
        const apiKey = request.headers.get('thawani-api-key');
        if (apiKey !== WEBHOOK_SECRET) {
            console.warn('[Thawani Webhook] Unauthorized attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await request.json();
        const eventType = payload.event_type;
        const sessionData = payload.data;

        console.log(`[Thawani Webhook] Received event: ${eventType}`);

        // Detailed Logging for Thawani movements
        await prisma.staffActivity.create({
            data: {
                staffId: 'system',
                action: `thawani_webhook_${eventType}`,
                targetId: sessionData?.session_id || 'unknown',
                targetType: 'payment_session',
                details: JSON.stringify(payload),
            },
        });

        // 2. Handle Event
        switch (eventType) {
            case 'checkout.session.completed':
                await handleSessionCompleted(sessionData);
                break;

            case 'payment.failed':
                await handlePaymentFailed(sessionData);
                break;

            default:
                console.log(`[Thawani Webhook] Unhandled event type: ${eventType}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Thawani Webhook] Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

/**
 * Handle Session Completed (Success)
 */
async function handleSessionCompleted(session: any) {
    const sessionId = session.session_id;
    const dbTransactionId = session.client_reference_id; // We passed this during creation

    try {
        // Find transaction by session ID
        const transaction = await prisma.transaction.findFirst({
            where: { transactionId: sessionId },
        });

        if (!transaction) {
            console.error(`[Thawani Webhook] Transaction not found for session: ${sessionId}`);
            return;
        }

        // Trigger automated fulfillment if not already done
        if (transaction.status !== 'completed') {
            await processOrderCompletion(transaction.orderId, sessionId);

            console.log(`[Thawani Webhook] Order ${transaction.orderId} fulfilled successfully.`);
        }
    } catch (error) {
        console.error(`[Thawani Webhook] Error in success handler:`, error);
        throw error;
    }
}

/**
 * Handle Payment Failed
 */
async function handlePaymentFailed(session: any) {
    const sessionId = session.session_id;

    try {
        const transaction = await prisma.transaction.findFirst({
            where: { transactionId: sessionId },
        });

        if (transaction) {
            await prisma.$transaction([
                prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'failed',
                        errorMessage: 'Thawani payment failed',
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
            console.log(`[Thawani Webhook] Payment failed for order ${transaction.orderId}`);
        }
    } catch (error) {
        console.error(`[Thawani Webhook] Error in failure handler:`, error);
    }
}
