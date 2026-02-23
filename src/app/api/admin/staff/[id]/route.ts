/**
 * API - إدارة موظف فردي (Prisma)
 * Individual Staff Member Management API (Prisma Ready)
 * 
 * Routes:
 * GET /api/admin/staff/[id] - Get staff details
 * PATCH /api/admin/staff/[id] - Update staff
 * DELETE /api/admin/staff/[id] - Delete staff
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/security';
import {
  requireAdminPermission,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
} from '@/lib/api-utils';

const RATE_LIMIT_ADMIN = { maxRequests: 100, windowMs: 60 * 1000 };
const VALID_ROLES = ['admin', 'supervisor', 'staff', 'support'] as const;
const VALID_PERMISSIONS = [
  'view_orders',
  'manage_orders',
  'verify_payments',
  'manage_products',
  'manage_staff',
  'manage_settings',
  'view_reports',
  'manage_customers',
  'admin',
];

/**
 * GET /api/admin/staff/[id]
 * الحصول على تفاصيل موظف
 * Get staff member details
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

    const { auth, authorized } = await requireAdminPermission(request, ['manage_staff', 'admin']);

    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    // Fetch staff from Prisma
    const staff = await prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            permission: true,
            canPerform: true
          }
        },
      }
    });

    if (!staff) {
      return createErrorResponse('Staff member not found', 404, 'NOT_FOUND');
    }

    return createSuccessResponse({ staff });
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/staff/[id]');
  }
}

/**
 * PATCH /api/admin/staff/[id]
 * تحديث موظف
 * Update staff member
 */
export async function PATCH(
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

    const { auth, authorized } = await requireAdminPermission(request, ['manage_staff', 'admin']);

    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    const validation = await validateRequestBody<{
      fullName?: string;
      role?: string;
      permissions?: string[];
      isActive?: boolean;
    }>(request, {
      optional: ['fullName', 'role', 'permissions', 'isActive'],
      types: {
        fullName: 'string',
        role: 'string',
        permissions: 'array',
        isActive: 'boolean',
      },
      validators: {
        role: (value: string) => {
          if (!value) return { valid: true };
          return {
            valid: VALID_ROLES.includes(value as any),
            error: `Role must be one of: ${VALID_ROLES.join(', ')}`,
          };
        },
        permissions: (value: string[]) => {
          if (!value) return { valid: true };
          return {
            valid: Array.isArray(value) && value.every(p => VALID_PERMISSIONS.includes(p)),
            error: `Permissions must be valid values`,
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

    // Check if staff exists
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return createErrorResponse('Staff member not found', 404, 'NOT_FOUND');
    }

    // Role protection - only owner can change other owners or critical roles if needed
    if (existing.role === 'owner' && auth.role !== 'owner') {
      return createErrorResponse('Only the system owner can modify this account', 403, 'FORBIDDEN');
    }

    // Build update data and permissions in a transaction
    const updateResult = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const updatedStaff = await tx.staff.update({
        where: { id },
        data: {
          fullName: data.fullName ? sanitizeInput(data.fullName) : undefined,
          role: data.role ? (data.role as any) : undefined,
          isActive: data.isActive !== undefined ? data.isActive : undefined,
        },
      });

      // 2. Update permissions if provided
      if (data.permissions) {
        // Delete existing and create new (simplest sync strategy)
        await tx.staffPermission.deleteMany({
          where: { staffId: id },
        });

        await tx.staffPermission.createMany({
          data: data.permissions.map((perm) => ({
            staffId: id,
            permission: perm,
            canPerform: true,
          })),
        });
      }

      // 3. Log activity
      await tx.staffActivity.create({
        data: {
          staffId: auth.userId,
          action: 'updated_staff_member',
          targetId: id,
          targetType: 'staff',
          details: {
            updatedFields: Object.keys(data),
          },
        },
      });

      return updatedStaff;
    });

    return createSuccessResponse(
      { staffId: updateResult.id, updatedFields: Object.keys(data) },
      'Staff member updated successfully'
    );
  } catch (error) {
    return handleApiError(error, 'PATCH /api/admin/staff/[id]');
  }
}

/**
 * DELETE /api/admin/staff/[id]
 * حذف موظف (Soft Delete)
 * Delete staff member
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

    const { auth, authorized } = await requireAdminPermission(request, ['manage_staff', 'admin']);

    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    // Prevent deleting yourself
    if (id === auth.userId) {
      return createErrorResponse('Cannot delete your own account', 400, 'FORBIDDEN');
    }

    // Check if staff exists
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return createErrorResponse('Staff member not found', 404, 'NOT_FOUND');
    }

    if (existing.role === 'owner') {
      return createErrorResponse('Cannot delete owner account', 403, 'FORBIDDEN');
    }

    // Soft delete - update status and deletedAt
    await prisma.staff.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: auth.userId,
      },
    });

    // Log staff activity
    await prisma.staffActivity.create({
      data: {
        staffId: auth.userId,
        action: 'deleted_staff_member',
        targetId: id,
        targetType: 'staff',
        details: {
          timestamp: new Date(),
          email: existing.email,
        },
      },
    });

    return createSuccessResponse(
      { staffId: id },
      'Staff member deleted successfully'
    );
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/staff/[id]');
  }
}
