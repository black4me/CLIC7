'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
                setError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            const adminSettings = JSON.parse(
                localStorage.getItem('clic7_admin_settings') || '{"contactEmail": "admin@clic7.com"}'
            );

            const messages = JSON.parse(localStorage.getItem('clic7_contact_messages') || '[]');
            messages.push({
                id: `msg-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
                sentAt: new Date().toISOString(),
                read: false,
                adminEmail: adminSettings.contactEmail,
            });

            localStorage.setItem('clic7_contact_messages', JSON.stringify(messages));
            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError('حدث خطأ في إرسال الرسالة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-blue-400">
                        CLIC7
                    </Link>
                    <nav className="flex gap-6">
                        <Link href="/login" className="text-slate-400 hover:text-white transition">
                            تسجيل الدخول
                        </Link>
                        <Link href="/register" className="text-blue-400 hover:text-blue-300 transition">
                            إنشاء حساب
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">اتصل بنا</h1>
                    <p className="text-slate-400 text-lg">لديك سؤال؟ نحن هنا للمساعدة. تواصل معنا في أي وقت</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                        <Mail className="w-8 h-8 text-blue-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">البريد الإلكتروني</h3>
                        <p className="text-slate-400">support@clic7.com</p>
                        <p className="text-slate-500 text-sm mt-2">الرد خلال 24 ساعة</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                        <Phone className="w-8 h-8 text-green-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">الهاتف</h3>
                        <p className="text-slate-400">+966 50 0000000</p>
                        <p className="text-slate-500 text-sm mt-2">من الأحد إلى الخميس 9-6</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                        <MapPin className="w-8 h-8 text-red-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">العنوان</h3>
                        <p className="text-slate-400">المملكة العربية السعودية</p>
                        <p className="text-slate-500 text-sm mt-2">الرياض</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">أرسل لنا رسالة</h2>

                    {success && (
                        <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                                <p className="text-green-400 font-semibold">تم إرسال الرسالة بنجاح!</p>
                                <p className="text-green-300 text-sm">سيتواصل معك فريقنا قريباً</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                الاسم الكامل
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="أحمد محمد"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                رقم الهاتف (اختياري)
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+966 50 0000000"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                الموضوع
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="موضوع الرسالة"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                الرسالة
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="اكتب رسالتك هنا..."
                                rows={6}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {loading ? 'جاري الإرسال...' : <>
                                <Send className="w-5 h-5" />
                                <span>أرسل الرسالة</span>
                            </>}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                            💡 ستتم إضافة رسالتك إلى نظام الدعم وسيتواصل معك المدير على البريد المسجل في المنصة
                        </p>
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">الأسئلة الشائعة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-3">كم وقت الرد؟</h3>
                            <p className="text-slate-400">نحاول الرد على جميع الرسائل خلال 24 ساعة</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-3">هل يمكنني تتبع طلبي؟</h3>
                            <p className="text-slate-400">نعم، من لوحة التحكم بعد تسجيل الدخول</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-3">نسيت كلمة المرور؟</h3>
                            <p className="text-slate-400">اضغط على "نسيت كلمة المرور" في صفحة الدخول</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-3">كيف أحصل على فاتورة؟</h3>
                            <p className="text-slate-400">من سجل الشراء انقر "تحميل الإيصال"</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-700 mt-16 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
                    <p>© 2025 CLIC7. جميع الحقوق محفوظة</p>
                </div>
            </div>
        </div>
    );
}
