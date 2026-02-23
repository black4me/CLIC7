'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, User, Mail, Phone, Save } from 'lucide-react';

export default function CustomerSettings() {
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const currentCustomer = localStorage.getItem('clic7_current_customer');
        if (!currentCustomer) {
            router.push('/login');
            return;
        }

        const customer = JSON.parse(currentCustomer);
        setCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
        });
        setLoading(false);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('clic7_users') || '[]');
            const userIndex = users.findIndex((u: any) => u.id === customer.id);
            
            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                };
                localStorage.setItem('clic7_users', JSON.stringify(users));

                // Update current customer
                const updatedCustomer = {
                    ...customer,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                };
                localStorage.setItem('clic7_current_customer', JSON.stringify(updatedCustomer));
                setCustomer(updatedCustomer);

                setMessage('✅ تم تحديث البيانات بنجاح');
            }
        } catch (error) {
            setMessage('❌ حدث خطأ في التحديث');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>جاري تحميل الإعدادات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-blue-400">
                        CLIC7
                    </Link>
                    <Link
                        href="/customer/dashboard"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>العودة</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-white mb-2">الإعدادات</h1>
                <p className="text-slate-400 mb-8">تحديث البيانات الشخصية</p>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                <span className="flex items-center justify-end gap-2">
                                    <span>الاسم الكامل</span>
                                    <User className="w-4 h-4" />
                                </span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="أدخل اسمك الكامل"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                <span className="flex items-center justify-end gap-2">
                                    <span>البريد الإلكتروني</span>
                                    <Mail className="w-4 h-4" />
                                </span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                <span className="flex items-center justify-end gap-2">
                                    <span>رقم الهاتف</span>
                                    <Phone className="w-4 h-4" />
                                </span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+966 50 0000000"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`p-4 rounded-lg text-sm ${
                                message.includes('✅')
                                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                            }`}>
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {saving ? 'جاري الحفظ...' : <>
                                <Save className="w-4 h-4" />
                                <span>حفظ التغييرات</span>
                            </>}
                        </button>
                    </form>

                    {/* Account Info */}
                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">معلومات الحساب</h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <p>معرّف الحساب: <span className="text-white font-mono text-xs">{customer.id}</span></p>
                            <p>تاريخ الإنشاء: تاريخ غير محدد</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
