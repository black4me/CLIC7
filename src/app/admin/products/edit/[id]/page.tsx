'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import { Game } from '@/data/games';
import ProductForm from '@/components/admin/ProductForm';
import { toast } from 'sonner';
import React from 'react';

interface EditProductPageProps {
    params: Promise<{
        id: string;
    }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const { id } = React.use(params);
    const { games, updateGame } = useStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [game, setGame] = useState<Game | null>(null);

    // Fetch Game
    useEffect(() => {
        const foundGame = games.find(g => g.id === id);
        if (foundGame) {
            setGame(foundGame);
        } else {
            toast.error('لم يتم العثور على المنتج');
            router.push('/admin/products');
        }
    }, [id, games, router]);

    const handleUpdate = async (updatedGame: Game) => {
        setIsLoading(true);
        try {
            // Ensure the ID matches
            const gameWithId = { ...updatedGame, id };
            
            await updateGame(id, gameWithId);

            toast.success('تم تحديث المنتج بنجاح!', {
                description: 'تم حفظ جميع التغييرات في قاعدة البيانات',
                style: { background: '#10B981', color: '#fff', border: 'none' }
            });

            // Force a small delay to ensure state updates
            setTimeout(() => {
                setIsLoading(false);
                router.push('/admin/products');
                // Force refresh to clear any cached data
                router.refresh();
            }, 500);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('فشل تحديث المنتج', {
                description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
                style: { background: '#EF4444', color: '#fff', border: 'none' }
            });
            setIsLoading(false);
        }
    };

    if (!game) return (
        <div className="p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">جاري التحميل...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black">تعديل المنتج</h1>
                    <p className="text-gray-400 mt-2">
                        تعديل بيانات: <span className="text-white font-bold">{game.title}</span>
                    </p>
                </div>
                <button
                    onClick={() => router.push('/admin/products')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors"
                >
                    إلغاء وعودة
                </button>
            </div>

            <ProductForm
                initialData={game}
                onSubmit={handleUpdate}
                isLoading={isLoading}
                buttonText="حفظ التغييرات"
            />
        </div>
    );
}
