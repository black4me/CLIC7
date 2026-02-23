'use client';

import Navbar from '@/components/Navbar';
import { useStore } from '@/context/StoreContext';
import { Info, ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
    const { settings } = useStore();
    const about = settings.aboutUs;

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white selection:bg-primary pb-20">
            <Navbar />

            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src={about.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000'}
                    alt={about.title}
                    fill
                    className="object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-black/60" />
                <div className="relative z-10 text-center max-w-4xl px-4">
                    <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-6">{about.title}</h1>
                    <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
                        نحن لسنا مجرد متجر، نحن مجتمع من اللاعبين يهدف لتوفير أفضل تجربة رقمية.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-20">
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl">
                    <div className="prose prose-invert prose-xl max-w-none text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                        {about.content}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="font-bold text-lg">أمان موثوق</h3>
                            <p className="text-sm text-gray-500">نضمن لك حماية تامة لبياناتك وعمليات الدفع الخاصة بك.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                <MapPin size={24} />
                            </div>
                            <h3 className="font-bold text-lg">مقرنا الرئيسي</h3>
                            <p className="text-sm text-gray-500">سلطنة عمان - مسقط. نخدم جميع أنحاء الخليج.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                <Mail size={24} />
                            </div>
                            <h3 className="font-bold text-lg">دعم متواصل</h3>
                            <p className="text-sm text-gray-500">فريقنا جاهز للرد على استفساراتك على مدار الساعة.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
