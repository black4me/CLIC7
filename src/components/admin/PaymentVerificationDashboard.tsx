'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { PaymentTransaction } from '@/lib/db-models';

interface PaymentVerificationDashboardProps {
  staffId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function PaymentVerificationDashboard({
  staffId,
  onSuccess,
  onError,
}: PaymentVerificationDashboardProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`/api/admin/payments/pending?staffId=${staffId}`);
      // const data = await response.json();
      // setTransactions(data);

      // Placeholder
      setTransactions([]);
    } catch (err) {
      onError?.('فشل جلب المعاملات المعلقة');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (approved: boolean) => {
    if (!selectedTransaction) return;

    try {
      setVerifying(true);

      const response = await fetch(
        `/api/admin/payments/${selectedTransaction.id}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approved,
            notes: verifyNotes,
            staffId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('فشل التحقق من الدفع');
      }

      onSuccess?.(
        approved
          ? 'تم قبول الدفع وسيتم إرسال كود اللعبة للعميل'
          : 'تم رفض الدفع'
      );

      setShowVerifyModal(false);
      setVerifyNotes('');
      setSelectedTransaction(null);
      fetchPendingTransactions();
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'verification-pending':
        return <span className="flex items-center gap-1 bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded text-sm">
          <Clock className="w-4 h-4" />
          قيد المراجعة
        </span>;
      case 'completed':
        return <span className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded text-sm">
          <CheckCircle2 className="w-4 h-4" />
          مكتمل
        </span>;
      case 'verification-rejected':
        return <span className="flex items-center gap-1 bg-red-900/30 text-red-400 px-2 py-1 rounded text-sm">
          <XCircle className="w-4 h-4" />
          مرفوض
        </span>;
      default:
        return <span className="text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-6 h-6 text-amber-500" />
        <h3 className="text-2xl font-bold text-white">لوحة التحقق من الدفع</h3>
      </div>

      {/* احصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">قيد المراجعة</p>
          <p className="text-3xl font-bold text-yellow-400">
            {transactions.filter((t) => t.status === 'verification-pending').length}
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">تم القبول</p>
          <p className="text-3xl font-bold text-green-400">
            {transactions.filter((t) => t.status === 'completed').length}
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">تم الرفض</p>
          <p className="text-3xl font-bold text-red-400">
            {transactions.filter((t) => t.status === 'verification-rejected').length}
          </p>
        </div>
      </div>

      {/* جدول المعاملات */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">لا توجد معاملات معلقة</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4 font-bold text-gray-300">رقم الطلب</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">العميل</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">المبلغ</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">التاريخ</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">الحالة</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-700 hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4 font-mono text-red-400">{transaction.orderId}</td>
                  <td className="py-3 px-4 text-white">{transaction.customerId}</td>
                  <td className="py-3 px-4 font-bold">
                    {transaction.amount} {transaction.currency}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {transaction.status === 'verification-pending' && (
                        <>
                          {transaction.receiptProofUrl && (
                            <a
                              href={transaction.receiptProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowVerifyModal(true);
                            }}
                            className="text-amber-400 hover:text-amber-300 transition-colors font-bold text-sm"
                          >
                            تحقق
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal التحقق */}
      {showVerifyModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full">
            <h4 className="text-xl font-bold text-white mb-4">التحقق من الدفع</h4>

            {/* معلومات الطلب */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">رقم الطلب:</span>
                <span className="text-white font-bold">{selectedTransaction.orderId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">المبلغ:</span>
                <span className="text-white font-bold">
                  {selectedTransaction.amount} {selectedTransaction.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">نوع الدفع:</span>
                <span className="text-white font-bold">{selectedTransaction.paymentMethod}</span>
              </div>
            </div>

            {/* الإيصال */}
            {selectedTransaction.receiptProofUrl && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">صورة الإيصال:</p>
                <img
                  src={selectedTransaction.receiptProofUrl}
                  alt="Receipt"
                  className="w-full rounded-lg border border-gray-700 max-h-48 object-cover"
                />
              </div>
            )}

            {/* ملاحظات التحقق */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">ملاحظات التحقق</label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="أضف ملاحظاتك (اختياري)"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 resize-none h-24"
              />
            </div>

            {/* أزرار الإجراء */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApprovePayment(false)}
                disabled={verifying}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors disabled:opacity-50"
              >
                {verifying ? 'جاري...' : 'رفض'}
              </button>
              <button
                onClick={() => handleApprovePayment(true)}
                disabled={verifying}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors disabled:opacity-50"
              >
                {verifying ? 'جاري...' : 'قبول'}
              </button>
            </div>

            <button
              onClick={() => {
                setShowVerifyModal(false);
                setSelectedTransaction(null);
                setVerifyNotes('');
              }}
              className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
