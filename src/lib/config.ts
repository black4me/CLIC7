/**
 * نظام إدارة المفاتيح والبيانات الحساسة
 * Secure Configuration Management
 */

// تكوينات بوابات الدفع
export const paymentGatewayConfig = {
  stripe: {
    name: 'Stripe',
    displayName: 'بطاقات ائتمان / Stripe',
    icon: '/assets/icons/stripe.svg',
    isEnabled: process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true',
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    supportedCountries: ['US', 'GB', 'CA', 'AU', 'SA', 'AE', 'OM', 'QA', 'KW', 'BH'],
    minimumAmount: 10,
    maximumAmount: 50000,
  },
  paypal: {
    name: 'PayPal',
    displayName: 'PayPal',
    icon: '/assets/icons/paypal.svg',
    isEnabled: process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true',
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    secretKey: process.env.PAYPAL_SECRET_KEY || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    sandbox: process.env.NODE_ENV === 'development',
    supportedCountries: ['US', 'GB', 'CA', 'AU', 'SA', 'AE', 'OM'],
    minimumAmount: 10,
    maximumAmount: 50000,
  },
  thawani: {
    name: 'Thawani',
    displayName: 'ثواني - بوابة عمانية',
    icon: '/assets/icons/thawani.svg',
    isEnabled: process.env.NEXT_PUBLIC_THAWANI_ENABLED === 'true',
    publishableKey: process.env.NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY || '',
    secretKey: process.env.THAWANI_SECRET_KEY || '',
    sandbox: process.env.NODE_ENV === 'development',
    supportedCountries: ['OM'], // عمان
    minimumAmount: 1,
    maximumAmount: 10000,
  },
  bankTransfer: {
    name: 'Bank Transfer',
    displayName: 'تحويل بنكي يدوي',
    icon: '/assets/icons/bank.svg',
    isEnabled: process.env.NEXT_PUBLIC_BANK_TRANSFER_ENABLED === 'true',
    supportedCountries: ['SA', 'AE', 'OM', 'QA', 'KW', 'BH'],
    minimumAmount: 50,
    maximumAmount: 100000,
    requiresVerification: true, // يتطلب التحقق اليدوي
  },
};

// تكوين البريد الإلكتروني
export const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'sendgrid', // 'sendgrid' أو 'nodemailer'
  fromEmail: process.env.EMAIL_FROM || 'noreply@clic7.com',
  fromName: process.env.EMAIL_FROM_NAME || 'CLIC7',

  // SendGrid
  sendGridApiKey: process.env.SENDGRID_API_KEY || '',

  // Nodemailer (SMTP)
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  // Mailchimp
  mailchimpApiKey: process.env.MAILCHIMP_API_KEY || '',
  mailchimpListId: process.env.MAILCHIMP_LIST_ID || '',
  mailchimpDataCenter: process.env.MAILCHIMP_DATA_CENTER || 'us1',
};

// تكوين الأمان
export const securityConfig = {
  passwordMinLength: 12,
  passwordRequireSpecialChars: true,
  passwordRequireNumbers: true,
  passwordRequireUppercase: true,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 ساعة
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 دقيقة
  twoFactorRequired: true,
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

// تكوين قاعدة البيانات
export const dbConfig = {
  url: process.env.DATABASE_URL || '',
  provider: process.env.DB_PROVIDER || 'mongodb', // 'mongodb', 'postgresql', 'mysql'
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '27017'),
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clic7',
};

// تكوين التطبيق العام
export const appConfig = {
  siteName: 'CLIC7',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clic7.com',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@clic7.com',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@clic7.com',
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // عملات مدعومة
  supportedCurrencies: ['SAR', 'AED', 'OMR', 'QAR', 'KWD', 'BHD', 'USD', 'EUR'],
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'SAR',

  // دول مدعومة
  supportedCountries: ['SA', 'AE', 'OM', 'QA', 'KW', 'BH', 'US', 'GB', 'CA', 'AU'],
};

// تكوين السياسات
export const policiesConfig = {
  refundPeriodDays: 30,
  maxCouponDiscountPercentage: 100,
  maxCouponDiscountAmount: 10000,
  enableGuestCheckout: false,
  enableReturns: true,
  returnPeriodDays: 14,
  minOrderAmount: 10,
  requireBankTransferVerification: true,
  verificationTimeoutHours: 24,
};
