'use client';
import { useStore } from '@/context/StoreContext';
import { Edit, Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AllProductsPage() {
    const { games, deleteGame } = useStore();
    const router = useRouter();
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
        isOpen: false,
        id: '',
        title: ''
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteGame(deleteModal.id);
            toast.success(`تم حذف ${deleteModal.title} بنجاح`, {
                style: { background: '#EF4444', color: '#fff' }
            });
        } catch (error) {
            toast.error('فشل حذف المنتج', {
                description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
            });
        }
        setDeleteModal({ isOpen: false, id: '', title: '' });
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Force refresh the page to get latest data from server
            router.refresh();
            toast.success('تم تحديث القائمة بنجاح');
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [router]);

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black">إدارة المنتجات</h1>
                    <p className="text-gray-400 mt-2">عدد المنتجات: {games.length}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-colors disabled:opacity-50"
                        title="تحديث القائمة"
                    >
                        <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    <Link href="/admin/products/add">
                        <button className="bg-primary hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                            <Plus size={20} />
                            إضافة منتج جديد
                        </button>
                    </Link>
                </div>
            </div>

            {/* Search (Placeholder) */}
            <div className="relative mb-6">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white focus:outline-none focus:border-primary/50"
                />
            </div>

            {/* Products Table */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-black/30 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4">المنتج</th>
                            <th className="p-4">السعر</th>
                            <th className="p-4">المنصة</th>
                            <th className="p-4 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {games.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    لا توجد منتجات حالياً. أضف منتجك الأول!
                                </td>
                            </tr>
                        )}
                        {games.map((game) => (
                            <tr key={game.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                            <Image 
                                                src={game.image} 
                                                alt={game.title} 
                                                fill 
                                                className="object-cover"
                                                unoptimized // Disable optimization for uploaded images
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-primary transition-colors">{game.title}</h3>
                                            <span className="text-xs text-gray-500">{game.genre}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono font-bold">{(game.price ?? 0).toFixed(3)} OMR</span>
                                        {game.originalPrice && game.originalPrice > (game.price ?? 0) && (
                                            <span className="text-xs text-gray-500 line-through">{(game.originalPrice ?? 0).toFixed(3)}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1 flex-wrap justify-end md:justify-start">
                                        {(game.availablePlatforms || [game.platform]).map((p) => (
                                            <span key={p} className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold border border-white/10 uppercase">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`/game/${game.id}`} target="_blank">
                                            <button className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors" title="استعراض (Live Preview)">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                                            </button>
                                        </Link>
                                        <Link href={`/admin/products/edit/${game.id}`}>
                                            <button className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="تعديل">
                                                <Edit size={18} />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, id: game.id, title: game.title })}
                                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Deletion Modal */}
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                            <Trash2 className="text-red-500 mb-6 mx-auto" size={48} />
                            <h3 className="text-xl font-bold text-center mb-2 text-white">تأكيد الحذف</h3>
                            <p className="text-gray-400 text-center mb-8 text-sm">
                                هل أنت متأكد من حذف <span className="text-white font-bold">{deleteModal.title}</span>؟ لا يمكن التراجع عن هذا الإجراء.
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
        </div>
    );
}
