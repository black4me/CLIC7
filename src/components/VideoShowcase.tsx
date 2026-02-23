'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Real YouTube Data provided by User
const videos = [
    {
        id: 1,
        title: 'Hell Let Loose',
        videoId: 'ndbzxAP_kBM',
        start: 10,
        end: 50,
        desc: 'معارك الحرب العالمية الثانية بواقعية مذهلة.'
    },
    {
        id: 2,
        title: 'Battlefield 2042',
        videoId: 'Oc_DJm7se3M',
        start: 45,
        end: 85,
        desc: 'حرب شاملة وفوضى المعارك الحديثة.'
    },
    {
        id: 3,
        title: 'Gran Turismo 7',
        videoId: '5xK7Wr-86Ew',
        start: 334,
        end: 374,
        desc: 'محاكاة القيادة الحقيقية بأدق التفاصيل.'
    },
    {
        id: 4,
        title: 'S.T.A.L.K.E.R. 2',
        videoId: 'T95WwXem8Vg',
        start: 576,
        end: 616,
        desc: 'البقاء على قيد الحياة في منطقة تشيرنوبيل المحظورة.'
    }
];

export default function VideoShowcase() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Change slide every 10 seconds (aligned with clip durations reasonably well for showcase)
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const currentVideo = videos[currentIndex];

    return (
        <div className="relative w-full py-10 bg-[#0B0B0F] overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[150px] rounded-full opacity-30 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        GAMEPLAY
                    </h2>
                    <div className="flex gap-2">
                        {videos.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-primary shadow-glow' : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Video Display Area */}
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            {/* YouTube Embed - Scaled up to hide top title bar */}
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${currentVideo.videoId}?start=${currentVideo.start}&end=${currentVideo.end}&autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${currentVideo.videoId}&rel=0&showinfo=0&iv_load_policy=3`}
                                title={currentVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                className="w-full h-full object-cover pointer-events-none scale-[1.35]"
                            />

                            {/* Overlay Gradient for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

                            {/* Video Info Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 pointer-events-none">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h3 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-lg uppercase tracking-wider">
                                        {currentVideo.title}
                                    </h3>
                                    <p className="text-gray-300 text-sm md:text-xl max-w-lg font-light">
                                        {currentVideo.desc}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Live Badge */}
                    <div className="absolute top-6 right-6 z-20">
                        <div className="bg-red-600/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-red-500/50 uppercase animate-pulse flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full" />
                            Live Preview
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
