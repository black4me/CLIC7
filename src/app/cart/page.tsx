'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useStore } from '@/context/StoreContext';
import { ShoppingCart, ArrowLeft, Trash2, CreditCard, Tag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const { cart, removeFromCart, validatePromo } = useStore();
    const [promoInput, setPromoInput] = useState('');
    const [promoError, setPromoError] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const handleApplyPromo = () => {
        const { discount, error } = validatePromo(promoInput);
        if (error) {
            setPromoError(error);
            return;
        }
        setPromoError('');
        setAppliedDiscount(discount);
        setPromoInput('');
    };

    const discountAmount = appliedDiscount ?
        (appliedDiscount.type === 'PERCENTAGE' ? total * (appliedDiscount.value / 100) : appliedDiscount.value) : 0;
    const finalTotal = Math.max(0, total - discountAmount);

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-16">
                <header className="mb-12">
                    <h1 className="text-4xl font-black flex items-center gap-4">
                        <ShoppingCart className="text-primary w-10 h-10" />
                        سلة المشتريات
                    </h1>
                    <p className="text-gray-400 mt-2">لديك {cart.length} ألعاب في السلة</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence mode='popLayout'>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group"
                                >
                                    <div className="relative w-24 h-32 rounded-2xl overflow-hidden shadow-2xl">
                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-xl">{item.title}</h3>
                                        <span className="text-primary font-black text-xs uppercase tracking-widest">{item.platform}</span>
                                        <div className="text-2xl font-black mt-2 text-white/90">{item.price.toFixed(3)} <span className="text-sm font-normal text-gray-400">OMR</span></div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {cart.length === 0 && (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <ShoppingCart size={64} className="mx-auto mb-6 text-gray-700" />
                                <h3 className="text-2xl font-bold mb-2">السلة فارغة حالياً</h3>
                                <p className="text-gray-500 mb-8">استكشف أحدث الألعاب وأضفها لسلتك</p>
                                <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-white hover:text-primary transition-all">
                                    تصفح المتجر <ArrowLeft size={18} />
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl sticky top-24 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-6 italic uppercase tracking-tighter">ملخص الطلب</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span>المجموع الفرعي</span>
                                        <span>{total.toFixed(3)} OMR</span>
                                    </div>
                                    {appliedDiscount && (
                                        <div className="flex justify-between items-center text-green-500 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Tag size={14} />
                                                <span>خصم ({appliedDiscount.code})</span>
                                            </div>
                                            <span>-{discountAmount.toFixed(3)} OMR</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span>رسوم الخدمة</span>
                                        <span className="text-green-400">مجاناً</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-lg font-bold">الإجمالي</span>
                                        <span className="text-3xl font-black text-primary">{finalTotal.toFixed(3)} OMR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code Input */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex gap-2 relative">
                                    <input
                                        type="text"
                                        placeholder="كود الخصم"
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                        className="flex-grow bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:border-primary transition-all"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition-all"
                                    >
                                        تطبيق
                                    </button>
                                </div>
                                {promoError && <p className="text-red-500 text-[10px] mt-2 pr-2 font-bold">{promoError}</p>}
                                {appliedDiscount && (
                                    <button
                                        onClick={() => setAppliedDiscount(null)}
                                        className="mt-3 text-[10px] text-gray-500 flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        <X size={10} /> إزالة الكود
                                    </button>
                                )}
                            </div>

                            <Link
                                href="/checkout"
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all ${cart.length > 0 ? 'bg-primary text-white hover:scale-[1.02] shadow-xl shadow-primary/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                <CreditCard size={20} />
                                إتمام الدفع
                            </Link>

                            <p className="text-center text-[10px] text-gray-500 mt-6 uppercase tracking-[0.2em] font-bold">
                                Secure Checkout & Instant Delivery
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
