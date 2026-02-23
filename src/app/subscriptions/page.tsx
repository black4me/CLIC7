'use client';
import Navbar from '@/components/Navbar';
import SeasonGrid from '@/components/SeasonGrid';
import { useStore } from '@/context/StoreContext';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Zap, ArrowRight, Gamepad2 } from 'lucide-react';

export default function SubscriptionsPage() {
    const { seasonPasses } = useStore();
    const activePass = seasonPasses[0];

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white overflow-x-hidden pt-20">
            <Navbar />

            {/* Premium Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Parallax & Gradients */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={activePass?.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"}
                        className="w-full h-full object-cover opacity-60 scale-105"
                        alt="Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0F] via-transparent to-[#0B0B0F]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F]/80 via-transparent to-[#0B0B0F]/80" />
                </div>

                <div className="relative z-10 max-w-4xl text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 px-6 py-2 rounded-full mb-8 backdrop-blur-md"
                    >
                        <Star className="text-primary fill-current" size={16} />
                        <span className="text-sm font-black uppercase tracking-widest text-primary">Season Pass & Subscriptions</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 text-shadow-glow"
                    >
                        {activePass?.title || "CLIC7 SEASON"}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        انغمس في التجربة الكاملة مع بطاقات الموسم الحصرية. مكافآت، تحديثات، ومحتوى إضافي متاح الآن.
                    </motion.p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <button className="bg-primary hover:bg-purple-700 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 transition-all shadow-[0_10px_30px_rgba(138,43,226,0.3)] hover:scale-105 active:scale-95">
                            اشترك الآن
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Cyberpunk grid lines */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(138,43,226,0.5)]" />
            </section>

            {/* Benefits Bento Grid */}
            <section className="py-24 max-w-[1400px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#16161C] p-8 rounded-[32px] border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-all">
                            <Zap className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">وصول مبكر</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">كن أول من يجرب التحديثات الجديدة والخرائط والأسلحة قبل الجميع.</p>
                    </div>
                    <div className="bg-[#16161C] p-8 rounded-[32px] border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-all">
                            <Gamepad2 className="text-blue-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">محتوى حصري</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">احصل على أزياء، تمويهات، ومعدات فريدة لا تتوفر إلا لمشتركي بطاقة الموسم.</p>
                    </div>
                    <div className="bg-[#16161C] p-8 rounded-[32px] border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-all">
                            <ShieldCheck className="text-green-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">دعم فني متميز</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">أولوية في الدعم الفني لمساعدتك في أي وقت وبأسرع استجابة ممكنة.</p>
                    </div>
                </div>
            </section>

            {/* Reuse the dynamic SeasonGrid */}
            <div className="border-t border-white/5">
                <SeasonGrid />
            </div>
        </main>
    );
}
