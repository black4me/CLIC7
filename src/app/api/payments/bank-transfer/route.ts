/**
 * API - نظام التحويل البنكي اليدوي والتحقق
 * Bank Transfer & Verification API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { BankTransferDetails, PaymentTransaction } from '@/lib/db-models';
import { generateTransactionId, sanitizeInput } from '@/lib/security';
import { sendEmail, emailTemplates } from '@/lib/email-service';
import {
  validateAdminAuth,
  requireAdminPermission,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
  withAdminAuth,
} from '@/lib/api-utils';

// Rate limit settings for different endpoints
const RATE_LIMIT_UPLOAD = { maxRequests: 10, windowMs: 60 * 1000 }; // 10 per minute
const RATE_LIMIT_DEFAULT = { maxRequests: 60, windowMs: 60 * 1000 }; // 60 per minute

/**
 * POST /api/payments/bank-transfer/upload-receipt
 * رفع صورة إيصال التحويل
 * Upload bank transfer receipt
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_UPLOAD.maxRequests,
      RATE_LIMIT_UPLOAD.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const formData = await request.formData();
    const file = formData.get('receipt') as File;
    const orderId = sanitizeInput(formData.get('orderId') as string);
    const customerId = sanitizeInput(formData.get('customerId') as string);
    const amountStr = formData.get('amount') as string;
    const amount = amountStr ? parseFloat(amountStr) : NaN;

    // Validation
    const errors: string[] = [];
    
    if (!file) {
      errors.push('Receipt file is required');
    }
    
    if (!orderId || orderId.length < 3) {
      errors.push('Order ID is required and must be at least 3 characters');
    }
    
    if (!customerId || customerId.length < 3) {
      errors.push('Customer ID is required and must be at least 3 characters');
    }
    
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    if (errors.length > 0) {
      return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse(
        'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.',
        400,
        'INVALID_FILE_TYPE'
      );
    }

    // Validate file size (max 5MB)
    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      return createErrorResponse(
        'File size exceeds 5MB limit',
        400,
        'FILE_TOO_LARGE'
      );
    }

    // Save file (in production, use a storage service like AWS S3)
    const buffer = await file.arrayBuffer();
    const fileName = `receipt-${orderId}-${Date.now()}.${file.type.split('/')[1]}`;
    const receiptUrl = `/uploads/receipts/${fileName}`;

    // Create transaction record
    const transaction: PaymentTransaction = {
      id: generateTransactionId(),
      orderId,
      customerId,
      amount,
      currency: 'SAR',
      paymentMethod: 'bank-transfer',
      status: 'verification-pending',
      receiptProofUrl: receiptUrl,
      transactionId: generateTransactionId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Save to database
    // await db.transactions.create(transaction);

    return createSuccessResponse(
      { transactionId: transaction.id, receiptUrl },
      'Receipt uploaded successfully. Pending verification...',
      201
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/payments/bank-transfer/upload-receipt');
  }
}

/**
 * GET /api/payments/bank-transfer/details
 * الحصول على تفاصيل التحويل البنكي
 * Get bank transfer details
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_DEFAULT.maxRequests,
      RATE_LIMIT_DEFAULT.windowMs
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'details';

    // Validate type parameter
    const validTypes = ['details', 'status'];
    if (!validTypes.includes(type)) {
      return createErrorResponse('Invalid type parameter', 400, 'VALIDATION_ERROR');
    }

    if (type === 'details') {
      // TODO: Fetch from database
      const details: BankTransferDetails = {
        id: 'bank-1',
        bankName: 'البنك السعودي',
        accountNumber: '1234567890',
        accountHolder: 'CLIC7 LLC',
        iban: 'SA0012345678901234567890',
        swiftCode: 'SABOSASR',
        phoneNumber: '+966501234567',
        qrCodeImage: '/assets/qr-code.png',
        bankCardImage: '/assets/bank-card.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return createSuccessResponse(details, 'Bank transfer details retrieved successfully');
    }

    if (type === 'status') {
      const transactionId = searchParams.get('transactionId');
      
      if (!transactionId) {
        return createErrorResponse('Transaction ID is required', 400, 'VALIDATION_ERROR');
      }

      const sanitizedTransactionId = sanitizeInput(transactionId);
      
      // TODO: Fetch transaction status from database
      const status = {
        transactionId: sanitizedTransactionId,
        status: 'pending',
        message: 'Payment under review',
        updatedAt: new Date(),
      };

      return createSuccessResponse(status, 'Transaction status retrieved successfully');
    }

    return createErrorResponse('Invalid request', 400, 'BAD_REQUEST');
  } catch (error) {
    return handleApiError(error, 'GET /api/payments/bank-transfer');
  }
}
