/**
 * API - نظام الكوبونات
 * Coupons Management API
 * 
 * Routes:
 * GET /api/marketing/coupons - Get coupons (public: active only, admin: all)
 * POST /api/marketing/coupons - Create new coupon (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Coupon, CouponUsage } from '@/lib/db-models';
import { generateCouponCode, sanitizeInput } from '@/lib/security';
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
 * GET /api/marketing/coupons
 * الحصول على الكوبونات
 * Get coupons list
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const auth = await validateAuthFromCookies();
    const isAdmin = auth && (auth.role === 'admin' || auth.role === 'super_admin' || auth.role === 'owner');
    
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(
      request,
      isAdmin ? RATE_LIMIT_ADMIN.maxRequests : RATE_LIMIT_PUBLIC.maxRequests,
      isAdmin ? RATE_LIMIT_ADMIN.windowMs : RATE_LIMIT_PUBLIC.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    
    if (isAdmin) {
      // Admin can see all coupons
      const status = searchParams.get('status');
      
      // TODO: Fetch from database
      // const where: any = {};
      // if (status) where.isActive = status === 'active';
      // 
      // const coupons = await db.coupons.findMany({
      //   where,
      //   skip: pagination.skip,
      //   take: pagination.limit,
      // });
      // const total = await db.coupons.count({ where });

      // Placeholder
      const coupons: Coupon[] = [];
      const total = 0;

      return createPaginatedResponse(coupons, total, pagination.page, pagination.limit);
    } else {
      // Public: only active, valid coupons
      const now = new Date();
      
      // TODO: Fetch from database
      // const coupons = await db.coupons.findMany({
      //   where: {
      //     isActive: true,
      //     validFrom: { lte: now },
      //     validUntil: { gte: now },
      //     currentUsages: { lt: db.coupons.fields.maxUsages },
      //   },
      //   select: {
      //     id: true,
      //     code: true,
      //     description: true,
      //     discountType: true,
      //     discountValue: true,
      //     validFrom: true,
      //     validUntil: true,
      //   },
      // });

      // Placeholder
      return createSuccessResponse([], 'Active coupons retrieved successfully');
    }
  } catch (error) {
    return handleApiError(error, 'GET /api/marketing/coupons');
  }
}

/**
 * POST /api/marketing/coupons
 * إنشاء كوبون خصم جديد (للمدير فقط)
 * Create new coupon (admin only)
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

    // Check admin permissions
    const { auth, authorized } = await requireAdminPermission(request, ['manage_marketing', 'admin']);
    
    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    const validation = await validateRequestBody<{
      code: string;
      discountType: 'percentage' | 'fixed-amount';
      discountValue: number;
      maxUsages: number;
      validFrom: string;
      validUntil: string;
      description?: string;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      applicableCategories?: string[];
      applicableProducts?: string[];
    }>(request, {
      required: ['code', 'discountType', 'discountValue', 'maxUsages', 'validFrom', 'validUntil'],
      optional: ['description', 'minOrderAmount', 'maxDiscountAmount', 'applicableCategories', 'applicableProducts'],
      types: {
        code: 'string',
        discountType: 'string',
        discountValue: 'number',
        maxUsages: 'number',
        validFrom: 'string',
        validUntil: 'string',
        description: 'string',
        minOrderAmount: 'number',
        maxDiscountAmount: 'number',
        applicableCategories: 'array',
        applicableProducts: 'array',
      },
      validators: {
        code: (value: string) => ({
          valid: value.length >= 3 && value.length <= 20,
          error: 'Code must be between 3 and 20 characters',
        }),
        discountType: (value: string) => ({
          valid: ['percentage', 'fixed-amount'].includes(value),
          error: 'Discount type must be either percentage or fixed-amount',
        }),
        discountValue: (value: number) => ({
          valid: value > 0,
          error: 'Discount value must be positive',
        }),
        maxUsages: (value: number) => ({
          valid: value > 0 && Number.isInteger(value),
          error: 'Max usages must be a positive integer',
        }),
        validFrom: (value: string) => {
          const date = new Date(value);
          return {
            valid: !isNaN(date.getTime()),
            error: 'Invalid date format for validFrom',
          };
        },
        validUntil: (value: string) => {
          const date = new Date(value);
          return {
            valid: !isNaN(date.getTime()),
            error: 'Invalid date format for validUntil',
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
    
    // Parse dates
    const validFrom = new Date(data.validFrom);
    const validUntil = new Date(data.validUntil);
    
    // Validate date range
    if (validFrom >= validUntil) {
      return createErrorResponse(
        'validFrom must be before validUntil',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Validate percentage discount
    if (data.discountType === 'percentage' && (data.discountValue < 0 || data.discountValue > 100)) {
      return createErrorResponse(
        'Percentage discount must be between 0 and 100',
        400,
        'VALIDATION_ERROR'
      );
    }

    // TODO: Check if coupon code already exists
    // const existing = await db.coupons.findUnique({ where: { code: data.code.toUpperCase() } });
    // if (existing) {
    //   return createErrorResponse('Coupon code already exists', 409, 'CONFLICT');
    // }

    const coupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUsages: data.maxUsages,
      currentUsages: 0,
      usedBy: [],
      minOrderAmount: data.minOrderAmount,
      maxDiscountAmount: data.maxDiscountAmount,
      validFrom,
      validUntil,
      applicableCategories: data.applicableCategories,
      applicableProducts: data.applicableProducts,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Save to database
    // await db.coupons.create(coupon);

    // TODO: Log activity
    // await logStaffActivity(auth.userId, 'created_coupon', coupon.id, { code: coupon.code });

    return createSuccessResponse(
      { coupon },
      'Coupon created successfully',
      201
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/marketing/coupons');
  }
}
