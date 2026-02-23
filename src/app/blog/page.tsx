'use client';
import Navbar from '@/components/Navbar';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Layers } from 'lucide-react';
import Image from 'next/image';

export default function BlogPage() {
    const { games } = useStore();

    // Filter games that have article content
    const articles = games.filter(g => g.article?.headline);

    return (
        <main className="min-h-screen bg-background text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-black mb-8 border-r-4 border-primary pr-4">أحدث الأخبار والمقالات</h1>

                {articles.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Layers size={48} className="mx-auto mb-4 opacity-20" />
                        <p>لا توجد مقالات منشورة حالياً</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((game, i) => (
                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={game.id}
                                className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all group"
                            >
                                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                    <Image
                                        src={game.image}
                                        alt={game.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {game.genre}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {game.lastUpdated?.at ? new Date(game.lastUpdated.at).toLocaleDateString('ar-EG') : 'الآن'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User size={12} />
                                            {game.lastUpdated?.by || 'Admin'}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {game.article?.headline}
                                    </h2>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                                        {game.article?.introText}
                                    </p>

                                    <Link href={`/game/${game.id}`} className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
                                        اقرأ المزيد <ArrowLeft size={16} />
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
