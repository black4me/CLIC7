/**
 * API - Gift Card Redemption with Race Condition Protection
 * Gift Card Redemption API
 * 
 * Routes:
 * POST /api/marketing/giftcards/redeem - Redeem gift card balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { GiftCard, GiftCardTransaction } from '@/lib/models';
import { sanitizeInput } from '@/lib/security';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
} from '@/lib/api-utils';

const RATE_LIMIT_PUBLIC = { maxRequests: 20, windowMs: 60 * 1000 };

/**
 * POST /api/marketing/giftcards/redeem
 * Redeem gift card balance with atomic operation (prevents double redemption)
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_PUBLIC.maxRequests,
      RATE_LIMIT_PUBLIC.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Validate request body
    const validation = await validateRequestBody<{
      code: string;
      customerId: string;
      amount: number;
      orderId?: string;
    }>(request, {
      required: ['code', 'customerId', 'amount'],
      optional: ['orderId'],
      types: {
        code: 'string',
        customerId: 'string',
        amount: 'number',
        orderId: 'string',
      },
      validators: {
        code: (value: string) => ({
          valid: value.length >= 5,
          error: 'Code must be at least 5 characters',
        }),
        amount: (value: number) => ({
          valid: value > 0,
          error: 'Amount must be positive',
        }),
      },
    });

    if (!validation.valid) {
      return createErrorResponse(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { errors: validation.errors }
      );
    }

    const { code, customerId, amount, orderId } = validation.data!;
    const sanitizedCode = sanitizeInput(code).toUpperCase();

    // ATOMIC OPERATION: Find and validate gift card with balance check
    // This prevents race conditions where two requests pass the balance check simultaneously
    const giftCard = await GiftCard.findOne({
      code: sanitizedCode,
      isActive: true,
      isRedeemed: false,
      balance: { $gte: amount }, // Atomic balance check
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (!giftCard) {
      // Determine specific error reason
      const existingCard = await GiftCard.findOne({ code: sanitizedCode });
      
      if (!existingCard) {
        return createErrorResponse('Gift card not found', 404, 'NOT_FOUND');
      }
      
      if (!existingCard.isActive) {
        return createErrorResponse('Gift card is not active', 400, 'INACTIVE_CARD');
      }
      
      if (existingCard.isRedeemed) {
        return createErrorResponse('Gift card has already been fully redeemed', 400, 'ALREADY_REDEEMED');
      }
      
      if (existingCard.expiresAt && existingCard.expiresAt < new Date()) {
        return createErrorResponse('Gift card has expired', 400, 'EXPIRED_CARD');
      }
      
      if (existingCard.balance < amount) {
        return createErrorResponse(
          `Insufficient balance. Available: ${existingCard.balance}`,
          400,
          'INSUFFICIENT_BALANCE'
        );
      }
      
      return createErrorResponse('Gift card cannot be redeemed', 400, 'INVALID_CARD');
    }

    // Calculate new balance
    const newBalance = giftCard.balance - amount;

    // ATOMIC UPDATE: Update gift card balance
    // Use findOneAndUpdate with version check for optimistic locking
    const updated = await GiftCard.findOneAndUpdate(
      {
        _id: giftCard._id,
        balance: giftCard.balance, // Ensure balance hasn't changed
        version: giftCard.version, // Optimistic locking
      },
      {
        $set: {
          balance: newBalance,
          isRedeemed: newBalance === 0,
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!updated) {
      // Another request modified the card concurrently
      return createErrorResponse(
        'Gift card was modified by another request. Please try again.',
        409,
        'CONCURRENT_MODIFICATION'
      );
    }

    // Record the transaction
    const transaction = await GiftCardTransaction.create({
      giftCardId: giftCard._id.toString(),
      customerId,
      orderId: orderId || '',
      amount,
      type: 'redeem',
      createdAt: new Date(),
    });

    return createSuccessResponse(
      {
        transactionId: transaction._id.toString(),
        redeemedAmount: amount,
        remainingBalance: newBalance,
        giftCardCode: giftCard.code,
        isFullyRedeemed: newBalance === 0,
      },
      'Gift card redeemed successfully'
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/marketing/giftcards/redeem');
  }
}
