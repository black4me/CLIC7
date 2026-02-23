'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import VideoPlayer from '@/components/VideoPlayer';

export default function HeroSlider() {
    const { heroSlides } = useStore();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-play setup
    useEffect(() => {
        if (isPaused || heroSlides.length === 0) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaused, heroSlides.length]);

    // Handlers
    const nextSlide = () => setCurrent((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    if (heroSlides.length === 0) return null;

    // Sort slides by order if available
    const sortedSlides = [...heroSlides].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentSlide = sortedSlides[current];

    return (
        <div
            className="relative w-full h-[85vh] overflow-hidden group border-b border-white/10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {/* Background: Video or Image */}
                    <div className="absolute inset-0 z-0">
                        {currentSlide.videoUrl ? (
                            <VideoPlayer
                                src={currentSlide.videoUrl}
                                poster={currentSlide.image}
                                className="opacity-60"
                                autoPlay={true}
                                muted={true}
                                loop={true}
                            />
                        ) : (
                            <Image
                                src={currentSlide.image}
                                alt={currentSlide.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        )}

                        {/* Overlay Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
                    </div>
                    {/* Content */}
                    <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16 lg:px-24">
                        <div className="max-w-2xl space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <span className="text-white/60 font-mono text-sm tracking-widest uppercase">Featured Release</span>
                                <div className="h-[1px] w-12 bg-primary/40" />
                            </motion.div>

                            <motion.h1
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase italic"
                                style={{ textShadow: `0 0 50px ${currentSlide.ctaColor || currentSlide.color}80` }}
                            >
                                {currentSlide.title}
                            </motion.h1>

                            <motion.p
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="text-xl md:text-2xl text-gray-200/90 font-medium max-w-xl leading-relaxed"
                            >
                                {currentSlide.subtitle}
                            </motion.p>

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                                className="pt-4"
                            >
                                <Link href={currentSlide.ctaLink}>
                                    <button
                                        className="text-white px-12 py-5 rounded-full font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-xl group flex items-center gap-3 relative overflow-hidden"
                                        style={{
                                            backgroundColor: currentSlide.ctaColor || currentSlide.color,
                                            boxShadow: `0 10px 40px -10px ${currentSlide.ctaColor || currentSlide.color}CC`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        اكتشف المزيد
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-8 bottom-12 p-4 bg-white/5 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 transition-all active:scale-95 hidden md:flex"
            >
                <ChevronRight size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute left-24 bottom-12 p-4 bg-white/5 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 transition-all active:scale-95 hidden md:flex"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-12 right-12 flex gap-3">
                {sortedSlides.map((slide, idx) => (
                    <button
                        key={slide.id}
                        onClick={() => setCurrent(idx)}
                        className={`h-1.5 transition-all duration-300 rounded-full ${idx === current ? 'w-12 shadow-lg' : 'w-4 bg-white/20'}`}
                        style={{ backgroundColor: idx === current ? (slide.ctaColor || slide.color) : undefined }}
                    />
                ))}
            </div>
        </div>
    );
}
