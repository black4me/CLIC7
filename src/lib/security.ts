/**
 * أدوات الأمان والتشفير
 * Security and Encryption Utilities
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { securityConfig } from './config';

/**
 * تجزئة كلمة المرور
 * Hash Password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * التحقق من كلمة المرور
 * Verify Password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * التحقق من قوة كلمة المرور
 * Validate Password Strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < securityConfig.passwordMinLength) {
    errors.push(`يجب أن تكون كلمة المرور على الأقل ${securityConfig.passwordMinLength} أحرف`);
  }

  if (securityConfig.passwordRequireNumbers && !/\d/.test(password)) {
    errors.push('يجب أن تحتوي كلمة المرور على أرقام');
  }

  if (securityConfig.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي كلمة المرور على أحرف كبيرة');
  }

  if (securityConfig.passwordRequireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    errors.push('يجب أن تحتوي كلمة المرور على أحرف خاصة (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * توليد رمز التحقق من البريد الإلكتروني
 * Generate Email Verification Code
 */
export function generateVerificationCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

/**
 * توليد كود كوبون فريد
 * Generate Unique Coupon Code
 */
export function generateCouponCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * توليد رمز بطاقة الهدية
 * Generate Gift Card Code
 */
export function generateGiftCardCode(): string {
  const prefix = 'GC';
  const randomPart = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `${prefix}-${randomPart}`;
}

/**
 * توليد رمز معرف الطلب
 * Generate Order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * توليد رمز معرف المعاملة
 * Generate Transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

/**
 * الحصول على مفتاح التشفير مع التحقق
 * Get encryption key with validation
 */
function getEncryptionKey(): Buffer {
  const keyHex = securityConfig.encryptionKey;
  
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Invalid encryption key. Must be 64 hex characters (32 bytes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  
  try {
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
      throw new Error('Encryption key must be exactly 32 bytes when decoded');
    }
    return key;
  } catch (error) {
    throw new Error('Invalid encryption key format. Must be valid hex string.');
  }
}

/**
 * التشفير (بسيط للبيانات الحساسة)
 * Encrypt sensitive data
 */
export function encrypt(data: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * فك التشفير
 * Decrypt sensitive data
 */
export function decrypt(encrypted: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, encryptedData] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * التحقق من صحة البريد الإلكتروني
 * Validate Email Format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف
 * Validate Phone Number
 */
export function isValidPhoneNumber(phone: string): boolean {
  // قبول أرقام هاتفية دولية بصيغ مختلفة
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * التحقق من IBAN
 * Validate IBAN
 */
export function isValidIBAN(iban: string): boolean {
  // تحقق بسيط من IBAN
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
  return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase());
}

/**
 * حساب رقم التحقق من المبلغ
 * Calculate amount checksum for verification
 */
export function calculateAmountChecksum(amount: number, currency: string): string {
  const data = `${amount}-${currency}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

/**
 * التحقق من توقيع Webhook
 * Verify Webhook Signature
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

/**
 * الحصول على مفتاح JWT مع التحقق
 * Get JWT secret with validation
 */
function getJWTSecret(): string {
  const secret = securityConfig.jwtSecret;
  
  if (!secret || secret.length < 32) {
    throw new Error('Invalid JWT secret. Must be at least 32 characters long. Set JWT_SECRET in environment variables.');
  }
  
  return secret;
}

/**
 * توليد JWT Token
 * Generate JWT Token
 */
export function generateJWT(data: Record<string, any>, expiresIn: string = '24h'): string {
  try {
    const secret = getJWTSecret();
    
    // Parse expiresIn
    const expiresInMatch = expiresIn.match(/^(\d+)([hdm])$/);
    let expiresInSeconds = 86400; // default 24 hours
    
    if (expiresInMatch) {
      const value = parseInt(expiresInMatch[1]);
      const unit = expiresInMatch[2];
      
      switch (unit) {
        case 'h':
          expiresInSeconds = value * 3600;
          break;
        case 'd':
          expiresInSeconds = value * 86400;
          break;
        case 'm':
          expiresInSeconds = value * 60;
          break;
      }
    }
    
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({
      ...data,
      iat: now,
      exp: now + expiresInSeconds,
    })).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    return `${header}.${payload}.${signature}`;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate JWT token');
  }
}

/**
 * التحقق من JWT Token
 * Verify JWT Token
 */
export function verifyJWT(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const secret = getJWTSecret();
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    const [header, payload, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Decode payload
    const payloadData = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Check expiration
    if (payloadData.exp && payloadData.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, payload: payloadData };
  } catch (error) {
    return { valid: false, error: 'Failed to verify token' };
  }
}

/**
 * التحقق من عمر البيانات (للتحقق من انتهاء الصلاحية)
 * Check data expiry
 */
export function isExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * توليد رمز OTP عشوائي
 * Generate Random OTP Code
 */
export function generateOTP(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * تنظيف البيانات من الأحرف الخطيرة
 * Sanitize input data
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
      };
      return map[char] || char;
    });
}

/**
 * التحقق من صيغة UUID
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * حساب hash للملف للتحقق من السلامة
 * Calculate file hash for integrity check
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * توليد مفتاح تشفير عشوائي
 * Generate random encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * توليد مفتاح JWT عشوائي
 * Generate random JWT secret
 */
export function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}
