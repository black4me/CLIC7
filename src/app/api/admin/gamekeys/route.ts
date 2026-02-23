/**
 * API - Game Key Management System
 * Admin API for managing game key inventory
 * 
 * Routes:
 * GET /api/admin/gamekeys - List game keys with inventory
 * POST /api/admin/gamekeys/bulk-import - Bulk import keys
 * GET /api/admin/gamekeys/inventory - Check inventory levels
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeInput, encrypt, decrypt } from '@/lib/security';
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
 * GET /api/admin/gamekeys
 * List game keys with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Prisma handles connection

    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Check admin permissions WITH 2FA REQUIREMENT
    // CRITICAL: Keys dashboard is hard-blocked without 2FA verification
    const { auth, authorized, twoFactorVerified } = await requireAdminPermissionWith2FA(
      request,
      ['manage_products', 'view_reports']
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
    const pagination = getPaginationParams(searchParams);
    const productId = searchParams.get('productId') || searchParams.get('gameId');
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    // Build Prisma query
    const where: any = {};
    if (productId) where.productId = productId;
    if (status) where.status = status as any;
    if (platform) where.platform = platform;

    // Fetch keys (excluding the actual key value for security where requested)
    const [keys, total] = await Promise.all([
      prisma.gameKey.findMany({
        where,
        select: {
          id: true,
          productId: true,
          gameName: true,
          platform: true,
          status: true,
          orderId: true,
          customerId: true,
          purchasedAt: true,
          deliveredAt: true,
          createdAt: true,
          // encryptedKey is NOT selected to keep it safe in lists
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.gameKey.count({ where })
    ]);

    return createPaginatedResponse(keys, total, pagination.page, pagination.limit);
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/gamekeys');
  }
}

/**
 * POST /api/admin/gamekeys/bulk-import
 * Bulk import game keys
 */
export async function POST(request: NextRequest) {
  try {
    // Prisma handles connection

    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Check admin permissions WITH 2FA REQUIREMENT
    // CRITICAL: Keys management is hard-blocked without 2FA verification
    const { auth, authorized, twoFactorVerified } = await requireAdminPermissionWith2FA(
      request,
      ['manage_products']
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

    const validation = await validateRequestBody<{
      productId: string;
      gameName: string;
      platform: string;
      keys: string[];
    }>(request, {
      required: ['productId', 'gameName', 'platform', 'keys'],
      types: {
        productId: 'string',
        gameName: 'string',
        platform: 'string',
        keys: 'array',
      },
      validators: {
        keys: (value: string[]) => ({
          valid: Array.isArray(value) && value.length > 0 && value.length <= 1000,
          error: 'Must provide 1-1000 keys',
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

    const { productId, gameName, platform, keys } = validation.data!;

    // Sanitize inputs
    const sanitizedProductId = sanitizeInput(productId);
    const sanitizedGameName = sanitizeInput(gameName);
    const sanitizedPlatform = sanitizeInput(platform);

    // Check for duplicate keys in Prisma
    const encryptedKeys = await Promise.all(keys.map(key => encrypt(key))); // We must encrypt to compare if we store encrypted

    // Note: If we use unique constraint on encryptedKey in DB, we can just try/catch createMany
    // But let's check manually for better error reporting
    const existingKeys = await prisma.gameKey.findMany({
      where: {
        encryptedKey: { in: encryptedKeys }
      },
      select: { encryptedKey: true }
    });

    const existingEncryptedSet = new Set(existingKeys.map(k => k.encryptedKey));
    const newKeyPairs = keys.map(k => ({ plain: k, encrypted: encrypt(k) }))
      .filter(p => !existingEncryptedSet.has(p.encrypted));

    const duplicatesCount = keys.length - newKeyPairs.length;

    if (newKeyPairs.length === 0) {
      return createErrorResponse(
        'All keys already exist in database',
        409,
        'DUPLICATE_KEYS',
        { duplicates: duplicatesCount }
      );
    }

    // Bulk insert with Prisma
    const result = await prisma.gameKey.createMany({
      data: newKeyPairs.map(p => ({
        encryptedKey: p.encrypted,
        productId: sanitizedProductId,
        gameName: sanitizedGameName,
        platform: sanitizedPlatform,
        status: 'available',
      })),
      skipDuplicates: true,
    });

    // Log activity using specialized Prisma model
    await prisma.staffActivity.create({
      data: {
        staffId: auth.userId,
        action: 'bulk_import_keys',
        targetId: sanitizedProductId,
        targetType: 'game',
        details: {
          gameName: sanitizedGameName,
          platform: sanitizedPlatform,
          importedCount: result.count,
          duplicateCount: duplicatesCount,
        },
      },
    });

    return createSuccessResponse(
      {
        imported: result.count,
        duplicates: duplicatesCount,
        productId: sanitizedProductId,
        gameName: sanitizedGameName,
      },
      `Successfully imported ${result.count} keys${duplicatesCount > 0 ? `, ${duplicatesCount} duplicates skipped` : ''}`,
      201
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/gamekeys/bulk-import');
  }
}
