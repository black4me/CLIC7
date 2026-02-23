'use client';

import Navbar from '@/components/Navbar';
import { useStore } from '@/context/StoreContext';
import { ShieldAlert, Lock, Eye, Terminal } from 'lucide-react';

export default function PrivacyPage() {
    const { settings } = useStore();
    const privacy = settings.privacyPolicy;

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-24">
                <header className="mb-16 text-center">
                    <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary mb-6">
                        <ShieldAlert size={48} />
                    </div>
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">{privacy.title}</h1>
                    <p className="text-gray-500 tracking-widest uppercase text-sm font-bold">Privacy & Data Protection Protocol</p>
                </header>

                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-xl">
                        <div className="prose prose-invert prose-xl max-w-none text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                            {privacy.content}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-black/40 border border-white/5 rounded-3xl hover:border-primary/30 transition-colors">
                            <Lock className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">تشفير البيانات</h3>
                            <p className="text-gray-400 text-sm">يتم معالجة جميع الطلبات عبر بروتوكولات تشفير متقدمة لضمان سرية معلومات الدفع.</p>
                        </div>
                        <div className="p-8 bg-black/40 border border-white/5 rounded-3xl hover:border-primary/30 transition-colors">
                            <Eye className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">الشفافية</h3>
                            <p className="text-gray-400 text-sm">نحن لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي طرف ثالث تحت أي ظرف.</p>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl flex items-center gap-6">
                        <Terminal className="text-primary" size={32} />
                        <div>
                            <h4 className="font-bold">تحديث البروتوكول</h4>
                            <p className="text-sm text-primary/80">آخر تحديث لهذه السياسة: {new Date().toLocaleDateString('ar-OM')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
