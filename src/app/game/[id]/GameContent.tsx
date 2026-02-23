'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useStore } from '@/context/StoreContext';
import { Game } from '@/data/games';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Play, Globe, CheckCircle, Users, BookOpen, Clock, Heart, Share2, ArrowRight, Image as ImageIcon, Monitor, Gamepad2, Laptop, ShieldCheck, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import Reviews from '@/components/Reviews';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop';

const isValidUrl = (url: string | undefined): string => {
    if (!url) return PLACEHOLDER_IMAGE;
    if (url.startsWith('/') || url.startsWith('http')) {
        try {
            if (url.startsWith('/')) return url;
            new URL(url);
            return url;
        } catch (e) {
            console.warn('Invalid URL detected:', url);
            return PLACEHOLDER_IMAGE;
        }
    }
    return PLACEHOLDER_IMAGE;
};

export default function GameContent({ id }: { id: string }) {
    const { addToCart, cart, games } = useStore();
    const [inCart, setInCart] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<'PC' | 'PS5' | 'Xbox'>('PC');

    // Find the game from the store using the ID
    const game = games.find(g => g.id === id || g.slug === id);

    // Smart Recommendations: Filter by genre, exclude current game
    const similarGames = game
        ? games.filter(g => g.genre === game.genre && g.id !== game.id).slice(0, 3)
        : [];

    useEffect(() => {
        if (game) {
            setInCart(cart.some((item) => item.id === game.id));
            if (game.platform) setSelectedPlatform(game.platform);

            // Klaviyo Tracking: Viewed Product
            if ((window as any)._learnq) {
                (window as any)._learnq.push(['track', 'Viewed Product', {
                    ProductName: game.title,
                    ProductID: game.id,
                    Price: game.price,
                    ImageURL: game.image,
                    URL: window.location.href,
                    Brand: 'CLIC7',
                    Categories: [game.genre]
                }]);
            }
        }
    }, [cart, game, id]);

    const handleAddToCart = () => {
        if (game) {
            addToCart({ ...game, platform: selectedPlatform }); // Add specific platform variant if logic supported
            setInCart(true);
        }
    };

    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
    const heroTextY = useTransform(scrollY, [0, 500], [0, 100]);

    if (!game) {
        return (
            <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">404</h1>
                    <p className="text-gray-400">Game not found</p>
                    <Link href="/" className="text-primary hover:text-white mt-4 block">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#050507] text-white selection:bg-primary selection:text-white pb-32">
            <Navbar />

            {/* --- HERO SECTION (Battlefield Style) --- */}
            <div className="relative h-screen w-full overflow-hidden flex items-end justify-center pb-32 md:pb-24">
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={isValidUrl(game.heroImage || game.image)}
                        alt={game.title}
                        fill
                        className="object-cover"
                        priority
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = PLACEHOLDER_IMAGE;
                        }}
                    />
                    {/* Cinematic Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050507]" />
                </motion.div>

                <motion.div
                    style={{ y: heroTextY }}
                    className="relative z-10 text-center max-w-5xl px-4 flex flex-col items-center"
                >
                    {/* Meta Tags */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <span className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full font-bold text-xs tracking-[0.2em] uppercase">
                            {game.genre}
                        </span>
                        {game.releaseDate && (
                            <span className="bg-primary/20 backdrop-blur-md border border-primary/30 text-primary px-4 py-1.5 rounded-full font-bold text-xs tracking-[0.2em] uppercase">
                                {game.releaseDate}
                            </span>
                        )}
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
                        className="text-6xl md:text-9xl font-black mb-6 leading-[0.9] tracking-tighter uppercase drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400"
                    >
                        {game.heroHeadline || game.title}
                    </motion.h1>

                    {/* Sub Headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl md:text-3xl font-medium text-gray-200 max-w-3xl mb-12 shadow-black drop-shadow-lg"
                    >
                        {game.heroSubHeadline || game.description?.slice(0, 100)}
                    </motion.p>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/50"
                >
                    <ChevronRight className="rotate-90" size={32} />
                </motion.div>
            </div>


            <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 relative -mt-32 z-20">

                {/* --- LEFT CONTENT (Video & Details) --- */}
                <div className="lg:col-span-8 space-y-16">

                    {/* VIDEO BANNER BLOCK */}
                    {/* VIDEO BANNER BLOCK */}
                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                        {/* If we want to show a video player directly */}
                        <div className="aspect-video relative">
                            {(game.trailerUrl || game.videoUrl) ? (
                                <VideoPlayer
                                    src={game.trailerUrl || game.videoUrl || ''}
                                    poster={game.videoCover || game.heroImage || game.image}
                                    controls={true}
                                    autoPlay={false} // User can play it
                                    muted={false}
                                />
                            ) : (
                                <div className="w-full h-full relative">
                                    <Image
                                        src={isValidUrl(game.videoCover || game.heroImage || game.image)}
                                        alt="Video Cover"
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = PLACEHOLDER_IMAGE;
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/50 p-4 rounded-full text-white/50 backdrop-blur-sm">
                                            <Play size={32} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SHORT DESCRIPTION */}
                    <div className="prose prose-invert prose-xl max-w-none text-gray-300 font-light leading-relaxed">
                        <p>{game.description}</p>
                    </div>

                    {/* FEATURE HIGHLIGHTS */}
                    {game.featureHighlights && game.featureHighlights.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {game.featureHighlights.map((feat, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start gap-4 hover:bg-white/10 transition-colors">
                                    <div className="p-3 bg-primary/20 rounded-xl text-primary">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Coming Feature {i + 1}</h4>
                                        <p className="text-gray-400 text-sm">{feat}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ACTIVATION STEPS */}
                    {game.activationSteps && game.activationSteps.length > 0 && (
                        <div className="pt-12 border-t border-white/5">
                            <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                                <ShieldCheck className="text-green-500" size={32} />
                                How to Activate
                            </h2>
                            <div className="space-y-4">
                                {game.activationSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-6 items-center bg-[#111] p-6 rounded-2xl border border-white/5">
                                        <span className="text-4xl font-black text-white/10 w-12 text-center">{idx + 1}</span>
                                        <p className="text-lg font-medium text-gray-300">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ARTICLES SECTION */}
                    <div className="pt-12 border-t border-white/5">
                        <h2 className="text-3xl font-black mb-8">Related News</h2>
                        <div className="bg-[#111] rounded-3xl p-12 text-center border border-dashed border-white/10 text-gray-500">
                            Upcoming articles for {game.title} will appear here.
                        </div>
                    </div>

                    {/* REVIEWS SECTION */}
                    <Reviews />

                </div>


                {/* --- RIGHT SIDEBAR (Digital Sales Block) --- */}
                <div className="lg:col-span-4 h-fit sticky top-8">
                    {/* ... (Sidebar Content) ... */}
                    <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                        {/* Ambient Glow */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

                        {/* PRICE & DISCOUNT */}
                        <div className="flex items-end gap-3 mb-6">
                            <div className="text-5xl font-black text-white">{game.price.toFixed(3)} <span className="text-lg font-bold text-gray-400">OMR</span></div>
                            {game.originalPrice && (
                                <div className="text-xl text-gray-500 line-through mb-2">{game.originalPrice}</div>
                            )}
                        </div>

                        {/* INSTANT DELIVERY BADGE */}
                        <div className="flex items-center gap-2 text-green-400 bg-green-900/20 w-fit px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-green-500/20">
                            <Zap size={14} fill="currentColor" /> Instant Digital Delivery
                        </div>

                        {/* PLATFORM SELECTOR */}
                        <div className="mb-8 space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Platform</label>
                            <div className="grid grid-cols-3 gap-2">
                                {game.availablePlatforms?.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPlatform(p)}
                                        className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${selectedPlatform === p
                                            ? 'bg-white text-black border-white shadow-lg scale-105'
                                            : 'bg-black/40 text-gray-500 border-white/5 hover:bg-white/5'}`}
                                    >
                                        {p === 'PC' && <Monitor size={20} />}
                                        {p === 'PS5' && <Gamepad2 size={20} />}
                                        {p === 'Xbox' && <Laptop size={20} />}
                                        <span className="text-xs font-black mt-1">{p}</span>
                                    </button>
                                )) || (
                                        // Fallback if no availablePlatforms defined
                                        <button className="bg-white text-black py-4 rounded-xl font-bold flex flex-col items-center">
                                            <Gamepad2 size={24} />
                                            <span>Standard</span>
                                        </button>
                                    )}
                            </div>
                        </div>

                        {/* BUY BUTTON */}
                        <button
                            onClick={handleAddToCart}
                            disabled={inCart}
                            className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${inCart
                                ? 'bg-green-600 text-white'
                                : 'bg-primary text-white hover:bg-primary-dark shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)]'}`}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {inCart ? <CheckCircle /> : <ShoppingCart />}
                                {inCart ? 'IN LIBRARY' : 'ADD TO CART'}
                            </span>
                            {!inCart && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                        </button>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">Secure checkout via <span className="text-white font-bold">Thawani Pay</span></p>
                        </div>

                    </div>
                </div>

            </div>

        </main>
    );
}

// Helper icon
function Zap({ size, fill }: { size: number, fill?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
}
