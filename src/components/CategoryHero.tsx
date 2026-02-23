'use client';
import { motion } from 'framer-motion';
import { ShoppingCart, Info, Play, ExternalLink, Monitor, Gamepad2, Laptop, Trophy } from 'lucide-react';
import { Game } from '@/data/games';
import { useStore } from '@/context/StoreContext';
import { toast } from 'sonner';
import { getYouTubeID } from '@/utils/youtube';

interface CategoryHeroProps {
    game: Game;
    categoryTitle: string;
    categorySubtitle: string;
    categoryIcon: React.ReactNode;
}

export default function CategoryHero({ game, categoryTitle, categorySubtitle, categoryIcon }: CategoryHeroProps) {
    const { addToCart, settings } = useStore();
    const trailerId = getYouTubeID(game.trailerVideoUrl || '');

    const handleAddToCart = () => {
        addToCart(game);
        toast.success(`تم إضافة ${game.title} إلى السلة`);
    };

    const platformIcons = {
        'PC': Monitor,
        'PS5': Gamepad2,
        'Xbox': Laptop
    };

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 bg-[#0B0B0F]">
            {/* Background Image with Cinematic Effects */}
            <div className="absolute inset-0 z-0">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover blur-[1px]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F] via-[#0B0B0F]/90 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-transparent" />
            </div>

            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10 py-12">
                {/* Left Content */}
                <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-wrap items-center gap-8"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-xl text-primary border border-primary/20 backdrop-blur-md">
                                {categoryIcon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">{categoryTitle}</span>
                                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5">Explore Category</span>
                            </div>
                        </div>

                        {/* Platform Badges */}
                        <div className="flex items-center gap-4 border-r border-white/10 pr-8 mr-2 px-6">
                            {(game.availablePlatforms || [game.platform]).map((p) => {
                                const Icon = platformIcons[p as keyof typeof platformIcons] || Monitor;
                                return (
                                    <div key={p} className="flex flex-col items-center gap-1 text-gray-400 group hover:text-white transition-all cursor-default">
                                        <Icon size={16} className="group-hover:text-[#0070D1] transition-transform group-hover:scale-110" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100">{p}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        {/* Season Info as Sub-headline (High-End Label) */}
                        {game.seasonInfo && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-3 py-2 px-4 bg-gradient-to-r from-[#0070D1] to-[#00A3FF] rounded-lg text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,112,209,0.4)] animate-pulse-glow"
                            >
                                <Trophy size={14} className="animate-bounce" />
                                {game.seasonInfo}
                            </motion.div>
                        )}

                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-6xl md:text-[100px] font-black text-white leading-[0.9] uppercase tracking-[-0.04em] drop-shadow-2xl italic"
                            style={{ textShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                        >
                            {game.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed font-light"
                        >
                            {game.description || "استمتع بتجربة ألعاب الجيل القادم مع أداء مذهل وجرافيكس استثنائي."}
                        </motion.p>

                        {/* Feature Highlights (Interactive Badges) */}
                        {game.featureHighlights && game.featureHighlights.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap gap-3 pt-6"
                            >
                                {game.featureHighlights.map((f, i) => (
                                    <div key={i} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white/80 flex items-center gap-3 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-default group">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(147,51,234,0.8)] group-hover:scale-150 transition-transform" />
                                        {f}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap gap-5 pt-8"
                    >
                        <button
                            onClick={handleAddToCart}
                            className="bg-[#0070D1] hover:bg-[#005bb5] text-white px-12 py-6 rounded-full font-black flex items-center gap-4 transition-all shadow-[0_15px_35px_rgba(0,112,209,0.5)] group active:scale-95 text-xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
                            {game.stockStatus === 'OUT_OF_STOCK' ? 'طلب مسبق الآن' : `شراء - ${game.price.toFixed(3)} ${settings.branding.currency}`}
                        </button>

                        <button className="bg-white/5 hover:bg-white/10 text-white px-10 py-6 rounded-full font-black flex items-center gap-3 transition-all border border-white/10 backdrop-blur-md active:scale-95">
                            <Info size={22} />
                            <span>التفاصيل</span>
                        </button>
                    </motion.div>
                </div>

                {/* Right Content - Floating Video Card (Battlefield Cinematic) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
                    className="lg:col-span-5 hidden lg:block perspective-1000"
                >
                    <div className="relative aspect-[4/5] bg-[#16161C] rounded-[40px] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] group rotate-y-3">
                        {trailerId ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${trailerId}&iv_load_policy=3&disablekb=1&playsinline=1`}
                                title={game.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 pointer-events-none scale-125"
                            />
                        ) : (
                            <img src={game.image} alt={game.title} className="w-full h-full object-cover p-12 opacity-80" />
                        )}

                        {/* Glass Overlay with Scanning Line */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 animate-scan pointer-events-none" />

                        {/* Info Overlays */}
                        <div className="absolute top-8 left-8">
                            <div className="px-3 py-1 bg-red-600 rounded text-[10px] font-black text-white flex items-center gap-2 animate-pulse shadow-lg">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                LIVE TRAILER
                            </div>
                        </div>

                        <div className="absolute bottom-10 inset-x-10 pointer-events-none">
                            <div className="space-y-3">
                                <div className="h-[2px] w-12 bg-[#0070D1]" />
                                <h3 className="text-2xl font-black text-white drop-shadow-lg leading-tight uppercase">
                                    {game.title}<br />
                                    <span className="text-gray-400 text-sm font-bold tracking-widest">OFFICIAL SEASON PREVIEW</span>
                                </h3>
                                <div className="flex gap-2">
                                    <div className="px-2 py-1 bg-white/10 border border-white/10 rounded text-[9px] font-black tracking-widest">4K ULTRA HD</div>
                                    <div className="px-2 py-1 bg-white/10 border border-white/10 rounded text-[9px] font-black tracking-widest">60 FPS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
