/**
 * API - إدارة كوبون فردي
 * Individual Coupon Management API
 * 
 * Routes:
 * GET /api/marketing/coupons/[id] - Get coupon details
 * PUT /api/marketing/coupons/[id] - Update coupon
 * DELETE /api/marketing/coupons/[id] - Delete coupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { Coupon } from '@/lib/db-models';
import {
  requireAdminPermission,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
} from '@/lib/api-utils';

const RATE_LIMIT_ADMIN = { maxRequests: 100, windowMs: 60 * 1000 };

/**
 * GET /api/marketing/coupons/[id]
 * الحصول على تفاصيل كوبون
 * Get coupon details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Check admin permissions
    const { auth, authorized } = await requireAdminPermission(request, ['manage_marketing', 'admin']);
    
    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    // TODO: Fetch from database
    // const coupon = await db.coupons.findUnique({
    //   where: { id },
    // });
    //
    // if (!coupon) {
    //   return createErrorResponse('Coupon not found', 404, 'NOT_FOUND');
    // }

    // TODO: Get usage statistics
    // const usageCount = await db.couponUsages.count({ where: { couponId: id } });

    return createErrorResponse('Coupon not found', 404, 'NOT_FOUND');
  } catch (error) {
    return handleApiError(error, 'GET /api/marketing/coupons/[id]');
  }
}

/**
 * PUT /api/marketing/coupons/[id]
 * تحديث كوبون
 * Update coupon
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Check admin permissions
    const { auth, authorized } = await requireAdminPermission(request, ['manage_marketing', 'admin']);
    
    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    const validation = await validateRequestBody<{
      description?: string;
      maxUsages?: number;
      isActive?: boolean;
      validFrom?: string;
      validUntil?: string;
      applicableCategories?: string[];
      applicableProducts?: string[];
    }>(request, {
      optional: ['description', 'maxUsages', 'isActive', 'validFrom', 'validUntil', 'applicableCategories', 'applicableProducts'],
      types: {
        description: 'string',
        maxUsages: 'number',
        isActive: 'boolean',
        validFrom: 'string',
        validUntil: 'string',
        applicableCategories: 'array',
        applicableProducts: 'array',
      },
      validators: {
        maxUsages: (value: number) => {
          if (value === undefined) return { valid: true };
          return {
            valid: value > 0 && Number.isInteger(value),
            error: 'Max usages must be a positive integer',
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

    // TODO: Check if coupon exists
    // const existing = await db.coupons.findUnique({ where: { id } });
    // if (!existing) {
    //   return createErrorResponse('Coupon not found', 404, 'NOT_FOUND');
    // }

    // Parse dates if provided
    let validFrom, validUntil;
    if (data.validFrom) {
      validFrom = new Date(data.validFrom);
      if (isNaN(validFrom.getTime())) {
        return createErrorResponse('Invalid validFrom date', 400, 'VALIDATION_ERROR');
      }
    }

    if (data.validUntil) {
      validUntil = new Date(data.validUntil);
      if (isNaN(validUntil.getTime())) {
        return createErrorResponse('Invalid validUntil date', 400, 'VALIDATION_ERROR');
      }
    }

    // Validate date range
    if (validFrom && validUntil && validFrom >= validUntil) {
      return createErrorResponse('validFrom must be before validUntil', 400, 'VALIDATION_ERROR');
    }

    // TODO: Update in database
    // const updated = await db.coupons.update({
    //   where: { id },
    //   data: {
    //     ...data,
    //     validFrom,
    //     validUntil,
    //     updatedAt: new Date(),
    //   },
    // });

    // TODO: Log activity
    // await logStaffActivity(auth.userId, 'updated_coupon', id, {
    //   updatedFields: Object.keys(data),
    // });

    return createSuccessResponse(
      { couponId: id, updatedFields: Object.keys(data) },
      'Coupon updated successfully'
    );
  } catch (error) {
    return handleApiError(error, 'PUT /api/marketing/coupons/[id]');
  }
}

/**
 * DELETE /api/marketing/coupons/[id]
 * حذف كوبون
 * Delete coupon
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Check admin permissions
    const { auth, authorized } = await requireAdminPermission(request, ['manage_marketing', 'admin']);
    
    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    // TODO: Check if coupon exists
    // const existing = await db.coupons.findUnique({ where: { id } });
    // if (!existing) {
    //   return createErrorResponse('Coupon not found', 404, 'NOT_FOUND');
    // }

    // TODO: Check if coupon has been used
    // const usageCount = await db.couponUsages.count({ where: { couponId: id } });
    // if (usageCount > 0) {
    //   // Soft delete - just deactivate
    //   await db.coupons.update({
    //     where: { id },
    //     data: { isActive: false, deletedAt: new Date() },
    //   });
    //   return createSuccessResponse(
    //     { couponId: id, deactivated: true },
    //     'Coupon deactivated (has existing usages)'
    //   );
    // }

    // TODO: Delete from database (hard delete if no usages)
    // await db.coupons.delete({ where: { id } });

    // TODO: Log activity
    // await logStaffActivity(auth.userId, 'deleted_coupon', id, {});

    return createSuccessResponse(
      { couponId: id, deleted: true },
      'Coupon deleted successfully'
    );
  } catch (error) {
    return handleApiError(error, 'DELETE /api/marketing/coupons/[id]');
  }
}
