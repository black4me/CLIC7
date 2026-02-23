import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentGatewayConfig, appConfig } from '@/lib/config';
import { generateTransactionId } from '@/lib/security';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequestBody,
  applyRateLimit,
} from '@/lib/api-utils';
import Stripe from 'stripe';

// Stripe is initialized lazily inside processStripePayment to prevent build errors when keys are missing
let stripeInstance: Stripe | null = null;

function getStripeInstance() {
  if (!stripeInstance && paymentGatewayConfig.stripe.secretKey) {
    stripeInstance = new Stripe(paymentGatewayConfig.stripe.secretKey, {
      apiVersion: '2023-10-16' as any,
    });
  }
  return stripeInstance;
}

const RATE_LIMIT_PUBLIC = { maxRequests: 60, windowMs: 60 * 1000 };
const VALID_GATEWAYS = ['stripe', 'paypal', 'thawani', 'bank_transfer'] as const;

/**
 * GET /api/payments/gateway/available
 * Get available payment gateways
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_PUBLIC.maxRequests,
      RATE_LIMIT_PUBLIC.windowMs
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const amount = searchParams.get('amount');
    const amountNum = amount ? parseFloat(amount) : undefined;

    const gateways = [];

    // Stripe
    if (paymentGatewayConfig.stripe?.isEnabled) {
      const config = paymentGatewayConfig.stripe;
      if (!country || !config.supportedCountries || config.supportedCountries.includes(country)) {
        if (!amountNum ||
          (!config.minimumAmount || amountNum >= config.minimumAmount) &&
          (!config.maximumAmount || amountNum <= config.maximumAmount)) {
          gateways.push({
            id: 'stripe',
            name: 'stripe',
            displayName: config.displayName || 'Stripe',
            icon: config.icon || '/assets/stripe-icon.svg',
          });
        }
      }
    }

    // PayPal
    if (paymentGatewayConfig.paypal?.isEnabled) {
      const config = paymentGatewayConfig.paypal;
      if (!country || !config.supportedCountries || config.supportedCountries.includes(country)) {
        if (!amountNum ||
          (!config.minimumAmount || amountNum >= config.minimumAmount) &&
          (!config.maximumAmount || amountNum <= config.maximumAmount)) {
          gateways.push({
            id: 'paypal',
            name: 'paypal',
            displayName: config.displayName || 'PayPal',
            icon: config.icon || '/assets/paypal-icon.svg',
          });
        }
      }
    }

    // Bank Transfer
    if (paymentGatewayConfig.bankTransfer?.isEnabled) {
      const config = paymentGatewayConfig.bankTransfer;
      if (!country || !config.supportedCountries || config.supportedCountries.includes(country)) {
        if (!amountNum ||
          (!config.minimumAmount || amountNum >= config.minimumAmount) &&
          (!config.maximumAmount || amountNum <= config.maximumAmount)) {
          gateways.push({
            id: 'bank_transfer',
            name: 'bank_transfer',
            displayName: config.displayName || 'Bank Transfer',
            icon: config.icon || '/assets/bank-icon.svg',
          });
        }
      }
    }

    return createSuccessResponse(
      { gateways, count: gateways.length },
      'Available payment gateways retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/payments/gateway/available');
  }
}

/**
 * POST /api/payments/gateway/process
 * Process payment through specific gateway
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(request, 20, 60 * 1000);
    if (!rateLimitResult.allowed) return rateLimitResult.response!;

    const validation = await validateRequestBody<{
      gatewayId: string;
      amount: number;
      currency: string;
      orderId: string;
      customerId: string;
      customerEmail?: string;
      metadata?: Record<string, any>;
    }>(request, {
      required: ['gatewayId', 'amount', 'currency', 'orderId', 'customerId'],
      types: {
        gatewayId: 'string',
        amount: 'number',
        currency: 'string',
        orderId: 'string',
        customerId: 'string',
        customerEmail: 'string',
        metadata: 'object',
      },
      validators: {
        gatewayId: (value: string) => ({
          valid: VALID_GATEWAYS.includes(value as any),
          error: `Gateway must be one of: ${VALID_GATEWAYS.join(', ')}`,
        }),
        amount: (value: number) => ({
          valid: value > 0,
          error: 'Amount must be greater than 0',
        }),
      },
    });

    if (!validation.valid) {
      return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors: validation.errors });
    }

    const data = validation.data!;
    const currency = data.currency.toUpperCase();

    // 1. Create initial transaction record in Prisma
    const transaction = await prisma.transaction.create({
      data: {
        orderId: data.orderId,
        customerId: data.customerId,
        customerEmail: data.customerEmail,
        amount: data.amount,
        currency,
        paymentMethod: data.gatewayId as any,
        status: 'pending',
        metadata: data.metadata || {},
      },
    });

    // 2. Process based on gateway
    switch (data.gatewayId) {
      case 'stripe':
        return await processStripePayment(data, transaction);

      case 'paypal':
        return await processPayPalPayment(data, transaction);

      case 'thawani':
        return await processThawaniPayment(data, transaction);

      case 'bank_transfer':
        return await processBankTransferPayment(data, transaction);

      default:
        return createErrorResponse('Unsupported payment gateway', 400, 'UNSUPPORTED_GATEWAY');
    }
  } catch (error) {
    return handleApiError(error, 'POST /api/payments/gateway/process');
  }
}

/**
 * Process Stripe Payment (Live Integration)
 */
async function processStripePayment(data: any, dbTransaction: any): Promise<NextResponse> {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe failed to initialize. Check your STRIPE_SECRET_KEY.');
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Stripe uses cents
      currency: data.currency.toLowerCase(),
      metadata: {
        orderId: data.orderId,
        customerId: data.customerId,
        dbTransactionId: dbTransaction.id,
      },
      automatic_payment_methods: { enabled: true },
    });

    // Update our transaction with the Stripe ID
    await prisma.transaction.update({
      where: { id: dbTransaction.id },
      data: { transactionId: paymentIntent.id },
    });

    return createSuccessResponse({
      transactionId: dbTransaction.id,
      stripePaymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      publicKey: paymentGatewayConfig.stripe.publicKey,
    }, 'Stripe PaymentIntent created');
  } catch (error: any) {
    console.error('[Stripe Process Error]', error);
    return createErrorResponse(error.message || 'Stripe initialization failed', 500, 'PAYMENT_ERROR');
  }
}

/**
 * Process PayPal Payment (Live Integration Skeleton)
 */
async function processPayPalPayment(data: any, dbTransaction: any): Promise<NextResponse> {
  try {
    const { clientId, secretKey, sandbox } = paymentGatewayConfig.paypal;
    if (!clientId || !secretKey) throw new Error('PayPal configuration missing');

    const auth = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const baseUrl = sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    // Get Access Token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) throw new Error('PayPal Authentication Failed');

    // Create Order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: dbTransaction.id,
          amount: {
            currency_code: data.currency.toUpperCase(),
            value: data.amount.toString(),
          },
          description: `Order ${data.orderId}`,
        }],
        application_context: {
          return_url: `${appConfig.siteUrl}/checkout/success`,
          cancel_url: `${appConfig.siteUrl}/checkout/cancel`,
        }
      }),
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) throw new Error(orderData.message || 'PayPal Order Creation Failed');

    // Update our transaction with the PayPal Order ID
    await prisma.transaction.update({
      where: { id: dbTransaction.id },
      data: { transactionId: orderData.id },
    });

    return createSuccessResponse({
      transactionId: dbTransaction.id,
      paypalOrderId: orderData.id,
      links: orderData.links,
      approvalUrl: orderData.links.find((l: any) => l.rel === 'approve')?.href,
    }, 'PayPal Order created');
  } catch (error: any) {
    console.error('[PayPal Process Error]', error);
    return createErrorResponse(error.message || 'PayPal initialization failed', 500, 'PAYMENT_ERROR');
  }
}

/**
 * Process Bank Transfer
 */
async function processBankTransferPayment(data: any, dbTransaction: any): Promise<NextResponse> {
  try {
    await prisma.transaction.update({
      where: { id: dbTransaction.id },
      data: { status: 'verification_pending' },
    });

    return createSuccessResponse({
      transactionId: dbTransaction.id,
      status: 'verification_pending',
      message: 'Bank transfer record created. Please upload proof of payment.',
    }, 'Bank transfer initiated');
  } catch (error: any) {
    return handleApiError(error, 'Bank Transfer Process');
  }
}

/**
 * Process Thawani Payment (Live Integration)
 */
async function processThawaniPayment(data: any, dbTransaction: any): Promise<NextResponse> {
  try {
    const { secretKey, publishableKey, sandbox } = paymentGatewayConfig.thawani;
    if (!secretKey || !publishableKey) throw new Error('Thawani configuration missing');

    const baseUrl = sandbox ? 'https://uatapi.thawani.om' : 'https://checkout.thawani.om';
    const apiBaseUrl = sandbox ? 'https://uatapi.thawani.om/api/v1' : 'https://api.thawani.om/api/v1';

    // Create Checkout Session
    const response = await fetch(`${apiBaseUrl}/checkout/session`, {
      method: 'POST',
      headers: {
        'thawani-api-key': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_reference_id: dbTransaction.id,
        mode: 'payment',
        products: [{
          name: `Order ${data.orderId}`,
          unit_amount: Math.round(data.amount * 1000), // Thawani uses OMR (1000 Bz = 1 OMR)
          quantity: 1,
        }],
        success_url: `${appConfig.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appConfig.siteUrl}/checkout/cancel`,
        metadata: {
          orderId: data.orderId,
          customerId: data.customerId,
        },
      }),
    });

    const sessionData = await response.json();
    if (!response.ok || !sessionData.success) {
      throw new Error(sessionData.description || 'Thawani Session Creation Failed');
    }

    // Update transaction with Thawani Session ID
    await prisma.transaction.update({
      where: { id: dbTransaction.id },
      data: { transactionId: sessionData.data.session_id },
    });

    return createSuccessResponse({
      transactionId: dbTransaction.id,
      thawaniSessionId: sessionData.data.session_id,
      checkoutUrl: `${baseUrl}/pay/${sessionData.data.session_id}?key=${publishableKey}`,
    }, 'Thawani Session created');
  } catch (error: any) {
    console.error('[Thawani Process Error]', error);
    return createErrorResponse(error.message || 'Thawani initialization failed', 500, 'PAYMENT_ERROR');
  }
}
