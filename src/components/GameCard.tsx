'use client';
import { Game } from '@/data/games';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { toast } from 'sonner';
import { getYouTubeID } from '@/utils/youtube';
import { useRouter } from 'next/navigation';

export default function GameCard({ game }: { game: Game }) {
    const { addToCart, settings } = useStore();
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    // Detect Mobile & Setup Intersection Observer
    useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && window.innerWidth < 768) {
                        setIsPlaying(true);
                    } else if (!entry.isIntersecting && window.innerWidth < 768) {
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (cardRef.current) observer.observe(cardRef.current);

        return () => {
            window.removeEventListener('resize', checkMobile);
            observer.disconnect();
        };
    }, []);

    const handleMouseEnter = () => {
        if (!game.videoUrl || isMobileView) return;
        setIsHovered(true);
        setIsLoading(true);
        hoverTimeout.current = setTimeout(() => {
            setIsPlaying(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (isMobileView) return;
        setIsHovered(false);
        setIsPlaying(false);
        setIsLoading(false);
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };

    const handleVideoLoad = () => {
        setIsLoading(false);
    };

    const handleQuickBuy = (e: React.MouseEvent) => {
        if (game.stockStatus === 'OUT_OF_STOCK') return;
        e.preventDefault();
        e.stopPropagation();
        addToCart(game);
        toast.success(`تم إضافة ${game.title} إلى السلة`, {
            style: { background: '#1A1A1A', color: '#fff', border: '1px solid #333' }
        });
        router.push('/checkout');
    };

    const videoId = getYouTubeID(game.videoUrl || '');

    return (
        <Link href={`/game/${game.id}`}>
            <motion.div
                ref={cardRef}
                initial="initial"
                whileHover="hover"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="bg-[#15151A] rounded-[15px] overflow-hidden border border-white/5 group relative cursor-pointer h-full flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_var(--primary-color)]"
            >
                {/* Image / Video Container */}
                <div className="relative h-[280px] overflow-hidden rounded-t-[15px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#15151A] via-transparent to-transparent z-10 opacity-60 pointer-events-none" />

                    {/* Video Player Overlay */}
                    <AnimatePresence>
                        {((isHovered && isPlaying) || (isMobileView && isPlaying)) && videoId && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex items-center justify-center bg-black"
                            >
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`}
                                    title={game.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    className="w-full h-full object-cover pointer-events-none fade-in duration-700 scale-[1.35]"
                                    onLoad={handleVideoLoad}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Static Image (Always rendered behind for fallback) */}
                    <motion.div
                        variants={{
                            initial: { scale: 1 },
                            hover: { scale: 1.1 }
                        }}
                        transition={{ duration: 0.6 }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={game.image}
                            alt={game.title}
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    {game.isFlashSale && (
                        <div className="absolute top-3 right-3 z-30 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-sm tracking-wider animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                            SALE
                        </div>
                    )}

                    {/* Stock Status Badges */}
                    {game.stockStatus === 'OUT_OF_STOCK' && (
                        <div className="absolute top-3 left-3 z-30 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-sm tracking-wider shadow-[0_0_15px_var(--primary-color)] animate-pulse-glow">
                            طلب مسبق
                        </div>
                    )}

                    {/* Hover Overlay with Slide-Up Button */}
                    <motion.div
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            hover: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-x-0 bottom-0 z-30 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center justify-end h-1/2 pointer-events-none"
                    >
                        <button
                            onClick={handleQuickBuy}
                            className={`w-full font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 pointer-events-auto ${game.stockStatus === 'OUT_OF_STOCK'
                                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                : 'bg-primary hover:bg-white hover:text-primary text-white'
                                }`}
                        >
                            <ShoppingCart size={18} />
                            <span>{game.stockStatus === 'OUT_OF_STOCK' ? 'طلب مسبق' : 'شراء مباشر'}</span>
                        </button>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow relative bg-[#15151A]">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider bg-primary/5">
                            {game.platform}
                        </span>
                        {game.rating && (
                            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                ★ {game.rating}
                            </div>
                        )}
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-1 text-white group-hover:text-primary transition-colors duration-300">
                        {game.title}
                    </h3>

                    <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                            {game.originalPrice && (
                                <span className="text-xs text-gray-500 line-through mb-0.5 font-mono">{game.originalPrice.toFixed(3)}</span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className="text-white font-black text-xl font-mono tracking-tight">
                                    {game.price.toFixed(3)}
                                </span>
                                <span className="text-[10px] font-normal text-gray-400">{settings.branding.currency}</span>
                            </div>
                        </div>

                        {/* Discount Badge */}
                        {game.originalPrice && (
                            <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                                {(((game.originalPrice - game.price) / game.originalPrice) * 100).toFixed(0)}% OFF
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
