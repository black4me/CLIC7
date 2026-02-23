/**
 * نظام البريد الإلكتروني
 * Email Service Module
 */

import { emailConfig, appConfig } from './config';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * قوالب البريد الإلكتروني
 * Email Templates
 */
export const emailTemplates = {
  /**
   * تأكيد الطلب قيد المراجعة
   */
  orderPending: (customerName: string, orderId: string): EmailTemplate => ({
    subject: `تأكيد طلبك - ${orderId}`,
    htmlContent: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a1a1a;">مرحباً ${customerName}</h1>
        <p>شكراً لك على طلبك!</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>رقم الطلب:</strong> ${orderId}</p>
          <p><strong>الحالة:</strong> قيد المراجعة</p>
          <p>نحن بصدد مراجعة طلبك وسوف نتواصل معك قريباً بتفاصيل إضافية.</p>
        </div>
        
        <p>إذا كان لديك أي استفسارات، يرجى التواصل معنا على <strong>${appConfig.supportEmail}</strong></p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          هذا البريد من ${appConfig.siteName} - لا تقم بالرد على هذا البريد
        </p>
      </div>
    `,
  }),

  /**
   * تم التحقق من الدفع
   */
  paymentVerified: (customerName: string, orderId: string, gameCode: string): EmailTemplate => ({
    subject: `تم التحقق من دفعك ✓`,
    htmlContent: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a1a1a;">مرحباً ${customerName}</h1>
        <p>🎉 تم التحقق من دفعك بنجاح!</p>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>رقم الطلب:</strong> ${orderId}</p>
          <p><strong>حالة الدفع:</strong> مكتمل ✓</p>
        </div>
        
        <div style="background-color: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>كود اللعبة الخاص بك:</strong></p>
          <p style="font-size: 18px; font-weight: bold; color: #ff6b6b; letter-spacing: 2px;">
            ${gameCode}
          </p>
          <p style="font-size: 12px; color: #999;">
            احفظ هذا الكود في مكان آمن
          </p>
        </div>
        
        <p>شكراً لك على اختيارك ${appConfig.siteName}!</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          هذا البريد من ${appConfig.siteName} - لا تقم بالرد على هذا البريد
        </p>
      </div>
    `,
  }),

  /**
   * تم رفض الدفع
   */
  paymentRejected: (customerName: string, orderId: string, reason: string): EmailTemplate => ({
    subject: `تحديث بخصوص طلبك - ${orderId}`,
    htmlContent: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a1a1a;">مرحباً ${customerName}</h1>
        <p>نود إبلاغك بأنه لم يتم التحقق من الدفع لطلبك.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>رقم الطلب:</strong> ${orderId}</p>
          <p><strong>السبب:</strong> ${reason}</p>
        </div>
        
        <p>يرجى التواصل معنا لمعالجة هذا الأمر:</p>
        <p><strong>البريد الإلكتروني:</strong> ${appConfig.supportEmail}</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          هذا البريد من ${appConfig.siteName} - لا تقم بالرد على هذا البريد
        </p>
      </div>
    `,
  }),

  /**
   * رسالة الهدية
   */
  giftCardSent: (recipientName: string, senderName: string, message: string, giftCardCode: string): EmailTemplate => ({
    subject: `🎁 تم إرسال هدية لك!`,
    htmlContent: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a1a1a;">مرحباً ${recipientName}</h1>
        <p>🎉 لقد أرسل لك ${senderName} هدية من ${appConfig.siteName}!</p>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-style: italic;">"${message}"</p>
        </div>
        
        <div style="background-color: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>كود بطاقة الهدية:</strong></p>
          <p style="font-size: 18px; font-weight: bold; color: #ff6b6b; letter-spacing: 2px;">
            ${giftCardCode}
          </p>
          <p style="font-size: 12px; color: #999;">
            استخدم هذا الكود للاستفادة من رصيد الهدية
          </p>
        </div>
        
        <p>شكراً لك على استخدام ${appConfig.siteName}!</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          هذا البريد من ${appConfig.siteName} - لا تقم بالرد على هذا البريد
        </p>
      </div>
    `,
  }),

  /**
   * تذكير التحقق من البريد الإلكتروني للموظف
   */
  staffVerificationEmail: (staffName: string, code: string): EmailTemplate => ({
    subject: `كود التحقق من الدخول`,
    htmlContent: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a1a1a;">مرحباً ${staffName}</h1>
        <p>طلب جديد للدخول لنظام الإدارة</p>
        
        <div style="background-color: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>كود التحقق:</strong></p>
          <p style="font-size: 24px; font-weight: bold; color: #ff6b6b; letter-spacing: 5px;">
            ${code}
          </p>
          <p style="font-size: 12px; color: #999;">
            هذا الكود صالح لمدة 15 دقيقة فقط
          </p>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          لم تطلب هذا؟ لا تشارك هذا الكود مع أحد
        </p>
      </div>
    `,
  }),

  /**
   * تنبيه لموظف التحقق: طلب جديد ينتظر التحقق
   */
  staffPaymentPendingVerification: (staffName: string, orderId: string, amount: number, currency: string): EmailTemplate => ({
    subject: `⚠️ طلب جديد ينتظر التحقق`,
    htmlContent: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a1a1a;">مرحباً ${staffName}</h1>
        <p>يوجد طلب جديد ينتظر التحقق من الدفع.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>رقم الطلب:</strong> ${orderId}</p>
          <p><strong>المبلغ:</strong> ${amount} ${currency}</p>
          <p><strong>النوع:</strong> تحويل بنكي يدوي</p>
        </div>
        
        <p>يرجى الدخول للوحة التحكم والتحقق من إيصال الدفع.</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          هذا البريد من ${appConfig.siteName} - لا تقم بالرد على هذا البريد
        </p>
      </div>
    `,
  }),
};

/**
 * إرسال بريد إلكتروني
 * Send Email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    if (emailConfig.provider === 'sendgrid') {
      return await sendViaSendGrid(options);
    } else if (emailConfig.provider === 'nodemailer') {
      return await sendViaNodemailer(options);
    }
    
    console.error('Email provider not configured');
    return false;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * إرسال عبر SendGrid
 */
async function sendViaSendGrid(options: SendEmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }],
          cc: options.cc?.map(email => ({ email })),
          bcc: options.bcc?.map(email => ({ email })),
        }],
        from: {
          email: emailConfig.fromEmail,
          name: emailConfig.fromName,
        },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
          ...(options.text ? [{
            type: 'text/plain',
            value: options.text,
          }] : []),
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}

/**
 * إرسال عبر Nodemailer
 */
async function sendViaNodemailer(options: SendEmailOptions): Promise<boolean> {
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport(emailConfig.smtp);
    
    await transporter.sendMail({
      from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      to: options.to,
      cc: options.cc?.join(','),
      bcc: options.bcc?.join(','),
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  } catch (error) {
    console.error('Nodemailer error:', error);
    return false;
  }
}

/**
 * إرسال بريد ترحيبي للموظف الجديد
 */
export async function sendStaffWelcomeEmail(
  staffEmail: string,
  staffName: string,
  tempPassword: string
): Promise<boolean> {
  const template = {
    subject: 'مرحباً بك في نظام الإدارة',
    htmlContent: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a1a1a;">مرحباً ${staffName}</h1>
        <p>تم إنشاء حسابك في نظام إدارة ${appConfig.siteName}</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>بيانات الدخول:</strong></p>
          <p><strong>البريد الإلكتروني:</strong> ${staffEmail}</p>
          <p><strong>كلمة المرور المؤقتة:</strong> ${tempPassword}</p>
          <p style="font-size: 12px; color: #999;">يرجى تغيير كلمة المرور عند الدخول الأول</p>
        </div>
        
        <p>يرجى عدم مشاركة بيانات الدخول مع أحد.</p>
      </div>
    `,
  };

  return sendEmail({
    to: staffEmail,
    subject: template.subject,
    html: template.htmlContent,
  });
}
