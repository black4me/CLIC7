'use client';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { Game } from '@/data/games';

const fallbackPhases = [
    {
        number: '01',
        name: 'العمليات السرية',
        englishName: 'Covert Ops',
        summary: 'تسلل إلى خلف خطوط العدو لكشف المؤامرة العالمية التي تهدد أمن واستقرار المنطقة.',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
        color: '#0070D1'
    },
    {
        number: '02',
        name: 'مقاومة كاليفورنيا',
        englishName: 'California Resistance',
        summary: 'انضم إلى صفوف المقاومة في قتال شوارع عنيف لاستعادة السيطرة على المدن المحتلة.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070',
        color: '#D13434'
    },
    {
        number: '03',
        name: 'هجوم الشتاء',
        englishName: 'Winter Storm',
        summary: 'واجه أقسى الظروف المناخية في معارك جليدية تتطلب مهارات بقاء عالية وتكتيكات دفاعية جديدة.',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071',
        color: '#10b981'
    }
];

export default function SeasonGrid({ game }: { game?: Game }) {
    const { seasonPasses } = useStore();

    // Priority: 1. Game-specific updates, 2. Global season pass, 3. Fallback
    const activePass = seasonPasses[0];

    let phases = fallbackPhases;
    let title = 'مستقبل الحرب';

    if (game?.seasonUpdates && game.seasonUpdates.length > 0) {
        phases = game.seasonUpdates.map((s, idx) => ({
            number: `0${idx + 1}`,
            name: s.title,
            englishName: s.title,
            summary: s.description,
            image: s.image,
            color: idx === 0 ? '#0070D1' : idx === 1 ? '#D13434' : '#10b981'
        }));
        title = game.title;
    } else if (activePass) {
        phases = activePass.phases;
        title = activePass.title;
    }
    return (
        <section id="seasons" className="py-24 px-4 bg-black relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#16161C] to-transparent" />

            <div className="max-w-[1600px] mx-auto relative z-10">
                <div className="flex flex-col mb-16 space-y-4">
                    <span className="text-primary font-black tracking-[0.4em] uppercase text-xs">Season Content</span>
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
                        تحديثات الموسم: <span className="text-[#D13434]">{title}</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {phases.map((phase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="group relative"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                                <img
                                    src={phase.image}
                                    alt={phase.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                <div className="absolute top-4 left-4">
                                    <span className="text-4xl font-black text-white/10 italic">{phase.number}</span>
                                </div>

                                <div className="absolute bottom-6 right-6 text-right">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm mb-2 inline-block text-white"
                                        style={{ backgroundColor: phase.color }}
                                    >
                                        {phase.englishName}
                                    </span>
                                    <h3 className="text-2xl font-black text-white uppercase italic">{phase.name}</h3>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                    {phase.summary}
                                </p>
                                <button className="text-sm font-bold text-white hover:text-primary flex items-center gap-2 transition-colors uppercase tracking-widest group">
                                    <span>اكتشف المزيد</span>
                                    <div className="h-0.5 w-8 bg-primary transition-all group-hover:w-12" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
