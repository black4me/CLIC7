/**
 * API Utilities - Authentication, Validation, Error Handling & Rate Limiting
 * وظائف مساعدة للـ API - المصادقة، التحقق، معالجة الأخطاء، والحد من المعدل
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT, sanitizeInput } from '@/lib/security';

// ============ TYPES ============

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface AuthContext {
  userId: string;
  role: string;
  permissions: string[];
  email: string;
  isAuthenticated: boolean;
  twoFactorVerified?: boolean;
}

// ============ AUTHENTICATION ============

/**
 * Validate admin authentication from cookies
 * التحقق من مصادقة المدير من الكوكيز
 */
export async function validateAuthFromCookies(): Promise<AuthContext | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('clic7_admin_token')?.value;

    if (!authToken) {
      return null;
    }

    const verification = verifyJWT(authToken);

    if (!verification.valid || !verification.payload) {
      return null;
    }

    return {
      userId: verification.payload.userId || verification.payload.sub || '',
      role: verification.payload.role || 'user',
      permissions: verification.payload.permissions || [],
      email: verification.payload.email || '',
      isAuthenticated: true,
      twoFactorVerified: verification.payload.twoFactorVerified || false,
    };
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

/**
 * Validate admin authentication specifically
 * التحقق من مصادقة المدير
 */
export async function validateAdminAuth(): Promise<AuthContext | null> {
  const auth = await validateAuthFromCookies();

  if (!auth) {
    return null;
  }

  // Check if user has admin role
  const adminRoles = ['admin', 'super_admin', 'owner', 'supervisor', 'staff', 'support'];
  if (!adminRoles.includes(auth.role.toLowerCase())) {
    return null;
  }

  return auth;
}

// ============ PERMISSION CHECKS ============

/**
 * Check if user has required permissions
 * التحقق من صلاحيات المستخدم
 */
export function checkPermission(
  auth: AuthContext | null,
  requiredPermissions: string | string[]
): boolean {
  if (!auth || !auth.isAuthenticated) {
    return false;
  }

  // Super admins have all permissions
  if (auth.role === 'super_admin' || auth.role === 'owner') {
    return true;
  }

  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return permissions.every(perm => auth.permissions.includes(perm));
}

/**
 * Middleware to check permissions
 * وسيط للتحقق من الصلاحيات
 */
export async function requirePermission(
  request: NextRequest,
  permissions: string | string[]
): Promise<{ auth: AuthContext | null; authorized: boolean }> {
  const auth = await validateAuthFromCookies();
  const authorized = checkPermission(auth, permissions);
  return { auth, authorized };
}

/**
 * Middleware to check admin permission
 * وسيط للتحقق من صلاحيات المدير
 */
export async function requireAdminPermission(
  request: NextRequest,
  permissions: string | string[]
): Promise<{ auth: AuthContext | null; authorized: boolean }> {
  const auth = await validateAdminAuth();
  const authorized = checkPermission(auth, permissions);
  return { auth, authorized };
}

/**
 * Check if 2FA is verified for sensitive admin operations
 * التحقق من التحقق بخطوتين للعمليات الإدارية الحساسة
 */
export function require2FAVerified(auth: AuthContext | null): boolean {
  if (!auth || !auth.isAuthenticated) {
    return false;
  }

  // Check if JWT includes 2FA verification flag
  return auth.twoFactorVerified === true;
}

/**
 * Middleware to check admin permission with 2FA requirement
 * HARD BLOCK for Payments and Keys dashboards
 */
export async function requireAdminPermissionWith2FA(
  request: NextRequest,
  permissions: string | string[]
): Promise<{ auth: AuthContext | null; authorized: boolean; twoFactorVerified: boolean }> {
  const auth = await validateAdminAuth();
  const authorized = checkPermission(auth, permissions);
  const twoFactorVerified = require2FAVerified(auth);

  // Log 2FA check for security auditing
  if (auth && !twoFactorVerified) {
    console.warn(`[SECURITY] 2FA NOT VERIFIED - Access attempt blocked for ${auth.email} to ${permissions} at ${new Date().toISOString()}`);
  }

  return { auth, authorized, twoFactorVerified };
}

// ============ ERROR HANDLING ============

/**
 * Create consistent API error response
 * إنشاء رد خطأ متسق للـ API
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  code?: string,
  details?: Record<string, any>
): NextResponse {
  const body: ApiErrorResponse = { error };

  if (code) body.code = code;
  if (details) body.details = details;

  return NextResponse.json(body, { status });
}

/**
 * Create consistent API success response
 * إنشاء رد نجاح متسق للـ API
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse {
  const body: ApiSuccessResponse<T> = { success: true };

  if (data !== undefined) body.data = data;
  if (message) body.message = message;

  return NextResponse.json(body, { status });
}

/**
 * Handle API errors consistently
 * معالجة أخطاء API بشكل متسق
 */
export function handleApiError(error: unknown, operation: string): NextResponse {
  console.error(`Error in ${operation}:`, error);

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Invalid token')) {
      return createErrorResponse('Authentication required', 401, 'AUTH_REQUIRED');
    }

    if (error.message.includes('permission') || error.message.includes('Permission')) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return createErrorResponse('Resource not found', 404, 'NOT_FOUND');
    }

    if (error.message.includes('already exists')) {
      return createErrorResponse(error.message, 409, 'CONFLICT');
    }

    if (error.message.includes('validation') || error.message.includes('Validation')) {
      return createErrorResponse(error.message, 400, 'VALIDATION_ERROR');
    }

    return createErrorResponse(error.message, 500, 'INTERNAL_ERROR');
  }

  return createErrorResponse('An unexpected error occurred', 500, 'INTERNAL_ERROR');
}

/**
 * Validate and sanitize request body
 * التحقق وتنظيف جسم الطلب
 */
export async function validateRequestBody<T extends Record<string, any>>(
  request: NextRequest,
  schema: {
    required?: string[];
    optional?: string[];
    types?: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>;
    validators?: Record<string, (value: any) => { valid: boolean; error?: string }>;
  }
): Promise<{ valid: boolean; data?: T; errors?: string[] }> {
  try {
    let body: any;

    try {
      body = await request.json();
    } catch {
      return { valid: false, errors: ['Invalid JSON body'] };
    }

    const errors: string[] = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Validate types
    if (schema.types) {
      for (const [field, type] of Object.entries(schema.types)) {
        const value = body[field];
        if (value === undefined || value === null) continue;

        switch (type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`Field ${field} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push(`Field ${field} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`Field ${field} must be a boolean`);
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`Field ${field} must be an array`);
            }
            break;
          case 'object':
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
              errors.push(`Field ${field} must be an object`);
            }
            break;
        }
      }
    }

    // Run custom validators
    if (schema.validators) {
      for (const [field, validator] of Object.entries(schema.validators)) {
        const value = body[field];
        if (value === undefined || value === null) continue;

        const result = validator(value);
        if (!result.valid) {
          errors.push(result.error || `Field ${field} is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Sanitize string fields
    const sanitized: T = {} as T;
    const allFields = [...(schema.required || []), ...(schema.optional || [])];

    for (const field of allFields) {
      const value = body[field];
      if (typeof value === 'string') {
        sanitized[field as keyof T] = sanitizeInput(value) as any;
      } else {
        sanitized[field as keyof T] = value;
      }
    }

    return { valid: true, data: sanitized };
  } catch (error) {
    return { valid: false, errors: ['Failed to validate request body'] };
  }
}

// ============ RATE LIMITING ============

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter (replace with Redis in production)
// حد معدل بسيط في الذاكرة (استبدل بـ Redis في الإنتاج)
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

/**
 * Clean up expired rate limit entries
 * تنظيف إدخالات الحد من المعدل المنتهية
 */
function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, entry] of entries) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Check if request should be rate limited
 * التحقق مما إذا كان يجب تقييد معدل الطلب
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = RATE_LIMIT_WINDOW
): { allowed: boolean; remaining: number; resetTime: number } {
  // Cleanup expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup
    cleanupExpiredRateLimits();
  }

  const now = Date.now();
  const key = identifier;
  const existing = rateLimitMap.get(key);

  if (!existing || existing.resetTime < now) {
    // New window
    const resetTime = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }

  existing.count++;
  return { allowed: true, remaining: maxRequests - existing.count, resetTime: existing.resetTime };
}

/**
 * Rate limit middleware for Next.js API routes
 * وسيط الحد من المعدل لطرق API في Next.js
 */
export async function applyRateLimit(
  request: NextRequest,
  maxRequests: number = 60,
  windowMs: number = RATE_LIMIT_WINDOW
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // Get identifier from IP or user ID
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userId = (await validateAuthFromCookies())?.userId;
  const identifier = userId || ip;

  const result = checkRateLimit(identifier, maxRequests, windowMs);

  if (!result.allowed) {
    const response = createErrorResponse(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
    response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());

    return { allowed: false, response };
  }

  return { allowed: true };
}

// ============ UTILITY FUNCTIONS ============

/**
 * Get client IP from request
 * الحصول على IP العميل من الطلب
 */
export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

/**
 * Parse pagination params from request
 * تحليل معاملات الترقيم من الطلب
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create paginated response
 * إنشاء رد مجزأ
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  const totalPages = Math.ceil(total / limit);

  return createSuccessResponse({
    items: data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}

/**
 * With error handling wrapper
 * مغلف مع معالجة الأخطاء
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, operationName);
    }
  }) as T;
}

/**
 * Middleware to apply rate limit to route
 * وسيط لتطبيق الحد من المعدل على المسار
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  maxRequests: number = 60,
  windowMs: number = RATE_LIMIT_WINDOW
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const rateLimitResult = await applyRateLimit(request, maxRequests, windowMs);

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    return handler(request);
  };
}

/**
 * Middleware to require authentication
 * وسيط لطلب المصادقة
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>,
  permissions?: string | string[]
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const { auth, authorized } = await requirePermission(request, permissions || []);

    if (!auth || !auth.isAuthenticated) {
      return createErrorResponse('Authentication required', 401, 'AUTH_REQUIRED');
    }

    if (permissions && !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    return handler(request, auth);
  };
}

/**
 * Middleware to require admin authentication
 * وسيط لطلب مصادقة المدير
 */
export function withAdminAuth(
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>,
  permissions?: string | string[]
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const { auth, authorized } = await requireAdminPermission(request, permissions || []);

    if (!auth || !auth.isAuthenticated) {
      return createErrorResponse('Admin authentication required', 401, 'AUTH_REQUIRED');
    }

    if (permissions && !authorized) {
      return createErrorResponse('Insufficient admin permissions', 403, 'FORBIDDEN');
    }

    return handler(request, auth);
  };
}
