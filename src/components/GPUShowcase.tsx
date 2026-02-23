'use client';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import { Cpu, Zap, Thermometer, Activity } from 'lucide-react';
import Image from 'next/image';

export default function GPUShowcase() {
    const [isHovered, setIsHovered] = useState(false);
    const [has3DSupport, setHas3DSupport] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Mouse tracking for 3D tilt effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
    const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

    // Check for 3D support and initialize
    useEffect(() => {
        try {
            // Check if CSS 3D transforms are supported
            const testEl = document.createElement('div');
            testEl.style.transform = 'translate3d(0,0,0)';
            const support = testEl.style.transform !== '';
            setHas3DSupport(support);
            setIsLoading(false);
        } catch (error) {
            setHas3DSupport(false);
            setHasError(true);
            setIsLoading(false);
        }

        return () => {
            // Cleanup motion values
            mouseX.destroy();
            mouseY.destroy();
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
    };

    // Fallback static GPU image
    const FallbackGPU = () => (
        <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
            <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                    <Cpu className="text-purple-500 mx-auto" size={64} />
                    <h3 className="text-2xl font-black text-white">RTX 4090</h3>
                    <p className="text-sm text-gray-400">Ultimate Performance GPU</p>
                </div>
            </div>
        </div>
    );

    return (
        <section className="relative py-16 md:py-32 px-4 overflow-hidden bg-black">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(138, 43, 226, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 43, 226, 0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

            <div className="max-w-[1600px] mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">

                    {/* Left: 3D GPU Card with Fallback */}
                    <div className="relative">
                        {isLoading ? (
                            <div className="relative w-full aspect-[3/4] max-w-md mx-auto flex items-center justify-center bg-black/50 rounded-3xl border border-white/10">
                                <div className="animate-pulse text-gray-500">
                                    <Cpu size={48} />
                                </div>
                            </div>
                        ) : !has3DSupport || hasError ? (
                            <FallbackGPU />
                        ) : (
                            <motion.div
                                className="relative perspective-[2000px] hidden md:block"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <motion.div
                                    style={{
                                        rotateX,
                                        rotateY,
                                        transformStyle: 'preserve-3d',
                                    }}
                                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                    className="relative w-full aspect-[3/4] max-w-md mx-auto"
                                >
                                    {/* Dynamic Shadow */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-purple-600/40 to-cyan-500/40 blur-3xl"
                                        animate={{
                                            scale: isHovered ? 1.2 : 1,
                                            opacity: isHovered ? 0.8 : 0.4
                                        }}
                                        transition={{ duration: 0.3 }}
                                        style={{ transform: 'translateZ(-50px)' }}
                                    />

                                    {/* GPU Card Container */}
                                    <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                                        style={{ transform: 'translateZ(0px)' }}
                                    >
                                        {/* RGB Lighting Effect */}
                                        <div className="absolute inset-0 opacity-60">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 animate-rgb-flow" />
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 animate-rgb-flow" style={{ animationDelay: '1s' }} />
                                        </div>

                                        {/* GPU Body */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">

                                            {/* Top Heatsink */}
                                            <div className="w-full h-16 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-xl mb-4 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                                            </div>

                                            {/* Fans Container */}
                                            <div className="grid grid-cols-3 gap-4 w-full mb-6">
                                                {[0, 1, 2].map((i) => (
                                                    <div key={i} className="relative aspect-square">
                                                        {/* Fan Housing */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 border-gray-700 shadow-inner" />

                                                        {/* Rotating Fan Blades */}
                                                        <motion.div
                                                            className="absolute inset-2 flex items-center justify-center"
                                                            animate={{ rotate: 360 }}
                                                            transition={{
                                                                duration: 2 - (i * 0.2),
                                                                repeat: Infinity,
                                                                ease: 'linear'
                                                            }}
                                                        >
                                                            {[0, 1, 2, 3, 4, 5].map((blade) => (
                                                                <div
                                                                    key={blade}
                                                                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent rounded-full"
                                                                    style={{
                                                                        transform: `rotate(${blade * 60}deg)`,
                                                                        transformOrigin: 'center'
                                                                    }}
                                                                />
                                                            ))}
                                                            {/* Center Hub */}
                                                            <div className="w-4 h-4 bg-gray-600 rounded-full border border-gray-500 shadow-lg" />
                                                        </motion.div>

                                                        {/* Glow Effect */}
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full"
                                                            animate={{
                                                                boxShadow: [
                                                                    '0 0 20px rgba(6, 182, 212, 0.3)',
                                                                    '0 0 40px rgba(168, 85, 247, 0.5)',
                                                                    '0 0 20px rgba(6, 182, 212, 0.3)',
                                                                ]
                                                            }}
                                                            transition={{ duration: 3, repeat: Infinity }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* PCB Details */}
                                            <div className="w-full space-y-2">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className="h-1 bg-gradient-to-r from-green-600/40 via-green-500/60 to-green-600/40 rounded-full relative overflow-hidden">
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                                                            animate={{ x: ['-100%', '200%'] }}
                                                            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Bottom Connector */}
                                            <div className="w-3/4 h-8 bg-gradient-to-b from-yellow-600/80 to-yellow-700/80 rounded-b-lg mt-4 relative">
                                                <div className="absolute inset-0 flex gap-1 p-1">
                                                    {[...Array(8)].map((_, i) => (
                                                        <div key={i} className="flex-1 bg-yellow-900/50 rounded-sm" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vents with RGB Glow */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
                                            {[...Array(6)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-16 h-1 bg-gradient-to-r from-purple-600/60 to-cyan-500/60 rounded-full"
                                                    animate={{
                                                        opacity: [0.4, 1, 0.4],
                                                        boxShadow: [
                                                            '0 0 5px rgba(168, 85, 247, 0.5)',
                                                            '0 0 15px rgba(6, 182, 212, 0.8)',
                                                            '0 0 5px rgba(168, 85, 247, 0.5)',
                                                        ]
                                                    }}
                                                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                                />
                                            ))}
                                        </div>

                                        {/* Brand Logo Area */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                                            <div className="text-white font-black text-xl tracking-tighter italic">RTX 4090</div>
                                            <motion.div
                                                className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Zap size={16} className="text-white" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                        {/* Mobile: Static version */}
                        <div className="block md:hidden">
                            <FallbackGPU />
                        </div>
                    </div>

                    {/* Right: Glassmorphism Specs Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-block"
                            >
                                <span className="text-primary font-black uppercase tracking-[0.3em] text-xs">Ultimate Performance</span>
                            </motion.div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
                                قوة لا <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">تُقهر</span>
                            </h2>
                            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl">
                                تجربة ألعاب بدقة 4K وإطارات تصل إلى 240 FPS مع تقنية Ray Tracing المتقدمة وذكاء DLSS 3.5
                            </p>
                        </div>

                        {/* Glassmorphism Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                            {[
                                { icon: Cpu, label: 'CUDA Cores', value: '16,384', color: 'from-purple-500 to-purple-600' },
                                { icon: Zap, label: 'Boost Clock', value: '2.52 GHz', color: 'from-cyan-500 to-cyan-600' },
                                { icon: Thermometer, label: 'Memory', value: '24 GB', color: 'from-green-500 to-green-600' },
                                { icon: Activity, label: 'TDP', value: '450W', color: 'from-orange-500 to-orange-600' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="relative group"
                                >
                                    {/* Glassmorphism Background */}
                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-white/20 transition-all" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Content */}
                                    <div className="relative p-4 md:p-6 space-y-2 md:space-y-3">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                            <stat.icon size={20} className="text-white md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-black text-white">{stat.value}</p>
                                            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-bold">{stat.label}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-base md:text-lg rounded-full shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-3 group"
                            aria-label="تسوق الآن - Shop Now"
                        >
                            <span>تسوق الآن</span>
                            <Zap size={20} className="group-hover:rotate-12 transition-transform" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes rgb-flow {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-rgb-flow {
                    background-size: 200% 200%;
                    animation: rgb-flow 3s ease infinite;
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                .perspective-[2000px] {
                    perspective: 2000px;
                }
            `}</style>
        </section>
    );
}
