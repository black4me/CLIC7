'use client';
import { useStore } from '@/context/StoreContext';
import { motion } from 'framer-motion';
import { AlertTriangle, Megaphone } from 'lucide-react';

export default function AnnouncementBar() {
    const { settings } = useStore();
    const { text, enabled, speed } = settings.announcement || { text: '', enabled: false, speed: 20 };

    if (!enabled || !text) return null;

    return (
        <div className="bg-purple-900/10 border-y border-purple-500/30 overflow-hidden relative h-10 flex items-center shadow-[0_0_20px_rgba(138,43,226,0.15)] bg-[url('/assets/noise.png')]">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Left/Right Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0B0B0F] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0B0B0F] to-transparent z-10" />

            {/* Marquee Content */}
            <div className="flex gap-12 whitespace-nowrap min-w-full">
                <motion.div
                    className="flex gap-12 items-center"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        duration: speed || 20,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                >
                    {/* Repeats to create seamless loop */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-purple-400">
                                <Megaphone size={16} className="animate-pulse" />
                            </span>
                            <span className="text-white font-bold text-sm tracking-wide neon-text-subtle">
                                {text}
                            </span>
                            <span className="text-cyan-400/50 mx-4">•</span>
                        </div>
                    ))}
                </motion.div>

                {/* Duplicate for seamlessness if needed, though simpler motion usually works */}
            </div>

            {/* Styling injection for neon text if not global */}
            <style jsx>{`
                .neon-text-subtle {
                    text-shadow: 0 0 5px rgba(138, 43, 226, 0.5);
                }
             `}</style>
        </div>
    );
}
