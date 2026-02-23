'use client';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { useStore } from '@/context/StoreContext';
import { Flame } from 'lucide-react';

export default function TrendingPage() {
    const { games } = useStore();
    const trendingGames = games.filter(g => (g.reviewsCount || 0) > 1000 || (g.rating || 0) >= 4.8);

    return (
        <main className="min-h-screen bg-background text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-primary">
                    <Flame className="w-10 h-10 animate-pulse" />
                    الأكثر مبيعاً
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {trendingGames.map((game) => (
                        <div key={game.id} className="relative">
                            <div className="absolute -top-4 -right-4 z-20 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/50 animate-bounce">
                                الأكثر طلباً 🔥
                            </div>
                            <GameCard game={game} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
