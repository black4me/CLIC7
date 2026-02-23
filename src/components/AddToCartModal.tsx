'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function AddToCartModal() {
    const { showCartModal, setShowCartModal, lastAddedGame } = useStore();

    if (!lastAddedGame) return null;

    return (
        <AnimatePresence>
            {showCartModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCartModal(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#15151A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                        dir="rtl"
                    >
                        <button
                            onClick={() => setShowCartModal(false)}
                            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-white transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative w-32 h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
                                    <Image
                                        src={lastAddedGame.image}
                                        alt={lastAddedGame.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="bg-primary/20 text-primary self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                                        تمت الإضافة للسلة
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                        {lastAddedGame.title}
                                    </h3>
                                    <p className="text-gray-400 font-bold">
                                        {lastAddedGame.price.toFixed(3)} OMR
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <Link
                                    href="/checkout"
                                    onClick={() => setShowCartModal(false)}
                                    className="w-full bg-primary hover:bg-white hover:text-primary text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                                >
                                    <ShoppingBag size={20} />
                                    إتمام الشراء
                                </Link>
                                <button
                                    onClick={() => setShowCartModal(false)}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 border border-white/5"
                                >
                                    متابعة التسوق
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Animated background element */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
