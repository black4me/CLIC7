'use client';
import { Save, Image as ImageIcon, Bold, Italic, Link as LinkIcon, List } from 'lucide-react';

export default function AddPostPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black">إضافة مقال جديد</h1>
                <div className="flex gap-3">
                    <button className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl font-bold transition-colors">
                        معاينة
                    </button>
                    <button className="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
                        <Save size={18} />
                        نشر المقال
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                        <input type="text" className="w-full bg-transparent border-0 text-3xl font-black text-white placeholder-gray-600 focus:ring-0 outline-none" placeholder="أدخل عنوان المقال هنا..." />
                    </div>

                    {/* Rich Text Editor Mock */}
                    <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="bg-black/30 p-3 border-b border-white/5 flex items-center gap-2">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><Bold size={18} /></button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><Italic size={18} /></button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><LinkIcon size={18} /></button>
                            <div className="w-px h-6 bg-white/10 mx-2" />
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><List size={18} /></button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><ImageIcon size={18} /></button>
                        </div>
                        <textarea className="w-full h-[500px] bg-transparent border-0 p-6 text-white text-lg leading-relaxed focus:ring-0 outline-none resize-none" placeholder="ابدأ الكتابة هنا..." />
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-300">
                            تحسين محركات البحث (SEO)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">الكلمات المفتاحية (Focus Keywords)</label>
                                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none" placeholder="أخبار, ألعاب, بلايستيشن..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">وصف الميتا (Meta Description)</label>
                                <textarea className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none h-20 text-sm" placeholder="وصف مختصر يظهر في نتائج البحث..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Options */}
                <div className="space-y-6">
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold mb-4">الصورة البارزة</h3>
                        <div className="aspect-video bg-black/50 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group">
                            <ImageIcon className="text-gray-600 group-hover:text-primary mb-2" />
                            <span className="text-xs text-gray-500">رفع صورة</span>
                        </div>
                    </div>

                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold mb-4">التصنيف</h3>
                        <div className="space-y-2">
                            {['أخبار', 'مراجعات', 'شروحات', 'فيديو', 'عروض'].map((cat) => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="rounded border-gray-600 bg-black/50 text-primary focus:ring-primary" />
                                    <span className="text-gray-400 group-hover:text-white transition-colors">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
