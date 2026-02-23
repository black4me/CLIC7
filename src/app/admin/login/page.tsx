'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, AlertCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [sessionToken, setSessionToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const router = useRouter();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password }) // Send password
            });

            const data = await res.json();

            if (res.ok && data.success) {
                if (data.requiresTwoFactor) {
                    // Email verified, now require OTP
                    setSessionToken(data.sessionToken);
                    setStep('otp');
                } else {
                    // Direct login success
                    if (data.user) {
                        localStorage.setItem('clic7_current_user', JSON.stringify(data.user));
                    }
                    router.push(data.redirectUrl || '/admin');
                    router.refresh();
                }
            } else {
                setError(data.message || 'بيانات الدخول غير صحيحة');
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, otpCode })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Save user info for client-side role checks
                if (data.user) {
                    localStorage.setItem('clic7_current_user', JSON.stringify(data.user));
                }
                router.push('/admin');
                router.refresh();
            } else {
                setError(data.message || 'رمز التحقق غير صحيح');
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#15151A] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                            {step === 'email' ? (
                                <Lock size={32} className="text-primary" />
                            ) : (
                                <Shield size={32} className="text-primary" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">CLIC7 ADMIN</h1>
                        <p className="text-gray-400 text-sm">
                            {step === 'email'
                                ? 'سجل الدخول للوصول إلى لوحة التحكم'
                                : 'أدخل رمز التحقق من تطبيق المصادقة'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'email' ? (
                            <motion.form
                                key="email"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleEmailSubmit}
                                className="space-y-6"
                            >
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pr-12 pl-4 text-white focus:border-primary outline-none transition-colors"
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">كلمة المرور</label>
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pr-12 pl-4 text-white focus:border-primary outline-none transition-colors"
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleOtpSubmit}
                                className="space-y-6"
                            >
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">رمز التحقق (OTP)</label>
                                    <div className="relative">
                                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pr-12 pl-4 text-white focus:border-primary outline-none transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">
                                        أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading || otpCode.length !== 6}
                                        className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'الدخول عبر OTP'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('email');
                                            setOtpCode('');
                                            setError('');
                                        }}
                                        className="w-full text-gray-400 hover:text-white text-sm font-bold py-2 transition-colors"
                                    >
                                        العودة إلى إدخال البريد
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center text-gray-600 text-xs mt-8">
                    &copy; 2026 CLIC7 Store. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
