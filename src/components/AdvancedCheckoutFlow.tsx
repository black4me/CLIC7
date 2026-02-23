'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, Gift, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PaymentGateway } from '@/lib/db-models';

interface PaymentMethodOption {
  id: string;
  name: string;
  displayName: string;
  icon: React.ReactNode;
  description: string;
  isAvailable: boolean;
  fees?: number;
}

interface AdvancedCheckoutFlowProps {
  orderId: string;
  totalAmount: number;
  currency: string;
  customerEmail: string;
  customerCountry: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function AdvancedCheckoutFlow({
  orderId,
  totalAmount,
  currency,
  customerEmail,
  customerCountry,
  onPaymentSuccess,
  onPaymentError,
}: AdvancedCheckoutFlowProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بوابات الدفع المتاحة
    fetchAvailablePaymentMethods();
  }, [customerCountry]);

  const fetchAvailablePaymentMethods = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`/api/payments/gateways?country=${customerCountry}`);
      // const gateways = await response.json();

      // تعريف الطرق المتاحة (placeholder)
      const methods: PaymentMethodOption[] = [
        {
          id: 'stripe',
          name: 'stripe',
          displayName: 'بطاقة ائتمان / Stripe',
          icon: <CreditCard className="w-8 h-8" />,
          description: 'الدفع الفوري ببطاقة ائتمان آمنة',
          isAvailable: true,
          fees: 0,
        },
        {
          id: 'paypal',
          name: 'paypal',
          displayName: 'PayPal',
          icon: <CreditCard className="w-8 h-8" />,
          description: 'الدفع الآمن عبر PayPal',
          isAvailable: ['US', 'GB', 'AU'].includes(customerCountry),
          fees: 2.9,
        },
        {
          id: 'thawani',
          name: 'thawani',
          displayName: 'ثواني - بوابة عمانية',
          icon: <CreditCard className="w-8 h-8" />,
          description: 'بوابة دفع محلية عمانية',
          isAvailable: customerCountry === 'OM',
          fees: 0,
        },
        {
          id: 'bank-transfer',
          name: 'bank-transfer',
          displayName: 'تحويل بنكي يدوي',
          icon: <Building2 className="w-8 h-8" />,
          description: 'تحويل بنكي مع التحقق اليدوي من الإيصال',
          isAvailable: true,
          fees: 0,
        },
        {
          id: 'gift-card',
          name: 'gift-card',
          displayName: 'بطاقة هدية',
          icon: <Gift className="w-8 h-8" />,
          description: 'دفع باستخدام رصيد بطاقة الهدية',
          isAvailable: true,
          fees: 0,
        },
      ];

      setPaymentMethods(methods);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في جلب طرق الدفع');
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setError(null);
  };

  const handlePaymentProcess = async () => {
    if (!selectedMethod) {
      setError('يرجى اختيار طريقة دفع');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      switch (selectedMethod) {
        case 'stripe':
          await processStripePayment();
          break;
        case 'paypal':
          await processPayPalPayment();
          break;
        case 'thawani':
          await processThawaniPayment();
          break;
        case 'bank-transfer':
          await processBankTransferPayment();
          break;
        case 'gift-card':
          await processGiftCardPayment();
          break;
        default:
          setError('طريقة دفع غير معروفة');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في معالجة الدفع');
      onPaymentError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const processStripePayment = async () => {
    // معالجة دفع Stripe
    const response = await fetch('/api/payments/process-stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: totalAmount,
        currency,
        email: customerEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('فشل معالجة الدفع عبر Stripe');
    }

    const data = await response.json();
    // إعادة التوجيه لصفحة Stripe
    window.location.href = data.redirectUrl;
  };

  const processBankTransferPayment = async () => {
    // الذهاب لصفحة التحويل البنكي
    window.location.href = `/checkout/bank-transfer?orderId=${orderId}&amount=${totalAmount}&currency=${currency}`;
  };

  const processGiftCardPayment = async () => {
    // الذهاب لصفحة بطاقة الهدية
    window.location.href = `/checkout/gift-card?orderId=${orderId}&amount=${totalAmount}&currency=${currency}`;
  };

  const processPayPalPayment = async () => {
    throw new Error('PayPal integration coming soon');
  };

  const processThawaniPayment = async () => {
    throw new Error('Thawani integration coming soon');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* عرض المبلغ */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-6 mb-8 text-center">
        <p className="text-red-100 mb-2">إجمالي المبلغ المستحق</p>
        <h2 className="text-4xl font-bold text-white">
          {totalAmount.toFixed(2)} {currency}
        </h2>
      </div>

      {/* رسائل الخطأ */}
      {error && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* رسالة النجاح */}
      {success && (
        <div className="flex items-center gap-3 bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-200">تم معالجة الدفع بنجاح!</p>
        </div>
      )}

      {/* اختيار طريقة الدفع */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">اختر طريقة الدفع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handlePaymentMethodSelect(method.id)}
              disabled={!method.isAvailable || isProcessing}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedMethod === method.id
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              } ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''} ${
                isProcessing ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {method.icon}
                <div className="text-left">
                  <p className="font-bold text-white">{method.displayName}</p>
                  {method.fees ? (
                    <p className="text-sm text-gray-400">رسوم: {method.fees}%</p>
                  ) : null}
                </div>
              </div>
              <p className="text-sm text-gray-300 text-left">{method.description}</p>
              {!method.isAvailable && (
                <p className="text-sm text-yellow-500 mt-2">غير متاح في دولتك</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* زر المتابعة */}
      <button
        onClick={handlePaymentProcess}
        disabled={!selectedMethod || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 ${
          isProcessing
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {isProcessing ? 'جاري المعالجة...' : 'متابعة الدفع'}
      </button>

      {/* معلومات إضافية */}
      <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          🔒 جميع المعاملات آمنة وتشفيرها مشفرة. بيانات بطاقتك لن يتم تخزينها على خوادمنا.
        </p>
      </div>
    </div>
  );
}
