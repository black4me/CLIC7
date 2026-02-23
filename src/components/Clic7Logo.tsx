'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Clic7Logo() {
    return (
        <motion.div
            whileHover={{ scale: 1.05, filter: "drop-shadow(0 0 15px #8A2BE2)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="cursor-pointer flex items-center gap-2 group"
        >
            <div className="relative">
                {/* Breathing Glow Effect */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#8A2BE2] blur-xl rounded-full opacity-50"
                />

                {/* Logo Container (Shield-like Vibe via styling) */}
                <div className="relative bg-[#0D0D0D] border-2 border-[#8A2BE2] px-3 py-1 rounded-xl shadow-lg flex items-center justify-center z-10 overflow-hidden">
                    {/* Glossy Reflection */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    <span className="text-white font-black text-2xl tracking-tighter relative z-20">CLIC</span>
                    <span className="text-[#8A2BE2] font-black text-3xl italic relative z-20 ml-0.5 text-shadow-neon">7</span>
                </div>
            </div>
        </motion.div>
    );
}
