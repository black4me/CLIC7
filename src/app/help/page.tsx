'use client';

import Navbar from '@/components/Navbar';
import { useStore } from '@/context/StoreContext';
import { Search, ChevronRight, Smartphone, Mail, Globe } from 'lucide-react';

export default function HelpPage() {
    const { settings } = useStore();
    const faqs = [
        { q: 'كيف أحصل على كود اللعبة بعد الشراء؟', a: 'بمجرد تأكيد الدفع، سيصلك الكود فوراً عبر الواتساب والبريد الإلكتروني المسجل في الطلب.' },
        { q: 'ما هي وسائل الدفع المتاحة؟', a: 'نقبل الدفع عبر بنك مسقط (تحويل مباشر)، بطاقات فيزا وماستركارد، وباي بال.' },
        { q: 'هل الأكواد تعمل في جميع الحسابات؟', a: 'يرجى قراءة وصف المنتج بعناية، حيث نوضح المنطقة (Region) الخاصة بكل كود.' },
        { q: 'واجهت مشكلة في التفعيل، ماذا أفعل؟', a: 'فريق الدعم متاح 24/7 عبر الواتساب لمساعدتك في أي مشكلة تقنية.' }
    ];

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white">
            <Navbar />

            <div className="bg-primary/10 py-24 px-4 text-center border-b border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-6">مركز المساعدة</h1>
                    <p className="text-xl text-gray-400 mb-12">كيف يمكننا مساعدتك اليوم؟</p>

                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="ابحث عن حل لمشكلة..."
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-12 text-white outline-none focus:border-primary transition-all text-right"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">الدعم الفني</h3>
                        <p className="text-gray-500 text-sm mb-6">تواصل معنا مباشرة عبر واتساب لحل أي مشكلة فوراً.</p>
                        <a href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}`} className="text-primary font-bold flex items-center justify-center gap-2 hover:underline">
                            تحدث معنا <ChevronRight size={18} />
                        </a>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
                        <p className="text-gray-500 text-sm mb-6">للدعم الاستراتيجي والاستفسارات التجارية الضخمة.</p>
                        <a href={`mailto:${settings.contact.email}`} className="text-primary font-bold flex items-center justify-center gap-2 hover:underline">
                            ارسل بريد <ChevronRight size={18} />
                        </a>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Globe size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">الأسئلة الشائعة</h3>
                        <p className="text-gray-500 text-sm mb-6">اطلع على دليل المستخدم وطريقة التفعيل الصحيحة.</p>
                        <button className="text-primary font-bold flex items-center justify-center gap-2 hover:underline">
                            مشاهدة الدليل <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black mb-12 border-r-4 border-primary pr-4">{settings.helpPage?.title || 'الأسئلة الشائعة'}</h2>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 md:p-12 leading-relaxed text-gray-400">
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                            {settings.helpPage?.content}
                        </div>
                    </div>

                    <div className="mt-20">
                        <h3 className="text-xl font-bold mb-8">أسئلة سريعة</h3>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <details key={i} className="bg-white/5 border border-white/5 rounded-2xl group overflow-hidden">
                                    <summary className="p-6 cursor-pointer font-bold flex items-center justify-between list-none">
                                        <span>{faq.q}</span>
                                        <ChevronRight className="group-open:rotate-90 transition-transform" size={18} />
                                    </summary>
                                    <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
