/**
 * API - Game Key Inventory Check
 * GET /api/admin/gamekeys/inventory
 * Check inventory levels for all games using Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAdminPermissionWith2FA,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  applyRateLimit,
} from '@/lib/api-utils';

const RATE_LIMIT_ADMIN = { maxRequests: 100, windowMs: 60 * 1000 };

export async function GET(request: NextRequest) {
  try {
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

    // Fetch all keys to aggregate in-memory (more flexible than Prisma groupBy for conditional counts)
    const allKeys = await prisma.gameKey.findMany({
      select: {
        productId: true,
        gameName: true,
        platform: true,
        status: true,
      }
    });

    const inventoryMap = new Map();

    allKeys.forEach(key => {
      const id = `${key.productId}-${key.platform}`;
      if (!inventoryMap.has(id)) {
        inventoryMap.set(id, {
          productId: key.productId,
          gameName: key.gameName,
          platform: key.platform,
          total: 0,
          available: 0,
          sold: 0,
          reserved: 0
        });
      }

      const stats = inventoryMap.get(id);
      stats.total++;
      if (key.status === 'available') stats.available++;
      else if (key.status === 'sold') stats.sold++;
      else if (key.status === 'reserved') stats.reserved++;
    });

    const inventory = Array.from(inventoryMap.values()).map(item => ({
      ...item,
      lowStock: item.available <= 5
    })).sort((a, b) => a.gameName.localeCompare(b.gameName));

    // Calculate totals
    const totals = inventory.reduce((acc, item) => ({
      total: acc.total + item.total,
      available: acc.available + item.available,
      sold: acc.sold + item.sold,
      reserved: acc.reserved + item.reserved,
    }), { total: 0, available: 0, sold: 0, reserved: 0 });

    const lowStockItems = inventory.filter(item => item.lowStock);

    return createSuccessResponse({
      inventory,
      totals,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map(item => ({
        productId: item.productId,
        gameName: item.gameName,
        platform: item.platform,
        available: item.available,
      })),
    }, 'Inventory retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/gamekeys/inventory');
  }
}
