'use client';
import { useStore } from '@/context/StoreContext';
import { motion } from 'framer-motion';

export default function ScrollingMarquee() {
    const { settings } = useStore();
    const { text, enabled, speed } = settings.announcement || { text: '', enabled: false, speed: 20 };

    if (!enabled || !text) return null;

    return (
        <div className="w-full bg-primary/10 border-y border-primary/30 overflow-hidden relative h-20 flex items-center mb-0 backdrop-blur-sm z-20">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Marquee Content */}
            <div className="flex gap-20 whitespace-nowrap min-w-full">
                <motion.div
                    className="flex gap-20 items-center"
                    initial={{ x: "0%" }}
                    animate={{ x: "-100%" }}
                    transition={{
                        repeat: Infinity,
                        duration: speed || 20,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                >
                    {/* Repeats to create seamless loop */}
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-6">
                            <span className="text-3xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                {text}
                            </span>
                            <span className="text-primary text-4xl leading-none">•</span>
                        </div>
                    ))}
                </motion.div>
                <motion.div
                    className="flex gap-20 items-center"
                    initial={{ x: "0%" }}
                    animate={{ x: "-100%" }}
                    transition={{
                        repeat: Infinity,
                        duration: speed || 20,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                >
                    {/* Repeats to create seamless loop - Second set for smooth transition if needed, 
                        but normally one long strip works if calculated correctly. 
                        For 100% loop with Framer Motion, usually we duplicate content or use x: [0, -100%] logic.
                        Let's use the transform approach commonly used.
                     */}
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-6">
                            <span className="text-3xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                {text}
                            </span>
                            <span className="text-primary text-4xl leading-none">•</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
