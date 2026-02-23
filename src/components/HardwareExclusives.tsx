'use client';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Users, Zap, ExternalLink } from 'lucide-react';
import { Game } from '@/data/games';
import { useStore } from '@/context/StoreContext';

const exclusives = [
    {
        title: 'Double XP Boost',
        description: 'احصل على ضعف نقاط الخبرة في نهاية كل أسبوع حصرياً لمشتركي PlayStation Plus.',
        icon: Zap,
        color: '#0070D1'
    },
    {
        title: 'Team Boosts',
        description: 'فعل ميزة تعزيز الفريق لتزيد من سرعة تطوير المعدات لجميع أعضاء فرقتك.',
        icon: Users,
        color: '#9333ea'
    }
];

export default function HardwareExclusives({ game }: { game?: Game }) {
    const { settings } = useStore();

    // If hardware section is disabled globally
    if (!settings.sections.hardware) return null;

    // If game has hardwareExclusives settings, use them. Otherwise show both by default.
    const showPS = game?.hardwareExclusives?.showPlayStationExclusives ?? true;
    const showEdge = game?.hardwareExclusives?.showDualSenseEdge ?? true;

    if (!showPS && !showEdge) return null;
    return (
        <section id="modes" className="py-24 px-4 bg-black relative">
            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Hardware Card: DualSense Edge */}
                    {showEdge && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative group h-[600px] rounded-[50px] overflow-hidden bg-gradient-to-br from-[#16161C] to-black border border-white/5"
                        >
                            <div className="absolute inset-0 z-10 p-12 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <span className="text-primary font-black tracking-widest uppercase text-xs">Official Hardware</span>
                                    <h3 className="text-4xl md:text-5xl font-black text-white italic leading-tight uppercase tracking-tighter">
                                        DualSense Edge™<br />Wireless Controller
                                    </h3>
                                    <p className="text-gray-400 max-w-sm text-lg font-medium">
                                        احصل على الأفضلية في ساحة المعركة مع أزرار قابلة للتخصيص ومقاطع تحكم مطورة.
                                    </p>
                                </div>

                                <button className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm group/btn">
                                    <span className="border-b-2 border-primary pb-1 group-hover/btn:pr-6 transition-all duration-300">Find out more</span>
                                    <ExternalLink size={18} className="text-primary" />
                                </button>
                            </div>

                            {/* High-res Hardware Asset (Mocked with Unsplash/Image) */}
                            <div className="absolute bottom-0 right-0 w-[120%] h-full z-0 translate-x-1/4 translate-y-1/4">
                                <img
                                    src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2070"
                                    className="w-full h-full object-contain filter grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                    alt="DualSense Edge"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Exclusives Section */}
                    {showPS && (
                        <div className="space-y-8">
                            <div className="space-y-4 mb-12">
                                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">PlayStation الحصرية</h2>
                                <p className="text-gray-400 text-lg">مزايا ومكافآت مصممة خصيصاً لمجتمع لاعبي PlayStation في Battlefield.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {exclusives.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="p-8 rounded-[40px] bg-[#16161C] border border-white/5 space-y-6 group"
                                    >
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg"
                                            style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
                                        >
                                            <item.icon size={32} style={{ color: item.color }} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-white italic uppercase">{item.title}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Connectivity/Cross-play Banner */}
                            <div className="mt-8 p-8 rounded-[40px] bg-gradient-to-r from-[#0070D1] to-[#005bb5] relative overflow-hidden group">
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-white italic uppercase italic">Full Cross-Play Support</h4>
                                        <p className="text-blue-100/80 text-sm">العب مع أصدقائك على أي منصة بكل سهولة وسلاسة.</p>
                                    </div>
                                    <ArrowLeftRight size={48} className="text-white/20 group-hover:scale-125 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
