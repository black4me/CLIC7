'use client';

import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { useStore } from '@/context/StoreContext';
import { Game } from '@/data/games';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import NewsSection from '@/components/NewsSection';
import HeroBanner from '@/components/HeroBanner';
import AnnouncementBar from '@/components/AnnouncementBar';
import ScrollingMarquee from '@/components/ScrollingMarquee';

export default function Home() {
    const { games, settings } = useStore();

    return (
        <main className="flex flex-col min-h-screen selection:bg-primary selection:text-white">
            <Navbar />

            {/* Dynamic Marquee Announcement */}
            <AnnouncementBar />

            {/* Product-Focused Hero Banner */}
            <HeroBanner />

            {/* Mega Marquee */}
            <ScrollingMarquee />

            {/* Flash Sales Section */}
            {settings.sections.flashSales && (
                <section className="py-16 px-4 relative overflow-hidden bg-gradient-to-b from-red-600/10 to-transparent border-b border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600 rounded-lg animate-pulse-glow shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                    <Zap className="text-white fill-white" size={24} />
                                </div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">عروض صاعقة (Flash Sales)</h2>
                            </div>
                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                <span className="animate-pulse">●</span>
                                عرض مؤقت
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {games.filter(g => g.isFlashSale).slice(0, 4).map((game) => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </div>
                    </div>
                </section>
            )}



            {/* Trending Section */}
            {settings.sections.trending && (
                <section className="py-20 px-4 border-b border-white/5 bg-black/40">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-end justify-between mb-12">
                            <div className="space-y-2">
                                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">What Everyone is Playing</span>
                                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">ألعاب رائجة (Trending)</h2>
                            </div>
                            <Link href="/trending" className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-all overflow-hidden px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                <span>شاهد المزيد</span>
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Logic for Trending: High Reviews/Rating or just featured */}
                            {games.filter(g => g.rating && g.rating >= 4.8).slice(0, 4).map((game) => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CATEGORY SECTIONS */}

            {/* 1. WAR / SHOOTERS */}
            <section className="py-16 px-4 relative border-b border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                            <span className="text-red-500">⚔️</span>
                            ألعاب الحروب والتصويب
                        </h2>
                        <Link href="/category/pc" className="text-sm text-primary hover:text-white transition-colors">عرض الكل</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {games.filter((g: Game) => g.genre === 'Shooter').slice(0, 4).map((game) => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. RACING */}
            <section className="py-16 px-4 relative bg-white/5 border-b border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                            <span className="text-blue-500">🏎️</span>
                            سيارات وسباقات
                        </h2>
                        <Link href="/category/ps5" className="text-sm text-primary hover:text-white transition-colors">عرض الكل</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {games.filter((g: Game) =>
                            g.title.includes('Gran') ||
                            g.title.includes('Forza') ||
                            g.title.includes('Need') ||
                            g.title.includes('F1') ||
                            g.title.includes('Crew') ||
                            g.title.includes('Assetto')
                        ).slice(0, 4).map((game) => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SURVIVAL / ADVENTURE */}
            <section className="py-16 px-4 relative border-b border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                            <span className="text-green-500">🌲</span>
                            العاب البقاء والمغامرة
                        </h2>
                        <Link href="/category/ps5" className="text-sm text-primary hover:text-white transition-colors">عرض الكل</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {games.filter((g: Game) => g.genre === 'Adventure').slice(0, 4).map((game) => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. SPORTS / FOOTBALL */}
            <section className="py-16 px-4 relative bg-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                            <span className="text-yellow-500">⚽</span>
                            كرة قدم ورياضة
                        </h2>
                        <Link href="/category/ps5" className="text-sm text-primary hover:text-white transition-colors">عرض الكل</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {games.filter((g: Game) => (
                            g.genre === 'Sports' &&
                            !g.title.includes('Gran') &&
                            !g.title.includes('Forza') &&
                            !g.title.includes('Need') &&
                            !g.title.includes('F1') &&
                            !g.title.includes('Crew') &&
                            !g.title.includes('Assetto')
                        )).slice(0, 4).map((game) => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                </div>
            </section>

            {/* News / Blog Section */}
            {settings.sections.news && <NewsSection />}
        </main>
    );
}
