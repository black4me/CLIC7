'use client';

import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Plus, Search, Edit2, Trash2, Tag, Layers, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoriesPage() {
    const { categories, addCategory, updateCategory, deleteCategory } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: ''
    });

    const handleOpenModal = (category?: any) => {
        if (category) {
            setEditingId(category.id);
            setFormData({ name: category.name, slug: category.slug });
        } else {
            setEditingId(null);
            setFormData({ name: '', slug: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', slug: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.slug) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            if (editingId) {
                updateCategory(editingId, {
                    name: formData.name,
                    slug: formData.slug
                });
                toast.success('Category updated successfully');
            } else {
                addCategory({
                    id: formData.slug, // Use slug as ID for simplicity or generate UUID
                    name: formData.name,
                    slug: formData.slug,
                    count: 0
                });
                toast.success('Category created successfully');
            }
            handleCloseModal();
        } catch (error) {
            toast.error('Failed to save category');
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            deleteCategory(id);
            toast.success('Category deleted successfully');
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        if (!editingId) {
            const slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData({ name, slug });
        } else {
            setFormData(prev => ({ ...prev, name }));
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">التصنيفات</h1>
                    <p className="text-gray-400">إدارة تصنيفات الألعاب والأقسام</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[#0070D1] hover:bg-[#005fb3] text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[#0070D1]/20 hover:shadow-[#0070D1]/40 hover:-translate-y-1 active:translate-y-0"
                >
                    <Plus size={20} />
                    <span>إضافة تصنيف جديد</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="بحث في التصنيفات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-[#0070D1] transition-colors"
                />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredCategories.map((category) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className="group relative bg-[#12121A] border border-white/5 rounded-2xl p-6 hover:border-[#0070D1]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#0070D1]/5"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/5 rounded-xl text-[#0070D1] group-hover:scale-110 transition-transform duration-300">
                                    <Tag size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => handleOpenModal(category)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="تعديل"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id, category.name)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                        title="حذف"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                            <code className="text-sm text-gray-500 font-mono block mb-4">{category.slug}</code>

                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 w-fit px-3 py-1 rounded-full">
                                <Layers size={14} />
                                <span>{category.count || 0} لعبة</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredCategories.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <Layers size={48} className="mx-auto mb-4 opacity-20" />
                    <p>لا توجد تصنيفات تطابق بحثك</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#12121A] border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6">
                                {editingId ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        اسم التصنيف
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        placeholder="مثال: ألعاب البلايستيشن"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0070D1] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        الرابط المختصر (Slug)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="ps5-games"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0070D1] transition-colors font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">يستخدم في رابط الصفحة: domain.com/category/slug</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl bg-[#0070D1] text-white hover:bg-[#005fb3] transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Save size={18} />
                                        <span>حفظ التغييرات</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
