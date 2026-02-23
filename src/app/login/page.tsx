'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Phone } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'forgot-email' | 'forgot-password'>('login');
    const [resetEmail, setResetEmail] = useState('');
    const [resetPhone, setResetPhone] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Try backend API first (for staff/admin)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                // If it's a staff member or owner, use the provided redirect
                if (data.redirectUrl) {
                    router.push(data.redirectUrl);
                    return;
                }
            }

            // 2. Fallback to localStorage (legacy customers)
            const users = JSON.parse(localStorage.getItem('clic7_users') || '[]');
            const user = users.find((u: any) => u.email === email && u.password === password);

            if (!user) {
                setError(data.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
                return;
            }

            // Save current user
            localStorage.setItem('clic7_current_customer', JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
            }));

            router.push('/customer/dashboard');
        } catch (err) {
            setError('حدث خطأ في تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const users = JSON.parse(localStorage.getItem('clic7_users') || '[]');
            const user = users.find((u: any) => u.phone === resetPhone);

            if (!user) {
                setError('رقم الهاتف غير مسجل في النظام');
                return;
            }

            setMessage(`✅ تم إرسال بريدك الإلكتروني: ${user.email} إلى هاتفك. يرجى التحقق من رسائلك.`);
            setTimeout(() => {
                setMode('login');
                setResetPhone('');
                setMessage('');
            }, 4000);
        } catch (err) {
            setError('حدث خطأ. يرجى التواصل بالدعم');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const users = JSON.parse(localStorage.getItem('clic7_users') || '[]');
            const user = users.find((u: any) => u.email === resetEmail);

            if (!user) {
                setError('هذا البريد الإلكتروني غير مسجل');
                return;
            }

            setMessage('✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق خلال 10 دقائق.');
            setTimeout(() => {
                setMode('login');
                setResetEmail('');
                setMessage('');
            }, 4000);
        } catch (err) {
            setError('حدث خطأ. يرجى التواصل بالدعم');
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
                    {/* Login Mode */}
                    {mode === 'login' && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-right mb-6">تسجيل الدخول</h2>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Email Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                        البريد الإلكتروني
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            required
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
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            required
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

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-right">
                                        {error}
                                    </div>
                                )}

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    {loading ? 'جاري التحميل...' : <>
                                        تسجيل الدخول
                                        <ArrowRight className="w-4 h-4" />
                                    </>}
                                </button>
                            </form>

                            {/* Forgot Password Links */}
                            <div className="mt-6 space-y-2 border-t border-slate-700 pt-6">
                                <button
                                    onClick={() => setMode('forgot-password')}
                                    className="w-full text-right text-sm text-blue-400 hover:text-blue-300 transition"
                                >
                                    هل نسيت كلمة المرور؟
                                </button>
                                <button
                                    onClick={() => setMode('forgot-email')}
                                    className="w-full text-right text-sm text-slate-400 hover:text-slate-300 transition"
                                >
                                    هل نسيت البريد الإلكتروني؟
                                </button>
                            </div>

                            {/* Sign Up Link */}
                            <div className="mt-6 text-center border-t border-slate-700 pt-6">
                                <p className="text-slate-400 text-sm">
                                    ليس لديك حساب؟{' '}
                                    <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                                        إنشاء حساب جديد
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}

                    {/* Forgot Email Mode */}
                    {mode === 'forgot-email' && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-right mb-2">استرجاع البريد الإلكتروني</h2>
                            <p className="text-slate-400 text-right text-sm mb-6">
                                أدخل رقم الهاتف المسجل لديك
                            </p>

                            <form onSubmit={handleForgotEmail} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                        رقم الهاتف
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={resetPhone}
                                            onChange={(e) => setResetPhone(e.target.value)}
                                            placeholder="+966 50 0000000"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-right">
                                        {message}
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-right">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                                >
                                    {loading ? 'جاري المعالجة...' : 'إرسال البريد'}
                                </button>
                            </form>

                            <button
                                onClick={() => setMode('login')}
                                className="w-full text-center text-sm text-slate-400 hover:text-slate-300 mt-4 transition"
                            >
                                العودة لتسجيل الدخول
                            </button>
                        </>
                    )}

                    {/* Forgot Password Mode */}
                    {mode === 'forgot-password' && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-right mb-2">إعادة تعيين كلمة المرور</h2>
                            <p className="text-slate-400 text-right text-sm mb-6">
                                سنرسل لك رابط الإعادة
                            </p>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 text-right">
                                        البريد الإلكتروني
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute right-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-right">
                                        {message}
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-right">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                                >
                                    {loading ? 'جاري المعالجة...' : 'إرسال رابط الإعادة'}
                                </button>
                            </form>

                            <button
                                onClick={() => setMode('login')}
                                className="w-full text-center text-sm text-slate-400 hover:text-slate-300 mt-4 transition"
                            >
                                العودة لتسجيل الدخول
                            </button>
                        </>
                    )}
                </div>

                {/* Support */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    هل تحتاج مساعدة؟{' '}
                    <a href="https://wa.me/966500000000" className="text-blue-400 hover:text-blue-300">
                        تواصل معنا
                    </a>
                </p>
            </div>
        </div>
    );
}
