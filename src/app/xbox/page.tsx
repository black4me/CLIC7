'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { useStore } from '@/context/StoreContext';
import { Game } from '@/data/games';
import { Laptop, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryHero from '@/components/CategoryHero';


export default function XboxPage() {
    const { games } = useStore();
    const [filter, setFilter] = useState('All');

    const xboxGames = games.filter((g: Game) =>
        (g.platform === 'Xbox' || g.availablePlatforms?.includes('Xbox')) &&
        g.category === 'game'
    );
    const filteredGames = filter === 'All' ? xboxGames : xboxGames.filter((g: Game) => g.genre === filter);

    const featuredGame = xboxGames.find(g => g.id === 'cod-bo6') || xboxGames[0];
    const genres = ['All', 'Action', 'Shooter', 'Adventure', 'Sports'];

    return (
        <main className="min-h-screen bg-background text-white pb-20">
            <Navbar />

            {featuredGame && (
                <CategoryHero
                    game={featuredGame}
                    categoryTitle="Xbox Games"
                    categorySubtitle="أفضل التجارب الرقمية لجهاز Xbox"
                    categoryIcon={<Laptop className="w-8 h-8" />}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-black mb-2">مكتبة Xbox</h2>
                        <p className="text-gray-400">أكثر من {xboxGames.length} لعبة جاهزة للتحميل</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl overflow-x-auto max-w-full border border-white/5">
                        <Filter size={18} className="text-gray-400 ml-3" />
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setFilter(genre)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === genre ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/10 text-gray-400'}`}
                            >
                                {genre === 'All' ? 'الكل' : genre}
                            </button>
                        ))}
                    </div>
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

                {filteredGames.length === 0 && (
                    <div className="text-center py-20 text-gray-500">لا توجد ألعاب Xbox حالياً</div>
                )}
            </div>
        </main>
    );
}
