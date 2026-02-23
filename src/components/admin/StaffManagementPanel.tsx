'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Shield, Eye, EyeOff, Copy } from 'lucide-react';
import { Staff } from '@/lib/db-models';

interface StaffManagementProps {
  adminId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

const ROLE_LABELS: Record<Staff['role'], string> = {
  admin: 'مدير',
  'payment-verifier': 'مراجع دفع',
  'support-agent': 'وكيل دعم',
  'content-manager': 'مدير محتوى',
  'analytics-viewer': 'عارض تحليلات',
};

const PERMISSION_LABELS: Record<string, string> = {
  verify_payments: 'التحقق من الدفع',
  view_orders: 'عرض الطلبات',
  manage_staff: 'إدارة الموظفين',
  view_analytics: 'عرض التحليلات',
  manage_coupons: 'إدارة الكوبونات',
  manage_settings: 'إدارة الإعدادات',
  view_game_codes: 'عرض أكواد اللعبة',
};

export default function StaffManagement({
  adminId,
  onSuccess,
  onError,
}: StaffManagementProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

  // فورم إنشاء موظف
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'payment-verifier' as Staff['role'],
    permissions: ['verify_payments'],
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`/api/admin/staff?adminId=${adminId}`);
      // const data = await response.json();
      // setStaff(data);

      // Placeholder
      setStaff([]);
    } catch (err) {
      onError?.('فشل جلب قائمة الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.fullName) {
      onError?.('يرجى ملء جميع الحقول');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/staff/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminId,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل إضافة الموظف');
      }

      const data = await response.json();

      onSuccess?.('تم إضافة الموظف بنجاح');
      setShowCreateModal(false);
      setFormData({
        email: '',
        fullName: '',
        role: 'payment-verifier',
        permissions: ['verify_payments'],
      });
      
      // عرض كلمة المرور المؤقتة
      setSelectedStaff(data.staff);
      setShowPasswordModal(true);
      
      fetchStaff();
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      });

      if (!response.ok) {
        throw new Error('فشل حذف الموظف');
      }

      onSuccess?.('تم حذف الموظف بنجاح');
      fetchStaff();
    } catch (err: any) {
      onError?.(err.message);
    }
  };

  const handleToggleStatus = async (staffId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/staff/${staffId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive, adminId }),
      });

      if (!response.ok) {
        throw new Error('فشل تحديث حالة الموظف');
      }

      onSuccess?.('تم تحديث حالة الموظف بنجاح');
      fetchStaff();
    } catch (err: any) {
      onError?.(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(text);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-red-500" />
          <h3 className="text-2xl font-bold text-white">إدارة الموظفين</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة موظف
        </button>
      </div>

      {/* جدول الموظفين */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">لا توجد موظفين حتى الآن</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4 font-bold text-gray-300">الاسم</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">البريد الإلكتروني</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">الدور</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">2FA</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">الحالة</th>
                <th className="text-right py-3 px-4 font-bold text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="py-3 px-4 font-bold">{member.fullName}</td>
                  <td className="py-3 px-4 text-gray-400">{member.email}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-sm font-bold w-fit">
                      <Shield className="w-4 h-4" />
                      {ROLE_LABELS[member.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {member.twoFactorEnabled ? (
                      <span className="text-green-400">✓ مفعل</span>
                    ) : (
                      <span className="text-red-400">✗ معطل</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(member.id, member.isActive)}
                      className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                        member.isActive
                          ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                          : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                      }`}
                    >
                      {member.isActive ? 'نشط' : 'معطل'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
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

      {/* Modal إضافة موظف */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full">
            <h4 className="text-xl font-bold text-white mb-4">إضافة موظف جديد</h4>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="محمد علي"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">الدور الوظيفي</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Staff['role'] })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">الصلاحيات</label>
                <div className="space-y-2">
                  {Object.entries(PERMISSION_LABELS).map(([perm, label]) => (
                    <label key={perm} className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissions: [...formData.permissions, perm],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              permissions: formData.permissions.filter((p) => p !== perm),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      {label}
                    </label>
                  ))}
                </div>
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
                  {loading ? 'جاري...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal عرض كلمة المرور المؤقتة */}
      {showPasswordModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-amber-500 rounded-lg p-8 max-w-md w-full">
            <h4 className="text-xl font-bold text-white mb-4">⚠️ كلمة المرور المؤقتة</h4>

            <div className="bg-amber-900/20 border border-amber-600 rounded p-4 mb-4">
              <p className="text-amber-200 text-sm mb-3">
                احفظ كلمة المرور المؤقتة أدناه. سيطلب من الموظف تغييرها عند الدخول الأول.
              </p>

              <div className="bg-gray-800 rounded p-3 mb-3">
                <p className="text-gray-400 text-sm mb-1">الاسم:</p>
                <p className="text-white font-bold">{selectedStaff.fullName}</p>
              </div>

              <div className="bg-gray-800 rounded p-3">
                <p className="text-gray-400 text-sm mb-1">كلمة المرور المؤقتة:</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono font-bold">{selectedStaff.password.substring(0, 8)}...</p>
                  <button
                    onClick={() => copyToClipboard(selectedStaff.password)}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedPassword && (
                  <p className="text-green-400 text-xs mt-1">تم النسخ</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
