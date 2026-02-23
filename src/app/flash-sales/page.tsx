'use client';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { useStore } from '@/context/StoreContext';
import { Zap, Timer } from 'lucide-react';

export default function FlashSalesPage() {
    const { games } = useStore();
    const flashGames = games.filter(g => g.isFlashSale);

    return (
        <main className="min-h-screen bg-background text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-yellow-400">
                            <Zap className="w-10 h-10 fill-yellow-400" />
                            عروض فلاش
                        </h1>
                        <p className="text-gray-400">تنتهي العروض خلال:</p>
                    </div>

                    {/* Countdown Timer Mock */}
                    <div className="flex items-center gap-4 text-2xl font-mono font-bold text-white bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                        <Timer className="text-primary animate-spin-slow" />
                        <span>02</span>:<span>45</span>:<span>12</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {flashGames.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            </div>
        </main>
    );
}
