'use client';

import Navbar from '@/components/Navbar';
import Reviews from '@/components/Reviews';
import { ShoppingCart, Heart, ShieldCheck, Clock, Monitor, Gamepad2, Laptop, CheckCircle, Zap, Share2, PlayCircle, Bell, Info, Play, Youtube } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import PreOrderModal from '@/components/PreOrderModal';
import { getYouTubeID } from '@/utils/youtube';
import SecondaryNav from '@/components/SecondaryNav';
import SeasonGrid from '@/components/SeasonGrid';
import StoreSection from '@/components/StoreSection';
import HardwareExclusives from '@/components/HardwareExclusives';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
interface GameDetailsProps {
    id: string;
}

export default function GameDetails({ id }: GameDetailsProps) {
    const { games, addToCart, settings } = useStore();
    const game = games.find((g) => g.id === id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);

    useEffect(() => {
        if (game) {
            document.title = `${game.title} - CLIC7`;

            // Klaviyo Tracking: Viewed Product
            if ((window as any)._learnq) {
                (window as any)._learnq.push(['track', 'Viewed Product', {
                    ProductName: game.title,
                    ProductID: game.id,
                    Price: game.price,
                    ImageURL: game.image,
                    Brand: 'CLIC7',
                    Categories: [game.genre]
                }]);
            }
        }
    }, [game]);

    const router = useRouter();

    const handleAddToCart = () => {
        if (!game) return;
        addToCart(game);
        toast.success(`تم إضافة ${game.title} إلى السلة`, {
            style: {
                background: '#1A1A1A',
                color: '#fff',
                border: '1px solid #333'
            }
        });
        router.push('/checkout');
    };

    if (!game) {
        return (
            <div className="min-h-screen bg-background text-white">
                <Navbar />
                <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-gray-400">لم يتم العثور على اللعبة المطلوبة</p>
                    <Link href="/games" className="text-primary hover:underline">تصفح جميع الألعاب</Link>
                </div>
            </div>
        );
    }

    const cinematicVideoId = getYouTubeID(game.trailerVideoUrl || game.videoUrl || '');

    const platformIcons = {
        'PC': Monitor,
        'PS5': Gamepad2,
        'Xbox': Laptop
    };

    return (
        <main className="min-h-screen bg-[#0B0B0F] pb-20 text-white selection:bg-primary selection:text-white">
            <Navbar />

            <SecondaryNav
                onBuyClick={handleAddToCart}
                price={game.price}
                title={game.title}
            />

            {/* PlayStation-Style Split Layout */}
            <div className="max-w-[1600px] mx-auto pt-8 px-4 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT SIDE: Media & Content (8 Columns) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Cinematic Header / Main Trailer Fixing */}
                        <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 group bg-[#16161C]">
                            <AnimatePresence mode="wait">
                                {!isPlaying ? (
                                    <motion.div
                                        key="thumbnail"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative w-full h-full cursor-pointer overflow-hidden"
                                        onClick={() => setIsPlaying(true)}
                                    >
                                        <Image
                                            src={game.image}
                                            alt={game.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                                        {/* Cinematic Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-primary transition-all duration-500 group-hover:scale-110 shadow-2xl">
                                                <Play size={32} className="text-white fill-current ml-1" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-8 right-8 text-right">
                                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                                Watch Trailer
                                            </div>
                                            <h4 className="text-2xl font-black italic uppercase italic text-white tracking-tighter">BATTLEFIELD 6: OFFICIAL REVEAL</h4>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="video"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-full h-full bg-black flex items-center justify-center border border-white/5 rounded-3xl"
                                    >
                                        {cinematicVideoId ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${cinematicVideoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                                                title={game.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-gray-500">
                                                <Youtube size={64} />
                                                <p className="font-bold">عذراً، الفيديو غير متوفر حالياً</p>
                                                <button
                                                    onClick={() => setIsPlaying(false)}
                                                    className="text-primary hover:underline font-bold"
                                                >
                                                    الرجوع للمعرض
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Title & Badges */}
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex gap-2">
                                    {(game.availablePlatforms || [game.platform]).map((p) => {
                                        const Icon = platformIcons[p as keyof typeof platformIcons] || Monitor;
                                        return (
                                            <span key={p} className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase backdrop-blur-md border border-white/5 flex items-center gap-2">
                                                <Icon size={12} />
                                                {p}
                                            </span>
                                        );
                                    })}
                                </div>
                                <span className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded text-xs font-bold">
                                    {game.genre}
                                </span>
                            </div>

                            {/* Season Info Badge - PlayStation Style */}
                            {game.seasonInfo && (
                                <div className="inline-flex items-center gap-2 py-1 px-3 bg-[#0070D1]/20 border border-[#0070D1]/30 rounded-full text-[#3192FF] text-[10px] font-black uppercase tracking-wider mb-4">
                                    <div className="w-1.5 h-1.5 bg-[#3192FF] rounded-full animate-pulse" />
                                    {game.seasonInfo}
                                </div>
                            )}

                            <h1 className="text-5xl md:text-8xl font-black mb-6 leading-[0.9] uppercase tracking-tighter italic drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                {game.title === 'Battlefield 6' ? (
                                    <>
                                        التحديثات الموسمية في<br />
                                        <span className="text-[#D13434]">BATTLEFIELD</span>
                                    </>
                                ) : game.title}
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed font-medium max-w-4xl">
                                {game.description}
                            </p>
                        </div>

                        {/* Features Highlights Grid (Dynamic from Form) */}
                        {game.featureHighlights && game.featureHighlights.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-white/10">
                                {game.featureHighlights.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <CheckCircle size={20} />
                                        </div>
                                        <span className="font-bold text-gray-200">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Standard Features (Fallback) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: ShieldCheck, text: 'ضمان مفعول آمن 100%', color: 'text-green-400' },
                                { icon: Clock, text: 'تسليم فوري (Email)', color: 'text-blue-400' },
                                { icon: Zap, text: 'دعم فني 24/7', color: 'text-yellow-400' }
                            ].map((f, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-6 bg-black/40 rounded-2xl border border-white/5">
                                    <f.icon className={`${f.color} mb-3`} size={24} />
                                    <span className="text-xs font-bold text-gray-400">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <Reviews />
                    </div>

                    {/* RIGHT SIDE: Sticky Purchase Box (4 Columns) */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-28">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#15151A] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group"
                            >
                                {/* Glass Effect Background */}
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm transition-opacity group-hover:opacity-80" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h3 className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">السعر النهائي</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl font-black font-mono tracking-tighter text-white">
                                                    {game.price.toFixed(3)}
                                                </span>
                                                <span className="text-sm font-black text-gray-500">{settings.branding.currency}</span>
                                            </div>
                                        </div>
                                        {game.isFlashSale && (
                                            <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)] tracking-widest">
                                                HOT DEAL
                                            </div>
                                        )}
                                    </div>

                                    {game.originalPrice && game.originalPrice > game.price && (
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-8 pb-8 border-b border-white/10 italic">
                                            <span>وفر حتي {(((game.originalPrice - game.price) / game.originalPrice) * 100).toFixed(0)}%</span>
                                            <span className="line-through decoration-red-600 font-mono">{game.originalPrice.toFixed(3)} {settings.branding.currency}</span>
                                        </div>
                                    )}

                                    {game.stockStatus === 'IN_STOCK' || !game.stockStatus ? (
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full bg-[#0070D1] hover:bg-[#005bb5] text-white font-black text-xl py-5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(0,112,209,0.4)] hover:shadow-[0_0_50px_rgba(0,112,209,0.6)] flex items-center justify-center gap-3 transform active:scale-95 mb-4"
                                        >
                                            <ShoppingCart size={24} className="fill-current" />
                                            شراء الآن
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsPreOrderOpen(true)}
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xl py-5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] flex items-center justify-center gap-3 transform active:scale-95 mb-4"
                                        >
                                            <Bell size={24} className="fill-current" />
                                            {game.stockStatus === 'OUT_OF_STOCK' ? 'طلب مسبق (Pre-Order)' : 'تنبيه التوفر'}
                                        </button>
                                    )}

                                    <PreOrderModal
                                        isOpen={isPreOrderOpen}
                                        onClose={() => setIsPreOrderOpen(false)}
                                        game={game}
                                    />

                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        <button className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-2 border border-white/5">
                                            <Heart size={16} />
                                            قائمة الأمنيات
                                        </button>
                                        <button className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-2 border border-white/5">
                                            <Share2 size={16} />
                                            مشاركة المنتج
                                        </button>
                                    </div>

                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                        <Link href="/support" className="flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Info size={14} />
                                                <span>تحتاج مساعدة؟ تواصل معنا</span>
                                            </div>
                                            <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>

            {/* New PlayStation Store Sections */}
            <SeasonGrid game={game} />
            <StoreSection game={game} />
            <HardwareExclusives game={game} />
        </main>
    );
}
