'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HeroBanner() {
    const { heroSlides } = useStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance slider
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    if (heroSlides.length === 0) return null;

    const slide = heroSlides[currentIndex];

    return (
        <div className="relative w-full h-[85vh] overflow-hidden border-b border-white/10 group bg-black">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    {/* Media Layer */}
                    {slide.videoUrl ? (
                        <video
                            src={slide.videoUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-60"
                        />
                    ) : (
                        <Image
                            src={slide.image || '/assets/images/placeholder.png'}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F]/90 via-[#0B0B0F]/30 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Container */}
            <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start z-10">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-3xl space-y-8"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Sparkles size={16} className="text-primary animate-pulse" />
                            <span className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                                Featured
                            </span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none uppercase tracking-tighter italic drop-shadow-2xl">
                            {slide.title}
                        </h1>

                        {/* Description/Subtitle */}
                        <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl leading-relaxed">
                            {slide.subtitle}
                        </p>

                        {/* CTA Button */}
                        <div className="pt-4">
                            <Link href={slide.ctaLink || '/games'}>
                                <button
                                    className="group relative px-10 py-5 overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(0,112,209,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(0,112,209,0.6)]"
                                    style={{ backgroundColor: slide.ctaColor || '#0070D1' }}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <div className="relative flex items-center gap-4">
                                        <span className="text-xl font-black text-white uppercase tracking-wider">Shop Now</span>
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:translate-x-2 transition-transform">
                                            <ArrowRight size={24} className="text-white" />
                                        </div>
                                    </div>
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                    <button onClick={prevSlide} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10">
                        <ChevronLeft className="text-white" />
                    </button>
                    <button onClick={nextSlide} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10">
                        <ChevronRight className="text-white" />
                    </button>
                </div>
            )}

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroSlides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-white' : 'bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    );
}
