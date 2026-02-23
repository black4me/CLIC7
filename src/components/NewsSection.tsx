'use client';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Newspaper } from 'lucide-react';
import Image from 'next/image';

export default function NewsSection() {
    const { games } = useStore();

    // Filter games that have article content
    const articles = games
        .filter(g => g.article?.headline)
        .slice(0, 3); // Get latest 3

    if (articles.length === 0) return null;

    return (
        <section className="py-20 relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-0 w-1/3 h-1/2 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black mb-4 flex items-center gap-3">
                            <Newspaper className="text-primary" />
                            جديد أخبار الألعاب
                        </h2>
                        <p className="text-gray-400 max-w-2xl">
                            تابع أحدث التسريبات، المراجعات، وتغطيات المعارض العالمية من فريقنا المختص.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map((game, i) => (
                        <Link href={`/game/${game.id}`} key={game.id} className="block group">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="cursor-pointer"
                            >
                                <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden mb-4 relative">
                                    <Image
                                        src={game.image}
                                        alt={game.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                                        {game.genre}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                    <span>{game.lastUpdated?.at ? new Date(game.lastUpdated.at).toLocaleDateString('ar-EG') : 'الآن'}</span>
                                    <span>•</span>
                                    <span>{game.lastUpdated?.by || 'Admin'}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {game.article?.headline}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-2">
                                    {game.article?.introText}
                                </p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
