'use client';

import { useState, use } from 'react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { useStore } from '@/context/StoreContext';
import { Game } from '@/data/games';
import { Gamepad2, Filter, Layers, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryHero from '@/components/CategoryHero';
import Link from 'next/link';

export default function DynamicCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { games, categories } = useStore();
    const [filter, setFilter] = useState('All');

    // Find Category Info from Store
    const category = categories.find(c => c.slug === slug);

    // --- STRICT FILTERING LOGIC ---
    // 1. Platform Check (ps5, xbox, pc)
    // 2. Genre Check (shooter, rpg, etc)
    // 3. Tag Check (war, football, etc)

    const normalizedSlug = slug.toLowerCase();

    // Helper: Is this a platform slug?
    const isPlatform = ['ps5', 'xbox', 'pc'].includes(normalizedSlug);

    // Filter Games STRICTLY
    const categoryGames = games.filter(g => {
        // Platform Match
        if (isPlatform) {
            return g.platform.toLowerCase() === normalizedSlug || g.availablePlatforms?.some(p => p.toLowerCase() === normalizedSlug);
        }

        // Flash Sales Special Case
        if (normalizedSlug === 'flash-sales') {
            return g.isFlashSale;
        }

        // Genre Match (Strict)
        if (g.genre.toLowerCase() === normalizedSlug) {
            return true;
        }

        // Tag Match (Strict) - New 'tags' field
        if (g.tags && g.tags.some(t => t.toLowerCase() === normalizedSlug)) {
            return true;
        }

        return false;
    });

    const filteredGames = filter === 'All' ? categoryGames : categoryGames.filter((g: Game) => g.genre === filter);

    const featuredGame = categoryGames.find((g: Game) => g.isFlashSale || g.rating === 5) || categoryGames[0];
    const genres = ['All', 'Action', 'Shooter', 'Adventure', 'Sports', 'RPG'];

    return (
        <main className="min-h-screen bg-background text-white pb-20">
            <Navbar />

            {featuredGame ? (
                <CategoryHero
                    game={featuredGame}
                    categoryTitle={category?.name || slug.toUpperCase()}
                    categorySubtitle={`تصفح أفضل ألعاب ${category?.name || slug}`}
                    categoryIcon={<Gamepad2 className="w-8 h-8" />}
                />
            ) : (
                <div className="pt-32 pb-10 text-center bg-white/5 border-b border-white/5">
                    <h1 className="text-4xl font-bold mb-4 uppercase">{category?.name || slug}</h1>
                    <p className="text-gray-400">استكشف مجموعتنا المتميزة</p>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-black mb-2">المكتبة المختارة</h2>
                        <p className="text-gray-400">عدد الألعاب المتوفرة: {categoryGames.length}</p>
                    </div>

                    {categoryGames.length > 0 && (
                        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl overflow-x-auto max-w-full border border-white/5">
                            <Filter size={18} className="text-gray-400 ml-3" />
                            {genres.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => setFilter(genre)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === genre ? 'bg-[#0070D1] text-white shadow-lg shadow-[#0070D1]/20' : 'hover:bg-white/10 text-gray-400'}`}
                                >
                                    {genre === 'All' ? 'الكل' : genre}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredGames.map((game: Game) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                key={game.id}
                            >
                                <GameCard game={game} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {categoryGames.length === 0 && (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center border border-white/5 rounded-3xl bg-white/5 p-10">
                        <ShieldAlert size={64} className="mb-6 opacity-50 text-yellow-500" />
                        <h3 className="text-2xl font-bold text-white mb-2">لا توجد ألعاب في هذا التصنيف</h3>
                        <p className="text-sm mt-2 max-w-md mx-auto leading-relaxed">
                            لم نعثر على أي ألعاب تطابق "{slug}". قد يكون التصنيف جديداً أو لا توجد ألعاب مرتبطة به حالياً.
                        </p>
                        <Link href="/games">
                            <button className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/80 transition-all">
                                تصفح كل الألعاب
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
