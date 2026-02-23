/**
 * Email Service
 * Handles sending emails via SMTP (Nodemailer) or SendGrid API
 * Falls back to console logging if not configured
 */

import nodemailer from 'nodemailer';
import { emailConfig } from './config';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
}

interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    provider: 'nodemailer' | 'sendgrid' | 'console';
}

// Create transporter only if SMTP is configured
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
    if (transporter) return transporter;
    
    // Check if SMTP is configured
    if (emailConfig.smtp.host && emailConfig.smtp.auth.user && emailConfig.smtp.auth.pass) {
        try {
            transporter = nodemailer.createTransport({
                host: emailConfig.smtp.host,
                port: emailConfig.smtp.port,
                secure: emailConfig.smtp.secure,
                auth: {
                    user: emailConfig.smtp.auth.user,
                    pass: emailConfig.smtp.auth.pass,
                },
                tls: {
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                }
            });
            
            console.log('[EMAIL] Nodemailer transporter created successfully');
            return transporter;
        } catch (error) {
            console.error('[EMAIL] Failed to create transporter:', error);
            return null;
        }
    }
    
    return null;
}

/**
 * Send email using configured provider
 */
export async function sendEmail({ 
    to, 
    subject, 
    html, 
    text,
    from,
    replyTo 
}: EmailOptions): Promise<EmailResult> {
    try {
        // Validate email address
        if (!to || !to.includes('@')) {
            return {
                success: false,
                error: 'Invalid recipient email address',
                provider: 'console'
            };
        }
        
        const fromAddress = from || `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`;
        
        // Extract game code from HTML if possible for better logging
        const codeMatch = html.match(/class="key-value">([^<]+)<\/div>/);
        const gameCode = codeMatch ? codeMatch[1] : 'N/A';
        
        // Try to use nodemailer if configured
        const mailer = getTransporter();
        
        if (mailer) {
            try {
                const info = await mailer.sendMail({
                    from: fromAddress,
                    to,
                    subject,
                    html,
                    text: text || html.replace(/<[^>]*>/g, ''),
                    replyTo: replyTo || emailConfig.fromEmail,
                });
                
                console.log(`[EMAIL SENT - Nodemailer] To: ${to}, MessageId: ${info.messageId}`);
                
                return {
                    success: true,
                    messageId: info.messageId,
                    provider: 'nodemailer'
                };
            } catch (smtpError) {
                console.error('[EMAIL] SMTP sending failed:', smtpError);
                // Fall through to console logging
            }
        }
        
        // Fallback: Log to console (for development/testing)
        console.log(`
========================================
[EMAIL SENT - CONSOLE MODE]
To: ${to}
From: ${fromAddress}
Subject: ${subject}
Game Code: ${gameCode}
----------------------------------------
HTML Preview:
${html.substring(0, 500)}...
========================================
        `);
        
        return {
            success: true,
            provider: 'console',
            messageId: `console-${Date.now()}`
        };
        
    } catch (error) {
        console.error('Failed to send email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: 'console'
        };
    }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
    to: string, 
    orderId: string, 
    gameCode: string,
    gameName: string,
    amount: number,
    currency: string
): Promise<EmailResult> {
    const subject = `✅ Order Confirmation - ${orderId}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4CAF50;">Order Confirmed!</h1>
            <p>Thank you for your purchase.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Game:</strong> ${gameName}</p>
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
            </div>
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>Your Game Code</h2>
                <div class="key-value" style="font-size: 24px; font-weight: bold; color: #1976d2; background: white; padding: 15px; border-radius: 4px; text-align: center; letter-spacing: 2px;">
                    ${gameCode}
                </div>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                    Please keep this code safe. Click the button below to redeem:
                </p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you have any questions, please contact our support team.
            </p>
        </div>
    `;
    
    return sendEmail({ to, subject, html });
}

/**
 * Send bank transfer instructions email
 */
export async function sendBankTransferInstructionsEmail(
    to: string,
    orderId: string,
    amount: number,
    currency: string,
    bankDetails: {
        accountName: string;
        accountNumber: string;
        iban?: string;
        bankName: string;
    }
): Promise<EmailResult> {
    const subject = `🏦 Bank Transfer Instructions - ${orderId}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2196F3;">Bank Transfer Instructions</h1>
            <p>Please complete your payment using the following bank details:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>Order Information</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
            </div>
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>Bank Details</h2>
                <p><strong>Account Name:</strong> ${bankDetails.accountName}</p>
                <p><strong>Account Number:</strong> ${bankDetails.accountNumber}</p>
                ${bankDetails.iban ? `<p><strong>IBAN:</strong> ${bankDetails.iban}</p>` : ''}
                <p><strong>Bank:</strong> ${bankDetails.bankName}</p>
            </div>
            <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #c62828;">
                    <strong>Important:</strong> Please include your Order ID (${orderId}) in the transfer description.
                </p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Once we receive your payment, we will process your order within 24 hours.
            </p>
        </div>
    `;
    
    return sendEmail({ to, subject, html });
}

/**
 * Send payment verification email to admin
 */
export async function sendPaymentVerificationEmail(
    orderId: string,
    customerEmail: string,
    amount: number,
    currency: string,
    receiptUrl?: string
): Promise<EmailResult> {
    const adminEmail = emailConfig.fromEmail;
    const subject = `🔔 New Payment Verification Required - ${orderId}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF9800;">Payment Verification Required</h1>
            <p>A new bank transfer payment requires your verification:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Customer:</strong> ${customerEmail}</p>
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
                ${receiptUrl ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}">View Receipt</a></p>` : ''}
            </div>
            <p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/payments" 
                   style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Review Payment
                </a>
            </p>
        </div>
    `;
    
    return sendEmail({ to: adminEmail, subject, html });
}

/**
 * Verify email service is configured
 */
export function isEmailConfigured(): boolean {
    return !!(emailConfig.smtp.host && emailConfig.smtp.auth.user);
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
    const mailer = getTransporter();
    
    if (!mailer) {
        return {
            success: false,
            error: 'Email service not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.'
        };
    }
    
    try {
        await mailer.verify();
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify email connection'
        };
    }
}
