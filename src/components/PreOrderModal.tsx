'use client';
import { useState } from 'react';
import { X, Bell, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { Game } from '@/data/games';
import { toast } from 'sonner';

interface PreOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    game: Game;
}

export default function PreOrderModal({ isOpen, onClose, game }: PreOrderModalProps) {
    const { addPreOrder } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newOrder = {
                id: Math.random().toString(36).substr(2, 9),
                customerName: formData.name,
                email: formData.email,
                phone: formData.phone,
                gameId: game.id,
                gameTitle: game.title,
                price: game.price,
                date: new Date().toISOString(),
                transactionId: `PO-${Math.floor(Math.random() * 10000)}`
            };

            addPreOrder(newOrder);
            setStep('SUCCESS');
            toast.success('تم استلام طلبك بنجاح!');
        } catch (error) {
            toast.error('حدث خطأ، يرجى المحاولة مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1A1A1A] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl"
                >
                    {/* Header Image */}
                    <div className="h-32 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1A1A1A] z-10" />
                        <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-50" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-white/10 text-white p-2 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 -mt-12 relative z-20">
                        {step === 'FORM' ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                        <Bell size={28} />
                                    </div>
                                    <h2 className="text-2xl font-black text-white mb-2">طلب مسبق (Pre-Order)</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        هذا المنتج غير متوفر حالياً. سجل بياناتك وسنقوم بحجز نسختك والتواصل معك فور توفرها!
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1">الاسم الكامل</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none text-right"
                                            placeholder="اكتب اسمك..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1">البريد الإلكتروني</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none text-left"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1">رقم الواتساب (WhatsApp)</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none text-left"
                                            placeholder="968..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(138,43,226,0.2)] hover:shadow-[0_0_30px_rgba(138,43,226,0.4)] flex items-center justify-center gap-2 mt-4"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'إرسال طلب الحجز'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-in-center">
                                    <Bell size={40} className="fill-current" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">تم التسجيل بنجاح!</h3>
                                <p className="text-gray-400 mb-8">
                                    شكراً لك {formData.name}. وصلتنا بياناتك وسنكون أول من يخبرك عند توفر "{game.title}".
                                </p>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    إغلاق
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
