/**
 * API - نظام إدارة الموظفين والصلاحيات
 * Staff Management & Access Control API
 * 
 * Routes:
 * GET /api/admin/staff - Get staff list
 * POST /api/admin/staff - Add new staff member
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StaffActivity } from '@prisma/client';
import {
  hashPassword,
  generateOTP,
  sanitizeInput,
  isValidEmail,
} from '@/lib/security';
import { sendStaffWelcomeEmail } from '@/lib/email-service';
import {
  requireAdminPermission,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
  getPaginationParams,
  createPaginatedResponse,
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
 * GET /api/admin/staff
 * الحصول على قائمة الموظفين (للمدير)
 * Get staff list
 */
export async function GET(request: NextRequest) {
  try {
    // Prisma handles connection automatically via adapter in lib/prisma.ts

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

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const role = searchParams.get('role');
    const status = searchParams.get('status'); // active, inactive, all

    // Build Prisma query
    const where: any = {};
    if (role) where.role = role as any;
    if (status && status !== 'all') where.isActive = status === 'active';

    // Fetch staff from database
    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          permissions: true,
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staff.count({ where })
    ]);

    return createPaginatedResponse(staff, total, pagination.page, pagination.limit);
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/staff');
  }
}

/**
 * POST /api/admin/staff
 * إضافة موظف جديد (للمدير فقط)
 * Add new staff member
 */
export async function POST(request: NextRequest) {
  try {
    // Prisma connection is handled automatically

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
      email: string;
      fullName: string;
      role: string;
      permissions: string[];
    }>(request, {
      required: ['email', 'fullName', 'role', 'permissions'],
      types: {
        email: 'string',
        fullName: 'string',
        role: 'string',
        permissions: 'array',
      },
      validators: {
        email: (value: string) => ({
          valid: isValidEmail(value),
          error: 'Invalid email format',
        }),
        role: (value: string) => ({
          valid: VALID_ROLES.includes(value as any),
          error: `Role must be one of: ${VALID_ROLES.join(', ')}`,
        }),
        permissions: (value: string[]) => ({
          valid: Array.isArray(value) && value.every(p => VALID_PERMISSIONS.includes(p)),
          error: `Permissions must be valid values: ${VALID_PERMISSIONS.join(', ')}`,
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

    const { email, fullName, role, permissions } = validation.data!;

    // Check if staff with this email already exists
    const existing = await prisma.staff.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existing) {
      return createErrorResponse('Staff member with this email already exists', 409, 'CONFLICT');
    }

    // Generate temporary password
    const tempPassword = generateOTP(12);
    const hashedPassword = await hashPassword(tempPassword);

    // Create staff document
    const staff = await prisma.staff.create({
      data: {
        email: email.toLowerCase(),
        fullName: sanitizeInput(fullName),
        password: hashedPassword,
        role: role as any,
        isActive: true,
        twoFactorEnabled: true,
        loginAttempts: 0,
        isLocked: false,
        permissions: {
          create: permissions.map((perm) => ({
            permission: perm,
            canPerform: true,
          })),
        },
      },
    });

    // Send welcome email
    try {
      await sendStaffWelcomeEmail(email, fullName, tempPassword);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Log staff activity
    await prisma.staffActivity.create({
      data: {
        staffId: auth.userId,
        action: 'added_staff_member',
        targetId: staff.id,
        targetType: 'staff',
        details: {
          email,
          fullName,
          role,
          permissions,
        },
      },
    });

    return createSuccessResponse(
      {
        staff: {
          id: staff.id,
          email: staff.email,
          fullName: staff.fullName,
          role: staff.role,
          isActive: staff.isActive,
          createdAt: staff.createdAt,
        },
        // tempPassword is NOT returned in response - only sent via email
      },
      'Staff member added successfully. Temporary password sent to email.',
      201
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/staff');
  }
}
