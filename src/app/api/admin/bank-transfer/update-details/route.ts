/**
 * API - تحديث تفاصيل التحويل البنكي (للمدير فقط)
 * Update Bank Transfer Details API (Admin Only)
 * 
 * Routes:
 * POST /api/admin/bank-transfer/update-details
 */

import { NextRequest, NextResponse } from 'next/server';
import { BankTransferDetails } from '@/lib/db-models';
import { sanitizeInput } from '@/lib/security';
import {
  withAdminAuth,
  requireAdminPermission,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
} from '@/lib/api-utils';

const RATE_LIMIT_ADMIN = { maxRequests: 30, windowMs: 60 * 1000 };

/**
 * POST /api/admin/bank-transfer/update-details
 * تحديث تفاصيل التحويل البنكي (للمدير فقط)
 * Update bank transfer details (Admin only)
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

    // Check admin permissions (only admins can update)
    const { auth, authorized } = await requireAdminPermission(request, ['manage_settings', 'admin']);
    
    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions. Admin access required.', 403, 'FORBIDDEN');
    }

    // Validate request body
    const validation = await validateRequestBody<{
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
      iban?: string;
      swiftCode?: string;
      phoneNumber?: string;
      qrCodeImage?: string;
      bankCardImage?: string;
      isActive?: boolean;
    }>(request, {
      optional: ['bankName', 'accountNumber', 'accountHolder', 'iban', 'swiftCode', 'phoneNumber', 'qrCodeImage', 'bankCardImage', 'isActive'],
      types: {
        bankName: 'string',
        accountNumber: 'string',
        accountHolder: 'string',
        iban: 'string',
        swiftCode: 'string',
        phoneNumber: 'string',
        qrCodeImage: 'string',
        bankCardImage: 'string',
        isActive: 'boolean',
      },
      validators: {
        iban: (value: string) => {
          if (!value) return { valid: true };
          // Basic IBAN validation - should start with country code and have 15-34 chars
          const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
          return {
            valid: ibanRegex.test(value.replace(/\s/g, '').toUpperCase()),
            error: 'Invalid IBAN format',
          };
        },
        phoneNumber: (value: string) => {
          if (!value) return { valid: true };
          // Basic phone validation
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          return {
            valid: phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')),
            error: 'Invalid phone number format',
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

    const data = validation.data!;

    // Validate at least one field is provided
    if (Object.keys(data).length === 0) {
      return createErrorResponse(
        'At least one field must be provided for update',
        400,
        'VALIDATION_ERROR'
      );
    }

    // TODO: Update in database
    // const updatedDetails = await db.bankTransferDetails.update({
    //   where: { id: 'default' },
    //   data: {
    //     ...data,
    //     updatedAt: new Date(),
    //   },
    // });

    // TODO: Log staff activity
    // await logStaffActivity(auth.userId, 'updated_bank_transfer_details', null, {
    //   updatedFields: Object.keys(data),
    // });

    return createSuccessResponse(
      {
        updatedFields: Object.keys(data),
        updatedBy: auth.userId,
        updatedAt: new Date(),
      },
      'Bank transfer details updated successfully'
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/bank-transfer/update-details');
  }
}
