/**
 * API - Coupon Validation with Atomic Usage Tracking
 * Coupon Validation API
 * 
 * Routes:
 * POST /api/marketing/coupons/validate - Validate a coupon code
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { Coupon } from '@/lib/models';
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
 * POST /api/marketing/coupons/validate
 * Validate coupon code and check usage limits atomically
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

    const validation = await validateRequestBody<{
      code: string;
      customerId: string;
      orderAmount: number;
      productIds?: string[];
      categoryIds?: string[];
    }>(request, {
      required: ['code', 'customerId', 'orderAmount'],
      optional: ['productIds', 'categoryIds'],
      types: {
        code: 'string',
        customerId: 'string',
        orderAmount: 'number',
        productIds: 'array',
        categoryIds: 'array',
      },
      validators: {
        code: (value: string) => ({
          valid: value.length >= 3,
          error: 'Code must be at least 3 characters',
        }),
        orderAmount: (value: number) => ({
          valid: value > 0,
          error: 'Order amount must be positive',
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

    const { code, customerId, orderAmount, productIds, categoryIds } = validation.data!;
    const sanitizedCode = sanitizeInput(code).toUpperCase();

    // ATOMIC VALIDATION: Find active coupon with usage check
    const now = new Date();
    
    const coupon = await Coupon.findOne({
      code: sanitizedCode,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      currentUsages: { $lt: { $ref: 'maxUsages' } }, // Usage limit check
    });

    if (!coupon) {
      // Check if coupon exists for better error message
      const existingCoupon = await Coupon.findOne({ code: sanitizedCode });
      
      if (!existingCoupon) {
        return createErrorResponse('Coupon not found', 404, 'NOT_FOUND');
      }
      
      // Determine specific error
      if (!existingCoupon.isActive) {
        return createSuccessResponse({
          valid: false,
          error: 'Coupon is not active',
          errorCode: 'INACTIVE_COUPON',
        }, 'Coupon validation result');
      }
      
      if (existingCoupon.validFrom > now) {
        return createSuccessResponse({
          valid: false,
          error: 'Coupon is not yet valid',
          errorCode: 'NOT_YET_VALID',
          validFrom: existingCoupon.validFrom,
        }, 'Coupon validation result');
      }
      
      if (existingCoupon.validUntil < now) {
        return createSuccessResponse({
          valid: false,
          error: 'Coupon has expired',
          errorCode: 'EXPIRED_COUPON',
          expiredAt: existingCoupon.validUntil,
        }, 'Coupon validation result');
      }
      
      if (existingCoupon.currentUsages >= existingCoupon.maxUsages) {
        return createSuccessResponse({
          valid: false,
          error: 'Coupon usage limit reached',
          errorCode: 'USAGE_LIMIT_REACHED',
        }, 'Coupon validation result');
      }
      
      return createSuccessResponse({
        valid: false,
        error: 'Coupon is not valid',
        errorCode: 'INVALID_COUPON',
      }, 'Coupon validation result');
    }

    // Additional validations
    const errors: string[] = [];

    if (coupon.usedBy?.includes(customerId)) {
      errors.push('You have already used this coupon');
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      errors.push(`Minimum order amount is ${coupon.minOrderAmount}`);
    }

    if (coupon.applicableProducts && productIds && productIds.length > 0) {
      const hasApplicableProduct = productIds.some((id: string) => 
        coupon.applicableProducts?.includes(id)
      );
      if (!hasApplicableProduct) {
        errors.push('Coupon does not apply to these products');
      }
    }

    if (coupon.applicableCategories && categoryIds && categoryIds.length > 0) {
      const hasApplicableCategory = categoryIds.some((id: string) => 
        coupon.applicableCategories?.includes(id)
      );
      if (!hasApplicableCategory) {
        errors.push('Coupon does not apply to these categories');
      }
    }

    if (errors.length > 0) {
      return createSuccessResponse({
        valid: false,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        errors,
      }, 'Coupon validation result');
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = orderAmount * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, orderAmount);

    return createSuccessResponse({
      valid: true,
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      finalAmount: orderAmount - discount,
    }, 'Coupon is valid');
  } catch (error) {
    return handleApiError(error, 'POST /api/marketing/coupons/validate');
  }
}

/**
 * ATOMIC COUPON USAGE INCREMENT
 * This function should be called when an order is actually created
 * to atomically increment the coupon usage counter
 */
export async function incrementCouponUsage(
  couponCode: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    
    const sanitizedCode = couponCode.toUpperCase();
    
    // Atomic increment with usage limit check
    const updated = await Coupon.findOneAndUpdate(
      {
        code: sanitizedCode,
        isActive: true,
        currentUsages: { $lt: { $ref: 'maxUsages' } },
        usedBy: { $ne: customerId }, // Customer hasn't used it yet
      },
      {
        $inc: { currentUsages: 1 },
        $push: { usedBy: customerId },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!updated) {
      // Check why update failed
      const coupon = await Coupon.findOne({ code: sanitizedCode });
      
      if (!coupon) {
        return { success: false, error: 'Coupon not found' };
      }
      
      if (coupon.currentUsages >= coupon.maxUsages) {
        return { success: false, error: 'Coupon usage limit reached' };
      }
      
      if (coupon.usedBy?.includes(customerId)) {
        return { success: false, error: 'Customer already used this coupon' };
      }
      
      return { success: false, error: 'Failed to apply coupon' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    return { success: false, error: 'Internal error' };
  }
}
