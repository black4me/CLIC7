'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface SecondaryNavProps {
    onBuyClick: () => void;
    price: number;
    title: string;
}

export default function SecondaryNav({ onBuyClick, price, title }: SecondaryNavProps) {
    const { settings } = useStore();
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'نظرة عامة', href: '#overview' },
        { name: 'المميزات', href: '#features' },
        { name: 'أطوار اللعب', href: '#modes' },
        { name: 'فئات الجنود', href: '#classes' },
        { name: 'تحديثات الموسم', href: '#seasons' },
    ];

    return (
        <>
            <div className={`w-full bg-[#16161C] border-b border-white/5 z-40 transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 shadow-2xl' : 'relative'}`}>
                <div className="max-w-[1600px] mx-auto px-4 lg:px-12 flex items-center justify-between h-16">
                    {/* Links - Scrollable on Mobile */}
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar mask-fade-right lg:mask-none py-2 pr-4 lg:pr-0">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap uppercase tracking-wider"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Buy Now Button - Desktop */}
                    <AnimatePresence>
                        {isSticky && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="hidden lg:flex items-center gap-6"
                            >
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{title}</p>
                                    <p className="text-md font-black text-white">{price.toFixed(3)} {settings.branding.currency}</p>
                                </div>
                                <button
                                    onClick={onBuyClick}
                                    className="bg-[#D13434] hover:bg-[#B32A2A] text-white px-8 py-3 rounded-full font-black flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(209,52,52,0.4)]"
                                >
                                    <ShoppingCart size={18} />
                                    <span>اشترِ الآن</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Sticky Footer Buy Button */}
            <AnimatePresence>
                {isSticky && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#16161C]/90 backdrop-blur-xl border-t border-white/10 lg:hidden flex items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{title}</span>
                            <span className="text-lg font-black text-white">{price.toFixed(3)} {settings.branding.currency}</span>
                        </div>
                        <button
                            onClick={onBuyClick}
                            className="bg-[#D13434] text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 active:scale-95 shadow-xl"
                        >
                            <ShoppingCart size={20} />
                            <span>شراء</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
