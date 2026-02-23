'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validation
            if (!formData.name.trim()) {
                setError('الاسم مطلوب');
                return;
            }
            if (!formData.email.includes('@')) {
                setError('البريد الإلكتروني غير صحيح');
                return;
            }
            if (formData.password.length < 6) {
                setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('كلمات المرور غير متطابقة');
                return;
            }

            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('clic7_users') || '[]');
            if (users.find((u: any) => u.email === formData.email)) {
                setError('هذا البريد الإلكتروني مسجل بالفعل');
                return;
            }

            // Create new user
            const newUser = {
                id: `user-${Date.now()}`,
                email: formData.email,
                name: formData.name,
                phone: formData.phone,
                password: formData.password, // In production, use bcrypt
                createdAt: new Date().toISOString(),
            };

            users.push(newUser);
            localStorage.setItem('clic7_users', JSON.stringify(users));

            // Log them in automatically
            localStorage.setItem('clic7_current_customer', JSON.stringify({
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone,
            }));

            setSuccess(true);
            setTimeout(() => {
                router.push('/customer/dashboard');
            }, 2000);
        } catch (err) {
            setError('حدث خطأ في إنشاء الحساب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">CLIC7</h1>
                    <p className="text-slate-400">منصة الألعاب الرقمية</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white text-right mb-6">إنشاء حساب جديد</h2>

                    {success ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">تم إنشاء الحساب بنجاح!</h3>
                            <p className="text-slate-400 mb-4">جاري إعادة التوجيه...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                    الاسم الكامل
                                </label>
                                <div className="relative">
                                    <User className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="أحمد محمد"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                    رقم الهاتف
                                </label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+966 50 0000000"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                                    >
                                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-right">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                {loading ? 'جاري الإنشاء...' : <>
                                    إنشاء حساب جديد
                                    <ArrowRight className="w-4 h-4" />
                                </>}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="my-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-800 text-slate-500">أو</span>
                        </div>
                    </div>

                    {/* Google Sign Up Button */}
                    <button
                        type="button"
                        className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>تسجيل عبر جوجل</span>
                    </button>

                    {/* Login Link */}
                    <div className="mt-6 text-center border-t border-slate-700 pt-6">
                        <p className="text-slate-400 text-sm">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Support */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    هل تحتاج مساعدة؟{' '}
                    <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                        اتصل بنا
                    </Link>
                </p>
            </div>
        </div>
    );
}
