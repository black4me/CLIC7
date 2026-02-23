/**
 * نماذج قاعدة البيانات للمنصة
 * Database Models for CLIC7 Platform
 */

// ============================================
// نماذج نظام الدفع (Payment System Models)
// ============================================

export interface PaymentGateway {
  id: string;
  name: string; // 'stripe', 'paypal', 'thawani', 'bank-transfer'
  isEnabled: boolean;
  displayName: string; // اسم العرض (Stripe, PayPal, ثواني، etc)
  icon: string; // رابط الأيقونة
  config: Record<string, string>; // بيانات التكوين (API Keys, etc)
  minimumAmount?: number; // الحد الأدنى للمبلغ
  maximumAmount?: number; // الحد الأقصى للمبلغ
  supportedCountries?: string[]; // الدول المدعومة
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransferDetails {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  iban?: string;
  swiftCode?: string;
  phoneNumber?: string; // لتحويلات سريعة
  qrCodeImage?: string; // صورة QR Code
  bankCardImage?: string; // صورة البطاقة البنكية
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string; // 'SAR', 'AED', 'USD', etc
  paymentMethod: 'stripe' | 'paypal' | 'thawani' | 'bank-transfer' | 'gift-card' | 'coupon';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'verification-pending' | 'verification-rejected';
  transactionId?: string; // معرف المعاملة من البوابة
  receiptProofUrl?: string; // رابط صورة الإيصال (للتحويل اليدوي)
  verificationNotes?: string; // ملاحظات التحقق من قبل الموظف
  verifiedBy?: string; // معرف الموظف الذي تحقق من الدفع
  verifiedAt?: Date; // تاريخ التحقق
  errorMessage?: string;
  metadata?: Record<string, any>; // بيانات إضافية
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// نماذج الكوبونات والخصومات (Coupons & Discounts)
// ============================================

export interface Coupon {
  id: string;
  code: string; // مثال: SUMMER2024
  description?: string;
  discountType: 'percentage' | 'fixed-amount'; // نسبة مئوية أو مبلغ ثابت
  discountValue: number; // القيمة (مثال: 20 للـ 20%)
  maxUsages: number; // عدد مرات الاستخدام الأقصى
  currentUsages: number; // عدد مرات الاستخدام الحالية
  usedBy: string[]; // قائمة معرفات العملاء الذين استخدموا الكوبون
  minOrderAmount?: number; // الحد الأدنى لقيمة الطلب
  maxDiscountAmount?: number; // الحد الأقصى للخصم
  validFrom: Date; // تاريخ البداية
  validUntil: Date; // تاريخ الانتهاء
  applicableCategories?: string[]; // الفئات المعنية (اختياري)
  applicableProducts?: string[]; // المنتجات المعنية (اختياري)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  customerId: string;
  orderId: string;
  discountApplied: number;
  usedAt: Date;
}

// ============================================
// نماذج بطاقات الهدايا (Gift Cards)
// ============================================

export interface GiftCard {
  id: string;
  code: string; // كود فريد للبطاقة
  balance: number; // الرصيد المتبقي
  initialBalance: number; // الرصيد الأولي
  purchasedBy?: string; // معرف المشتري
  sentTo?: string; // البريد الإلكتروني للمستقبل
  recipientName?: string; // اسم المستقبل
  message?: string; // رسالة الهدية
  isRedeemed: boolean;
  redeemedBy?: string; // معرف من استخدم البطاقة
  redeemedAt?: Date; // تاريخ الاستخدام
  expiresAt?: Date; // تاريخ الانتهاء
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  orderId: string;
  amountUsed: number;
  transactionDate: Date;
}

// ============================================
// نماذج إدارة الموظفين (Staff Management)
// ============================================

export interface Staff {
  id: string;
  email: string;
  fullName: string;
  password: string; // يجب أن يكون مشفراً (bcrypt)
  role: 'admin' | 'payment-verifier' | 'support-agent' | 'content-manager' | 'analytics-viewer';
  permissions: StaffPermission[];
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string; // Secret for 2FA
  lastLogin?: Date;
  loginAttempts: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffPermission {
  id: string;
  staffId: string;
  permission: 'verify_payments' | 'view_orders' | 'manage_staff' | 'view_analytics' | 'manage_coupons' | 'manage_settings' | 'view_game_codes';
  canPerform: boolean;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  action: string; // 'verified_payment', 'rejected_payment', 'approved_order', etc
  relatedEntityId?: string; // معرف الكيان ذي الصلة (Order ID, Transaction ID, etc)
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface TwoFactorAuth {
  id: string;
  staffId: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// ============================================
// نماذج الطلبات (Order Models)
// ============================================

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number; // الخصم المطبق
  appliedCouponId?: string;
  appliedGiftCardId?: string;
  paymentMethod: 'stripe' | 'paypal' | 'thawani' | 'bank-transfer' | 'gift-card' | 'mixed';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'verification-pending' | 'verification-rejected';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled' | 'refunded';
  paymentTransactionId?: string;
  notes?: string;
  shippingAddress?: {
    country: string;
    city: string;
    address: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gameCode?: string; // كود اللعبة (يتم ملؤه بعد التحقق من الدفع)
}

// ============================================
// نماذج الإشعارات والبريد (Notifications & Email)
// ============================================

export interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  templateName: string; // 'order_pending', 'payment_verified', 'order_cancelled', etc
  parameters: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  customerId: string;
  type: 'order_status_update' | 'payment_status' | 'promotional' | 'system_notification';
  title: string;
  message: string;
  relatedOrderId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// ============================================
// نماذج التحليلات (Analytics Models)
// ============================================

export interface OrderAnalytics {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  completedPayments: number;
  failedPayments: number;
  avgOrderValue: number;
  paymentMethods: {
    [key: string]: {
      count: number;
      revenue: number;
    };
  };
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  viewCount: number;
  conversionRate: number;
  topCountries: string[];
}
