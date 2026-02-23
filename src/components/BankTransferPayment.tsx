'use client';

import React, { useState, useEffect } from 'react';
import { Building2, AlertCircle, CheckCircle2, Copy, Download } from 'lucide-react';
import { BankTransferDetails } from '@/lib/db-models';

interface BankTransferPaymentProps {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export default function BankTransferPayment({
  orderId,
  amount,
  currency,
  customerEmail,
  onSuccess,
  onError,
}: BankTransferPaymentProps) {
  const [bankDetails, setBankDetails] = useState<BankTransferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'upload'>('details');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      // const response = await fetch('/api/payments/bank-transfer/details');
      // const data = await response.json();
      // setBankDetails(data);

      // Placeholder data
      setBankDetails({
        id: 'bank-1',
        bankName: 'البنك السعودي للاستثمار',
        accountNumber: '1234567890123456',
        accountHolder: 'CLIC7 Company',
        iban: 'SA5912345678901234567890',
        swiftCode: 'SABOSASR',
        phoneNumber: '+966501234567',
        qrCodeImage: '/assets/qr-code.png',
        bankCardImage: '/assets/bank-card.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      setError('فشل جلب تفاصيل التحويل البنكي');
      onError('فشل جلب تفاصيل التحويل البنكي');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. استخدم JPEG أو PNG أو WebP');
      return;
    }

    // التحقق من حجم الملف
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الملف يجب أن يكون أقل من 5MB');
      return;
    }

    setUploadedFile(file);
    setError(null);
  };

  const handleUploadReceipt = async () => {
    if (!uploadedFile) {
      setError('يرجى اختيار صورة الإيصال');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('receipt', uploadedFile);
      formData.append('orderId', orderId);
      formData.append('amount', amount.toString());
      formData.append('currency', currency);

      const response = await fetch('/api/payments/bank-transfer/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل رفع الإيصال');
      }

      const data = await response.json();
      onSuccess(data.transactionId);
    } catch (err: any) {
      const errorMsg = err.message || 'حدث خطأ في رفع الإيصال';
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setUploading(false);
    }
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
      {error && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {step === 'details' && (
        <>
          {/* عرض المبلغ */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg p-6 mb-8 text-center">
            <p className="text-amber-100 mb-2">المبلغ المطلوب تحويله</p>
            <h2 className="text-4xl font-bold text-white mb-2">
              {amount.toFixed(2)} {currency}
            </h2>
            <p className="text-amber-100 text-sm">رقم الطلب: {orderId}</p>
          </div>

          {/* تفاصيل البنك */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-amber-500" />
              <h3 className="text-2xl font-bold text-white">تفاصيل التحويل البنكي</h3>
            </div>

            {bankDetails && (
              <>
                {/* بيانات البنك */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">اسم البنك</p>
                    <div className="flex items-center justify-between bg-gray-800 rounded p-3">
                      <p className="text-white font-bold">{bankDetails.bankName}</p>
                      <button
                        onClick={() => copyToClipboard(bankDetails.bankName, 'Bank Name')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copyFeedback === 'Bank Name' && (
                      <p className="text-green-400 text-xs mt-1">تم النسخ</p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">اسم صاحب الحساب</p>
                    <div className="flex items-center justify-between bg-gray-800 rounded p-3">
                      <p className="text-white font-bold">{bankDetails.accountHolder}</p>
                      <button
                        onClick={() => copyToClipboard(bankDetails.accountHolder, 'Account Holder')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copyFeedback === 'Account Holder' && (
                      <p className="text-green-400 text-xs mt-1">تم النسخ</p>
                    )}
                  </div>
                </div>

                {/* رقم الحساب */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-1">رقم الحساب</p>
                  <div className="flex items-center justify-between bg-gray-800 rounded p-3">
                    <p className="text-white font-mono font-bold text-lg">{bankDetails.accountNumber}</p>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copyFeedback === 'Account Number' && (
                    <p className="text-green-400 text-xs mt-1">تم النسخ</p>
                  )}
                </div>

                {/* IBAN */}
                {bankDetails.iban && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-1">IBAN</p>
                    <div className="flex items-center justify-between bg-gray-800 rounded p-3">
                      <p className="text-white font-mono font-bold">{bankDetails.iban}</p>
                      <button
                        onClick={() => copyToClipboard(bankDetails.iban || '', 'IBAN')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copyFeedback === 'IBAN' && (
                      <p className="text-green-400 text-xs mt-1">تم النسخ</p>
                    )}
                  </div>
                )}

                {/* رقم هاتف للتحويل السريع */}
                {bankDetails.phoneNumber && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-1">رقم الهاتف للتحويل السريع</p>
                    <div className="flex items-center justify-between bg-gray-800 rounded p-3">
                      <p className="text-white font-mono font-bold">{bankDetails.phoneNumber}</p>
                      <button
                        onClick={() => copyToClipboard(bankDetails.phoneNumber || '', 'Phone')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copyFeedback === 'Phone' && (
                      <p className="text-green-400 text-xs mt-1">تم النسخ</p>
                    )}
                  </div>
                )}

                {/* صور QR و البطاقة البنكية */}
                {(bankDetails.qrCodeImage || bankDetails.bankCardImage) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {bankDetails.qrCodeImage && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">رمز QR</p>
                        <img
                          src={bankDetails.qrCodeImage}
                          alt="QR Code"
                          className="w-full rounded-lg border border-gray-700"
                        />
                      </div>
                    )}
                    {bankDetails.bankCardImage && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">صورة البطاقة البنكية</p>
                        <img
                          src={bankDetails.bankCardImage}
                          alt="Bank Card"
                          className="w-full rounded-lg border border-gray-700"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* تعليمات */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-8">
            <h4 className="text-white font-bold mb-3">📋 خطوات الدفع:</h4>
            <ol className="text-blue-200 space-y-2 ml-6 list-decimal">
              <li>نسخ تفاصيل الحساب البنكي أعلاه</li>
              <li>قم بالتحويل من حسابك البنكي بالمبلغ المطلوب</li>
              <li>احفظ صورة إيصال التحويل</li>
              <li>قم برفع الإيصال في الخطوة التالية</li>
              <li>سيتم مراجعة الإيصال والتحقق من الدفع</li>
            </ol>
          </div>

          <button
            onClick={() => setStep('upload')}
            className="w-full py-3 px-4 rounded-lg font-bold text-lg bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200"
          >
            التالي: رفع الإيصال →
          </button>
        </>
      )}

      {step === 'upload' && (
        <>
          {/* رفع الإيصال */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">رفع صورة الإيصال</h3>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                يرجى رفع صورة واضحة لإيصال التحويل البنكي الخاص بك.
              </p>

              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-amber-500 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-amber-500', 'bg-amber-900/10');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-amber-500', 'bg-amber-900/10');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-amber-500', 'bg-amber-900/10');
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const input = document.getElementById('receipt-input') as HTMLInputElement;
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    handleFileSelect({ target: input } as any);
                  }
                }}
              >
                <input
                  id="receipt-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="receipt-input" className="cursor-pointer block">
                  {uploadedFile ? (
                    <>
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-400 font-bold">{uploadedFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Download className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-white font-bold mb-1">انقر لاختيار الملف أو اسحب الملف هنا</p>
                      <p className="text-gray-400 text-sm">PNG, JPEG أو WebP (أقصى 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* معاينة الصورة */}
            {uploadedFile && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">معاينة:</p>
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Receipt Preview"
                  className="max-h-64 rounded-lg border border-gray-700 mx-auto"
                />
              </div>
            )}
          </div>

          {/* تنبيهات مهمة */}
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 mb-8">
            <h4 className="text-yellow-400 font-bold mb-3">⚠️ تنبيهات مهمة:</h4>
            <ul className="text-yellow-200 space-y-2 ml-6 list-disc">
              <li>تأكد من وضوح البيانات في الصورة</li>
              <li>تأكد من ظهور المبلغ وتاريخ التحويل بوضوح</li>
              <li>يجب أن تحتوي الصورة على معرف الحساب المستلم</li>
              <li>سيتم التحقق من الإيصال يدوياً خلال 24-48 ساعة</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('details')}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
            >
              ← السابق
            </button>
            <button
              onClick={handleUploadReceipt}
              disabled={!uploadedFile || uploading}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                uploading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {uploading ? 'جاري الرفع...' : 'تأكيد وإرسال'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
