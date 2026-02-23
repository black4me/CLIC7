import { prisma } from './prisma';
import { decrypt, encrypt } from './security';
import { sendEmail } from './email';

/**
 * Fulfillment Service
 * Handles automated game key release, order updates, and communications
 */

export async function processOrderCompletion(orderId: string, transactionId: string) {
    console.log(`[Fulfillment] Starting fulfillment for Order: ${orderId}, Transaction: ${transactionId}`);

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get the order with items
            const order = await tx.order.findUnique({
                where: { orderNumber: orderId },
                include: { items: true },
            });

            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }

            if (order.status === 'completed') {
                process.env.NODE_ENV !== 'production' && console.log(`[Fulfillment] Order ${orderId} already completed.`);
                return;
            }

            // 2. Allocate keys for each order item
            for (const item of order.items) {
                // We need to fulfill 'item.quantity' keys
                const keysToAllocate = await tx.gameKey.findMany({
                    where: {
                        productId: item.productId,
                        status: 'available',
                    },
                    take: item.quantity,
                });

                if (keysToAllocate.length < item.quantity) {
                    throw new Error(`Insufficient keys for product ${item.productName} (ID: ${item.productId}). Need ${item.quantity}, found ${keysToAllocate.length}`);
                }

                const allocatedKeyIds = keysToAllocate.map(k => k.id);
                const decryptedKeys: string[] = [];

                // Update each key to 'sold'
                for (const key of keysToAllocate) {
                    await tx.gameKey.update({
                        where: { id: key.id },
                        data: {
                            status: 'sold',
                            orderId: order.orderNumber,
                            customerId: order.customerId,
                            purchasedAt: new Date(),
                            deliveredAt: new Date(), // Marking as delivered now since we'll send email next
                        },
                    });

                    // Decrypt key for email (only temporary plain text)
                    try {
                        decryptedKeys.push(decrypt(key.encryptedKey));
                    } catch (e) {
                        console.error(`[Fulfillment] Failed to decrypt key ${key.id}:`, e);
                        throw new Error(`Key decryption failed for ${item.productName}`);
                    }
                }

                // Store encrypted keys reference in OrderItem (join them or store specific identifiers)
                // Original code stored key as string on item. Let's join them if quantity > 1
                await tx.orderItem.update({
                    where: { id: item.id },
                    data: {
                        encryptedGameKey: keysToAllocate.map(k => k.encryptedKey).join(','),
                    },
                });

                // 3. Send Email to Customer with Decrypted Keys
                await sendEmail({
                    to: order.customerEmail,
                    subject: `🎮 Your Game Keys for ${item.productName} - Order #${order.orderNumber}`,
                    html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Your Game Keys are Ready!</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">Order #${order.orderNumber}</p>
              </div>
              <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-top: 0;">${item.productName}</h2>
                <p style="color: #4b5563;">Thank you for your purchase. Here is your digital code:</p>
                
                ${decryptedKeys.map(key => `
                  <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <div style="font-family: monospace; font-size: 28px; font-weight: bold; color: #1e293b; letter-spacing: 2px;">
                      ${key}
                    </div>
                  </div>
                `).join('')}
                
                <div style="background: #fff9db; border-left: 4px solid #fab005; padding: 15px; margin-top: 20px; border-radius: 4px;">
                  <strong style="color: #856404;">Important:</strong> Please do not share these codes with anyone. They are for your use only.
                </div>
              </div>
              <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>© ${new Date().getFullYear()} CLIC7. All rights reserved.</p>
              </div>
            </div>
          `,
                });
            }

            // 4. Update Order Status
            await tx.order.update({
                where: { orderNumber: orderId },
                data: {
                    status: 'completed',
                    updatedAt: new Date(),
                },
            });

            // 5. Update Transaction Status
            const existingTx = await tx.transaction.findFirst({
                where: { transactionId: transactionId },
            });

            if (existingTx) {
                await tx.transaction.update({
                    where: { id: existingTx.id },
                    data: {
                        status: 'completed',
                        updatedAt: new Date(),
                    },
                });
            }

            // 6. Log Activity
            await tx.staffActivity.create({
                data: {
                    staffId: 'system',
                    action: 'automated_fulfillment_completed',
                    targetId: order.id,
                    targetType: 'order',
                    details: JSON.stringify({
                        orderNumber: orderId,
                        transactionId: transactionId,
                        timestamp: new Date().toISOString(),
                    }),
                },
            });
        });

        console.log(`[Fulfillment] Success for Order: ${orderId}`);
    } catch (error: any) {
        console.error(`[Fulfillment] Failed for Order: ${orderId}`, error);

        // Log Failure
        await prisma.staffActivity.create({
            data: {
                staffId: 'system',
                action: 'fulfillment_failed',
                targetId: orderId,
                targetType: 'order',
                details: JSON.stringify({
                    error: error.message,
                    transactionId: transactionId,
                }),
            },
        });

        throw error;
    }
}
