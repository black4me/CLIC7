/**
 * API - نظام بطاقات الهدايا
 * Gift Cards Management API
 * 
 * Routes:
 * GET /api/marketing/giftcards - Get gift cards stats (admin) or check balance
 * POST /api/marketing/giftcards - Purchase gift card
 * POST /api/marketing/giftcards/redeem - Redeem gift card
 */

import { NextRequest, NextResponse } from 'next/server';
import { GiftCard, GiftCardTransaction } from '@/lib/db-models';
import { generateGiftCardCode, sanitizeInput } from '@/lib/security';
import {
  validateAuthFromCookies,
  requireAdminPermission,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
  getPaginationParams,
  createPaginatedResponse,
} from '@/lib/api-utils';

const RATE_LIMIT_PUBLIC = { maxRequests: 30, windowMs: 60 * 1000 };
const RATE_LIMIT_ADMIN = { maxRequests: 100, windowMs: 60 * 1000 };

/**
 * GET /api/marketing/giftcards
 * الحصول على إحصائيات أو قائمة بطاقات الهدايا
 * Get gift cards statistics or list
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    
    // Check if admin for stats access
    const auth = await validateAuthFromCookies();
    const isAdmin = auth && (auth.role === 'admin' || auth.role === 'super_admin' || auth.role === 'owner');
    
    if (type === 'stats' && !isAdmin) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(
      request,
      isAdmin ? RATE_LIMIT_ADMIN.maxRequests : RATE_LIMIT_PUBLIC.maxRequests,
      isAdmin ? RATE_LIMIT_ADMIN.windowMs : RATE_LIMIT_PUBLIC.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    if (type === 'stats') {
      // Check admin permissions
      const { auth, authorized } = await requireAdminPermission(request, ['manage_marketing', 'view_reports', 'admin']);
      
      if (!auth || !authorized) {
        return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
      }

      // TODO: Fetch statistics from database
      // const stats = await db.giftCards.aggregate({
      //   _sum: { initialBalance: true, balance: true },
      //   _count: { _all: true },
      //   where: { isActive: true },
      // });

      return createSuccessResponse({
        totalSold: 0,
        totalValue: 0,
        totalRedeemed: 0,
        redeemedValue: 0,
        activeCards: 0,
      }, 'Gift card statistics retrieved successfully');
    }

    if (type === 'list') {
      if (!isAdmin) {
        return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
      }

      const pagination = getPaginationParams(searchParams);
      
      // TODO: Fetch from database
      // const giftCards = await db.giftCards.findMany({
      //   skip: pagination.skip,
      //   take: pagination.limit,
      // });
      // const total = await db.giftCards.count();

      const giftCards: GiftCard[] = [];
      const total = 0;

      return createPaginatedResponse(giftCards, total, pagination.page, pagination.limit);
    }

    if (type === 'balance') {
      const code = searchParams.get('code');
      
      if (!code) {
        return createErrorResponse('Gift card code is required', 400, 'VALIDATION_ERROR');
      }

      const sanitizedCode = sanitizeInput(code).toUpperCase();
      
      // TODO: Fetch from database
      // const giftCard = await db.giftCards.findUnique({
      //   where: { code: sanitizedCode },
      //   select: {
      //     balance: true,
      //     initialBalance: true,
      //     isActive: true,
      //     expiresAt: true,
      //   },
      // });
      //
      // if (!giftCard) {
      //   return createErrorResponse('Gift card not found', 404, 'NOT_FOUND');
      // }
      //
      // if (!giftCard.isActive) {
      //   return createErrorResponse('Gift card is inactive', 400, 'INACTIVE_CARD');
      // }
      //
      // if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      //   return createErrorResponse('Gift card has expired', 400, 'EXPIRED_CARD');
      // }

      return createErrorResponse('Gift card not found', 404, 'NOT_FOUND');
    }

    return createErrorResponse('Invalid type parameter', 400, 'VALIDATION_ERROR');
  } catch (error) {
    return handleApiError(error, 'GET /api/marketing/giftcards');
  }
}

/**
 * POST /api/marketing/giftcards
 * شراء بطاقة هدية
 * Purchase gift card
 */
export async function POST(request: NextRequest) {
  try {
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
      amount: number;
      buyerId: string;
      recipientEmail?: string;
      recipientName?: string;
      message?: string;
      expiryDays?: number;
    }>(request, {
      required: ['amount', 'buyerId'],
      optional: ['recipientEmail', 'recipientName', 'message', 'expiryDays'],
      types: {
        amount: 'number',
        buyerId: 'string',
        recipientEmail: 'string',
        recipientName: 'string',
        message: 'string',
        expiryDays: 'number',
      },
      validators: {
        amount: (value: number) => ({
          valid: value > 0 && value <= 1000,
          error: 'Amount must be between 0 and 1000',
        }),
        expiryDays: (value: number) => {
          if (value === undefined) return { valid: true };
          return {
            valid: value > 0 && value <= 365,
            error: 'Expiry days must be between 1 and 365',
          };
        },
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

    const { amount, buyerId, recipientEmail, recipientName, message, expiryDays } = validation.data!;

    // Generate unique gift card code
    const code = generateGiftCardCode();

    const giftCard: GiftCard = {
      id: `giftcard-${Date.now()}`,
      code,
      balance: amount,
      initialBalance: amount,
      purchasedBy: buyerId,
      sentTo: recipientEmail ? sanitizeInput(recipientEmail) : undefined,
      recipientName: recipientName ? sanitizeInput(recipientName) : undefined,
      message: message ? sanitizeInput(message) : undefined,
      isRedeemed: false,
      expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Save to database
    // await db.giftCards.create(giftCard);

    // TODO: Send email to recipient if email provided
    // if (recipientEmail) {
    //   await sendEmail({
    //     to: recipientEmail,
    //     subject: 'You received a gift card!',
    //     template: emailTemplates.giftCardReceived,
    //     data: {
    //       code: giftCard.code,
    //       balance: giftCard.balance,
    //       recipientName: giftCard.recipientName,
    //       message: giftCard.message,
    //     },
    //   });
    // }

    return createSuccessResponse(
      {
        giftCard: {
          id: giftCard.id,
          code: giftCard.code,
          balance: giftCard.balance,
          expiresAt: giftCard.expiresAt,
        },
      },
      'Gift card purchased successfully',
      201
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/marketing/giftcards');
  }
}
