'use client';
import Navbar from '@/components/Navbar';
import { posts } from '@/data/posts';
import { ArrowRight, Calendar, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

export default function BlogPostPage() {
    const params = useParams();
    const post = posts.find(p => p.id === params.id);

    if (!post) {
        return (
            <div className="min-h-screen bg-background text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">المقال غير موجود</h1>
                    <Link href="/blog" className="text-primary hover:underline">العودة للأخبار</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white">
            <Navbar />

            {/* Hero Image */}
            <div className="relative h-[400px] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/50 to-transparent z-10" />
                {/* In real app use Next Image with fill */}
                <div className="w-full h-full bg-gray-800" style={{ backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

                <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 z-20 max-w-4xl mx-auto">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                        {post.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 drop-shadow-lg">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-gray-300 text-sm">
                        <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
                        <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
                        <span className="flex items-center gap-2"><Clock size={16} /> 5 دقائق قراءة</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="lead text-xl text-gray-300 mb-8 font-light border-r-4 border-primary pr-4">
                        {post.excerpt}
                    </p>

                    {/* Simulated Content Body */}
                    <div className="space-y-6 text-gray-200 leading-relaxed">
                        <p>
                            لوريم إيبسوم دولار سيت أميت، كونسيكتيتور أدايباكسينج إليت. سيد دو إيوسمود تيمبور إنكيديدونت أوت لابوري إت دولوري ماجنا أليكو. أوت إنيم أد مينيم فينيام، كويس نوسترود إكسيرسيتاسيون أولامكو لابوريس نيسي أوت أليكويب إكس إيا كومودو كونسي كوات.
                        </p>
                        <h3 className="text-2xl font-bold text-white mt-8 mb-4">التفاصيل والتسريبات</h3>
                        <p>
                            دويس أوتي إيروري دولار إن ريبريهينديريت إن فولوبتاتي فيليت إيسي كايلوم دورلور يوو فوجيات نولا باراياتور. إكسيبتيور سينت أوكايكات كوبيداتات نون بروايدينت، سون أون كولبا كيو أوفيسيا ديسيرونت موليت أنيم إيد إيست لابوروم.
                        </p>
                        <ul className="list-disc list-inside space-y-2 my-6 bg-white/5 p-6 rounded-xl border border-white/10">
                            <li>نظام طقس ديناميكي جديد بالكامل</li>
                            <li>شخصيات قابلة للعب متعددة مع قصص متداخلة</li>
                            <li>خريطة أكبر بثلاث مرات من الإصدار السابق</li>
                        </ul>
                        <p>
                            سيد دو إيوسمود تيمبور إنكيديدونت أوت لابوري إت دولوري ماجنا أليكو. أوت إنيم أد مينيم فينيام.
                        </p>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-16 pt-8 border-t border-white/10 flex justify-end">
                    <Link href="/blog" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        العودة لجميع المقالات
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </article>
        </main>
    );
}
