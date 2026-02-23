'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import { Game } from '@/data/games';
import ProductForm from '@/components/admin/ProductForm';
import { toast } from 'sonner';

export default function AddProductPage() {
    const { addGame } = useStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (gameData: Game) => {
        setIsLoading(true);
        
        try {
            await addGame(gameData);

            toast.success('تم إضافة المنتج بنجاح!', {
                description: 'سيظهر المنتج الآن في المتجر',
                style: { background: '#10B981', color: '#fff', border: 'none' }
            });

            setTimeout(() => {
                setIsLoading(false);
                router.push('/admin/products');
                router.refresh();
            }, 800);
        } catch (error) {
            console.error('Failed to add product:', error);
            toast.error('فشل إضافة المنتج', {
                description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
                style: { background: '#EF4444', color: '#fff', border: 'none' }
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black">إضافة منتج جديد</h1>
                    <p className="text-gray-400 mt-2">أضف أحدث الألعاب إلى المتجر.</p>
                </div>
                <button
                    onClick={() => router.push('/admin/products')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors"
                >
                    إلغاء وعودة
                </button>
            </div>

            <ProductForm
                onSubmit={handleSave}
                isLoading={isLoading}
                buttonText="نشر المنتج"
            />
        </div>
    );
}
