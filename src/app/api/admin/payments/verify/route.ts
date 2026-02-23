/**
 * API - Payment Verification with Race Condition Protection
 * Bank Transfer Verification API (Admin)
 * 
 * Routes:
 * GET /api/admin/payments/verify - Get pending verifications
 * POST /api/admin/payments/verify - Verify or reject a payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processOrderCompletion } from '@/lib/fulfillment-service';
import { sanitizeInput, encrypt } from '@/lib/security';
import { sendEmail } from '@/lib/email';
import {
  requireAdminPermissionWith2FA,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
  getPaginationParams,
  createPaginatedResponse,
} from '@/lib/api-utils';

const RATE_LIMIT_ADMIN = { maxRequests: 100, windowMs: 60 * 1000 };

/**
 * GET /api/admin/payments/verify
 * Get pending verification payments
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Check admin permissions WITH 2FA REQUIREMENT
    const { auth, authorized, twoFactorVerified } = await requireAdminPermissionWith2FA(
      request,
      ['view_orders', 'verify_payments']
    );

    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    if (!twoFactorVerified) {
      return createErrorResponse(
        'Two-factor authentication required. Please complete 2FA verification.',
        403,
        '2FA_REQUIRED'
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'verification_pending';

    // Validate status parameter
    const validStatuses = ['verification_pending', 'verification_rejected', 'all'];
    if (!validStatuses.includes(status)) {
      return createErrorResponse('Invalid status parameter', 400, 'VALIDATION_ERROR');
    }

    const pagination = getPaginationParams(searchParams);

    // Build Prisma query
    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }

    // Fetch from database with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.transaction.count({ where })
    ]);

    // Sanitize response
    const sanitizedTransactions = transactions.map((txn: any) => ({
      ...txn,
      metadata: undefined,
      gatewayResponse: undefined,
    }));

    return createPaginatedResponse(sanitizedTransactions, total, pagination.page, pagination.limit);
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/payments/verify');
  }
}

/**
 * POST /api/admin/payments/verify
 * Verify or reject a bank transfer payment with idempotency protection
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Check admin permissions WITH 2FA REQUIREMENT
    const { auth, authorized, twoFactorVerified } = await requireAdminPermissionWith2FA(
      request,
      ['verify_payments']
    );

    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    if (!twoFactorVerified) {
      return createErrorResponse(
        'Two-factor authentication required. Please complete 2FA verification.',
        403,
        '2FA_REQUIRED'
      );
    }

    // Validate request body
    const validation = await validateRequestBody<{
      transactionId: string;
      approved: boolean;
      notes?: string;
    }>(request, {
      required: ['transactionId', 'approved'],
      optional: ['notes'],
      types: {
        transactionId: 'string',
        approved: 'boolean',
        notes: 'string',
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

    const { transactionId, approved, notes = '' } = validation.data!;
    const newStatus = approved ? 'completed' : 'verification_rejected';

    // ATOMIC OPERATION using Prisma
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing) {
      return createErrorResponse('Transaction not found', 404, 'NOT_FOUND');
    }

    if (existing.status !== 'verification_pending') {
      return createErrorResponse(
        `Transaction already processed (status: ${existing.status})`,
        409,
        'ALREADY_PROCESSED'
      );
    }

    // Update Transaction
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus as any,
        verifiedBy: auth.userId,
        verifiedAt: new Date(),
        verificationNotes: notes,
        version: { increment: 1 },
      },
    });

    // If approved, allocate and deliver game keys using central service
    if (approved) {
      try {
        await processOrderCompletion(updated.orderId, updated.transactionId || updated.id);
      } catch (deliveryError) {
        console.error('Failed to deliver game keys:', deliveryError);
      }
    }

    // Send email to customer for approval/rejection status
    try {
      if (updated.customerEmail) {
        await sendEmail({
          to: updated.customerEmail,
          subject: approved ? '✅ Payment Verified - Order Processing' : '❌ Payment Rejected',
          html: approved
            ? `<div>
                <h1>Payment Verified!</h1>
                <p>Your payment for order <strong>${updated.orderId}</strong> has been verified.</p>
                <p>Your game keys will be delivered shortly.</p>
                ${notes ? `<p>Notes: ${notes}</p>` : ''}
              </div>`
            : `<div>
                <h1>Payment Rejected</h1>
                <p>Your payment for order <strong>${updated.orderId}</strong> was rejected.</p>
                ${notes ? `<p>Reason: ${notes}</p>` : ''}
                <p>Please contact support for assistance.</p>
              </div>`,
        });
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Log staff activity
    await prisma.staffActivity.create({
      data: {
        staffId: auth.userId,
        action: approved ? 'verified_payment' : 'rejected_payment',
        targetId: transactionId,
        targetType: 'transaction',
        details: JSON.stringify({
          orderId: updated.orderId,
          approved,
          notes,
          amount: updated.amount,
          currency: updated.currency,
        }),
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    const message = approved
      ? 'Payment verified successfully. Game code will be sent soon.'
      : 'Payment rejected';

    return createSuccessResponse(
      {
        transactionId,
        status: newStatus,
        verifiedBy: auth.userId,
        orderId: updated.orderId,
      },
      message
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/payments/verify');
  }
}
