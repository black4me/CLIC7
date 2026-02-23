'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Zap, Gift, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';

interface RewardsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
    const { currentUser, settings } = useStore();

    if (!isOpen) return null;

    const points = currentUser?.points || 0;
    const progress = Math.min((points / 1000) * 100, 100);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#15151A] rounded-[40px] border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]"
                >
                    {/* Header Image/Pattern */}
                    <div className="h-32 bg-gradient-to-br from-primary via-purple-600 to-blue-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 md:p-12 -mt-16 relative z-10">
                        {/* User Profile Summary */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-24 h-24 bg-[#15151A] rounded-3xl p-1 border border-white/10 mb-4 shadow-2xl">
                                <div className="w-full h-full bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                                    <Star size={40} className="fill-primary" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">CLIC7 REWARDS</h2>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest bg-white/5 px-4 py-1 rounded-full border border-white/5">
                                Loyalty Program
                            </p>
                        </div>

                        {/* Progress Section */}
                        <div className="bg-black/40 p-8 rounded-[32px] border border-white/5 mb-8">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">رصيدك الحالي</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black font-mono text-white">{points}</span>
                                        <span className="text-xs font-bold text-primary italic uppercase tracking-widest">Points</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">المستوى التالي</p>
                                    <span className="text-sm font-bold text-white uppercase tracking-tighter">Elite Member</span>
                                </div>
                            </div>

                            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-2 border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <span className="text-center min-w-[40px]">0 PTS</span>
                                <span className="text-center flex-1 px-2">{Math.max(1000 - points, 0)} Pts remaining for Elite</span>
                                <span className="text-center min-w-[50px]">1000 PTS</span>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Zap size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black italic uppercase tracking-tight">اربح النقاط</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed font-bold">كل 1 ريال عُماني تشتري به يساوي 10 نقاط في رصيدك.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                    <Gift size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black italic uppercase tracking-tight">استبدل الجوائز</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed font-bold">استخدم نقاطك للحصول على خصومات فورية أو ألعاب مجانية.</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button - Fixed: Properly centered and clickable */}
                        <div className="w-full flex justify-center mt-8 px-4">
                            <Link
                                href="/games"
                                onClick={onClose}
                                className="group relative w-full sm:w-auto sm:min-w-[280px] bg-white text-black font-black italic uppercase tracking-tighter py-4 sm:py-5 px-8 sm:px-10 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl overflow-hidden"
                            >
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-white/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none" />

                                {/* Button content */}
                                <span className="relative z-10 whitespace-nowrap text-sm sm:text-base">
                                    ابدأ التسوق واربح النقاط
                                </span>
                                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-black/60 p-4 border-t border-white/5 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-primary" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Secured Program</span>
                        </div>
                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CLIC7 Official</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

