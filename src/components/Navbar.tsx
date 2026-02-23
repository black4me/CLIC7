'use client';
import { ShoppingCart, User, Search, Menu, X, Gamepad2, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import RewardsModal from '@/components/RewardsModal';

export default function Navbar() {
    const { cart, settings, categories, currentUser, staff } = useStore();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isRewardsOpen, setIsRewardsOpen] = useState(false);

    // Check if user is staff
    const isStaff = staff.some(s => s.email === currentUser?.email);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0F]/80 backdrop-blur-2xl border-b border-white/5 h-20 transition-all duration-500">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">

                {/* Logo Section */}
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-2 group">
                        {settings.branding.logo ? (
                            <img
                                src={settings.branding.logo}
                                alt={settings.branding.siteName}
                                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-6 transition-all">
                                    <Gamepad2 className="text-white" size={24} />
                                </div>
                                <span className="text-2xl font-black tracking-tighter italic uppercase text-white">
                                    {settings.branding.siteName}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {categories.slice(0, 3).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors relative group py-2"
                            >
                                {cat.name.replace(' Games', '')}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                            </Link>
                        ))}
                        <Link
                            href="/subscriptions"
                            className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors relative group py-2"
                        >
                            SUB
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                        </Link>
                    </div>
                </div>

                {/* Left Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-3 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                    >
                        <Search size={22} />
                    </button>

                    {/* Loyalty Points Section */}
                    {settings.enableLoyaltySystem && (
                        currentUser ? (
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Mobile Points Badge - Clean flexbox alignment */}
                                <div className="flex md:hidden items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded-full group cursor-pointer transition-all hover:bg-primary/20 min-w-[50px]">
                                    <Star size={12} className="text-primary fill-primary group-hover:animate-pulse-gold flex-shrink-0" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{currentUser.points || 0}</span>
                                </div>
                                {/* Desktop Points Badge - Clean flexbox alignment */}
                                <div
                                    onClick={() => setIsRewardsOpen(true)}
                                    className="hidden md:flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full group cursor-pointer hover:bg-primary/20 transition-all duration-300 min-w-[80px]"
                                >
                                    <Star size={16} className="text-primary fill-primary group-hover:rotate-[360deg] transition-transform duration-700 flex-shrink-0" />
                                    <span className="text-xs font-black text-primary uppercase tracking-tighter">{currentUser.points || 0} Pts</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsRewardsOpen(true)}
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group"
                            >
                                <Star size={14} className="text-primary group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Join Rewards</span>
                            </button>
                        )
                    )}

                    {currentUser ? (
                        <Link href="/customer/dashboard">
                            <button className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/10 transition-all">
                                <User size={18} />
                                {currentUser.name}
                            </button>
                        </Link>
                    ) : (
                        <Link href="/customer/dashboard">
                            <button className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/10 transition-all">
                                <User size={18} />
                                لوحة التحكم
                            </button>
                        </Link>
                    )}

                    <Link href="/cart" className="relative p-3 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-full group">
                        <ShoppingCart size={22} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    <button className="lg:hidden p-3 text-white">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Cinematic Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#0B0B0F]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
                    >
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute top-8 right-8 p-4 text-white hover:bg-white/5 rounded-full"
                        >
                            <X size={32} />
                        </button>

                        <div className="w-full max-w-3xl space-y-8">
                            <h2 className="text-4xl font-black text-center uppercase tracking-tighter">ما الذي تبحث عنه؟</h2>
                            <div className="relative">
                                <input
                                    autoFocus
                                    placeholder="ابحث عن ألعابك المفضلة..."
                                    className="w-full bg-white/5 border-b-2 border-primary p-6 text-2xl md:text-4xl text-white outline-none font-bold"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={40} />
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Trending:</span>
                                {['Black Ops 6', 'FC 25', 'Spider-Man 2', 'Elden Ring'].map(t => (
                                    <button key={t} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:border-primary transition-all">
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Rewards Modal Integration */}
            <RewardsModal
                isOpen={isRewardsOpen}
                onClose={() => setIsRewardsOpen(false)}
            />
        </nav>
    );
}
