'use client';
import { useStore, SeasonPass } from '@/context/StoreContext';
import { Plus, Edit, Trash2, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminSubscriptionsPage() {
    const { seasonPasses, addSeasonPass, updateSeasonPass, deleteSeasonPass, games } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
        isOpen: false,
        id: '',
        title: ''
    });

    const [formData, setFormData] = useState<Partial<SeasonPass>>({
        title: '',
        gameId: '',
        price: 0,
        status: 'ACTIVE',
        image: '',
        phases: [
            { number: '01', name: '', englishName: '', summary: '', image: '', color: '#D13434' },
            { number: '02', name: '', englishName: '', summary: '', image: '', color: '#0070D1' },
            { number: '03', name: '', englishName: '', summary: '', image: '', color: '#10b981' }
        ]
    });

    const handleDelete = () => {
        deleteSeasonPass(deleteModal.id);
        toast.success(`تم حذف ${deleteModal.title} بنجاح`, {
            style: { background: '#EF4444', color: '#fff' }
        });
        setDeleteModal({ isOpen: false, id: '', title: '' });
    };

    const handleSave = () => {
        if (!formData.title || !formData.gameId) {
            toast.error('يرجى إكمال البيانات الأساسية');
            return;
        }

        if (editingId) {
            updateSeasonPass(editingId, formData);
            toast.success('تم تحديث بطاقة الموسم بنجاح');
            setEditingId(null);
        } else {
            const newPass: SeasonPass = {
                ...formData as SeasonPass,
                id: Date.now().toString()
            };
            addSeasonPass(newPass);
            toast.success('تم إضافة بطاقة موسم جديدة');
        }
        setIsAdding(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            gameId: '',
            price: 0,
            status: 'ACTIVE',
            image: '',
            phases: [
                { number: '01', name: '', englishName: '', summary: '', image: '', color: '#D13434' },
                { number: '02', name: '', englishName: '', summary: '', image: '', color: '#0070D1' },
                { number: '03', name: '', englishName: '', summary: '', image: '', color: '#10b981' }
            ]
        });
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black">إدارة بطاقات الموسم (Season Passes)</h1>
                    <p className="text-gray-400 mt-2">تحكم في محتوى الـ SUB والتحديثات الموسمية</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    إضافة بطاقة موسم
                </button>
            </div>

            {(isAdding || editingId) && (
                <div className="bg-[#1A1A1A] border border-primary/20 rounded-[32px] p-8 mb-12 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <Plus className="text-primary" />
                        {editingId ? 'تعديل بطاقة الموسم' : 'إضافة بطاقة موسم جديدة'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">عنوان البطاقة</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="مثال: Battlefield 6: Season 1 Pass"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">اللعبة المرتبطة</label>
                            <select
                                value={formData.gameId}
                                onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary transition-all appearance-none"
                            >
                                <option value="">اختر اللعبة...</option>
                                {Array.isArray(games) && games.map(game => (
                                    <option key={game.id} value={game.id}>{game.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">السعر (OMR)</label>
                            <input
                                type="number"
                                step="0.001"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">رابط صورة الغلاف</label>
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-6 border-b border-white/5 pb-2">تفاصيل الأطوار (Phases)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {formData.phases?.map((phase, idx) => (
                            <div key={idx} className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                <span className="text-primary font-black">Phase {phase.number}</span>
                                <input
                                    placeholder="اسم الطور (عربي)"
                                    value={phase.name}
                                    onChange={(e) => {
                                        const newPhases = [...(formData.phases || [])];
                                        newPhases[idx].name = e.target.value;
                                        setFormData({ ...formData, phases: newPhases });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none"
                                />
                                <input
                                    placeholder="Phase Name (English)"
                                    value={phase.englishName}
                                    onChange={(e) => {
                                        const newPhases = [...(formData.phases || [])];
                                        newPhases[idx].englishName = e.target.value;
                                        setFormData({ ...formData, phases: newPhases });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none"
                                />
                                <textarea
                                    placeholder="ملخص الطور..."
                                    value={phase.summary}
                                    onChange={(e) => {
                                        const newPhases = [...(formData.phases || [])];
                                        newPhases[idx].summary = e.target.value;
                                        setFormData({ ...formData, phases: newPhases });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none h-24"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
                            className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-primary px-10 py-3 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                            {editingId ? 'حفظ التعديلات' : 'نشر بطاقة الموسم'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(seasonPasses) && seasonPasses.map(pass => (
                    <div key={pass.id} className="bg-[#1A1A1A] rounded-[32px] overflow-hidden border border-white/5 group hover:border-primary/50 transition-all">
                        <div className="relative aspect-video">
                            <img src={pass.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={pass.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    {pass.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold truncate">{pass.title}</h3>
                            <div className="flex items-center justify-between text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-primary" />
                                    <span className="font-mono">{(pass.price ?? 0).toFixed(3)} OMR</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-primary" />
                                    <span>3 Phases</span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => { setEditingId(pass.id); setFormData(pass); }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold"
                                >
                                    <Edit size={16} /> تعديل
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: pass.id, title: pass.title })}
                                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Deletion Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <Trash2 className="text-red-500 mb-6 mx-auto" size={48} />
                        <h3 className="text-xl font-bold text-center mb-2 text-white">تأكيد الحذف</h3>
                        <p className="text-gray-400 text-center mb-8 text-sm">
                            هل أنت متأكد من حذف بطاقة الموسم <span className="text-white font-bold">{deleteModal.title}</span>؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-600/20"
                            >
                                حذف نهائياً
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
