'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Gift, Plus, Trash2, Edit2, Calendar, Percent, DollarSign } from 'lucide-react';
import { Coupon, GiftCard } from '@/lib/db-models';

interface CouponManagementProps {
  adminId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function CouponManagement({
  adminId,
  onSuccess,
  onError,
}: CouponManagementProps) {
  const [activeTab, setActiveTab] = useState<'coupons' | 'gift-cards'>('coupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // فورم إنشاء كوبون
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed-amount',
    discountValue: 0,
    maxUsages: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchCoupons();
    } else {
      fetchGiftCards();
    }
  }, [activeTab]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`/api/marketing/coupons?adminId=${adminId}`);
      // const data = await response.json();
      // setCoupons(data);

      // Placeholder
      setCoupons([]);
    } catch (err) {
      onError?.('فشل جلب الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`/api/marketing/gift-cards?adminId=${adminId}`);
      // const data = await response.json();
      // setGiftCards(data);

      // Placeholder
      setGiftCards([]);
    } catch (err) {
      onError?.('فشل جلب بطاقات الهدايا');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || formData.discountValue <= 0) {
      onError?.('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/marketing/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminId,
          validFrom: new Date(formData.validFrom),
          validUntil: new Date(formData.validUntil),
        }),
      });

      if (!response.ok) {
        throw new Error('فشل إنشاء الكوبون');
      }

      onSuccess?.('تم إنشاء الكوبون بنجاح');
      setShowCreateModal(false);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        maxUsages: 10,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchCoupons();
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

    try {
      const response = await fetch(`/api/marketing/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      });

      if (!response.ok) {
        throw new Error('فشل حذف الكوبون');
      }

      onSuccess?.('تم حذف الكوبون بنجاح');
      fetchCoupons();
    } catch (err: any) {
      onError?.(err.message);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      {/* التبويبات */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-3 font-bold transition-colors ${
            activeTab === 'coupons'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Ticket className="w-5 h-5" />
          الكوبونات
        </button>
        <button
          onClick={() => setActiveTab('gift-cards')}
          className={`flex items-center gap-2 px-4 py-3 font-bold transition-colors ${
            activeTab === 'gift-cards'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Gift className="w-5 h-5" />
          بطاقات الهدايا
        </button>
      </div>

      {/* محتوى الكوبونات */}
      {activeTab === 'coupons' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">إدارة الكوبونات</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء كوبون
            </button>
          </div>

          {/* جدول الكوبونات */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">لا توجد كوبونات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-right py-3 px-4 font-bold text-gray-300">الكود</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-300">الخصم</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-300">الاستخدام</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-300">الصلاحية</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-300">الحالة</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-300">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <code className="bg-gray-800 px-2 py-1 rounded text-red-400">
                          {coupon.code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        {coupon.discountType === 'percentage' ? (
                          <span className="flex items-center gap-1">
                            <Percent className="w-4 h-4" />
                            {coupon.discountValue}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {coupon.discountValue}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {coupon.currentUsages} / {coupon.maxUsages}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(coupon.validUntil).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm font-bold ${
                            coupon.isActive
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {coupon.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* محتوى بطاقات الهدايا */}
      {activeTab === 'gift-cards' && (
        <>
          <h3 className="text-2xl font-bold text-white mb-6">إدارة بطاقات الهدايا</h3>
          <div className="text-center py-8 text-gray-400">
            إدارة بطاقات الهدايا قريباً...
          </div>
        </>
      )}

      {/* Modal إنشاء كوبون */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full">
            <h4 className="text-xl font-bold text-white mb-4">إنشاء كوبون جديد</h4>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">كود الكوبون</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">نوع الخصم</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed-amount">مبلغ ثابت</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">قيمة الخصم</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                  placeholder="20"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">عدد الاستخدام</label>
                <input
                  type="number"
                  value={formData.maxUsages}
                  onChange={(e) => setFormData({ ...formData, maxUsages: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري...' : 'إنشاء'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
