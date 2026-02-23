'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Plus, Trash2, Settings } from 'lucide-react';

interface GiftCardRecord {
    id: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    value: number;
    earnedDate: string;
    used: boolean;
    usedDate?: string;
}

interface AdminSettings {
    defaultGiftCardValue: number;
    enableAutoGiftCards: boolean;
    purchasesForGiftCard: number;
}

export default function GiftCardSettings() {
    const [giftCards, setGiftCards] = useState<GiftCardRecord[]>([]);
    const [settings, setSettings] = useState<AdminSettings>({
        defaultGiftCardValue: 30,
        enableAutoGiftCards: true,
        purchasesForGiftCard: 10,
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCard, setNewCard] = useState({
        customerEmail: '',
        value: 30,
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            // Load gift cards
            const cards = JSON.parse(localStorage.getItem('clic7_gift_cards') || '[]');
            const users = JSON.parse(localStorage.getItem('clic7_users') || '[]');

            // Enrich with user info
            const enrichedCards = cards.map((card: any, idx: number) => {
                const user = users.find((u: any) => u.id === card.customerId);
                return {
                    id: `gc-${idx}`,
                    ...card,
                    customerEmail: user?.email || 'Unknown',
                    customerName: user?.name || 'Unknown',
                };
            });

            setGiftCards(enrichedCards);

            // Load settings
            const savedSettings = JSON.parse(localStorage.getItem('clic7_gift_card_settings') || '{}');
            setSettings({
                defaultGiftCardValue: savedSettings.defaultGiftCardValue || 30,
                enableAutoGiftCards: savedSettings.enableAutoGiftCards !== false,
                purchasesForGiftCard: savedSettings.purchasesForGiftCard || 10,
            });

            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const handleAddGiftCard = async () => {
        setMessage('');

        try {
            const users = JSON.parse(localStorage.getItem('clic7_users') || '[]');
            const user = users.find((u: any) => u.email === newCard.customerEmail);

            if (!user) {
                setMessage('❌ العميل غير موجود');
                return;
            }

            const cards = JSON.parse(localStorage.getItem('clic7_gift_cards') || '[]');
            cards.push({
                customerId: user.id,
                value: newCard.value,
                earnedDate: new Date().toISOString(),
                used: false,
            });

            localStorage.setItem('clic7_gift_cards', JSON.stringify(cards));
            setMessage('✅ تم إضافة البطاقة بنجاح');
            setNewCard({ customerEmail: '', value: 30 });
            setShowAddForm(false);
            loadData();
        } catch (error) {
            setMessage('❌ حدث خطأ في الإضافة');
        }
    };

    const handleDeleteCard = (id: string) => {
        try {
            const cards = JSON.parse(localStorage.getItem('clic7_gift_cards') || '[]');
            const filteredCards = cards.filter((_: any, idx: number) => `gc-${idx}` !== id);
            localStorage.setItem('clic7_gift_cards', JSON.stringify(filteredCards));
            setMessage('✅ تم حذف البطاقة');
            loadData();
        } catch (error) {
            setMessage('❌ خطأ في الحذف');
        }
    };

    const handleUpdateSettings = () => {
        try {
            localStorage.setItem('clic7_gift_card_settings', JSON.stringify(settings));
            setMessage('✅ تم تحديث الإعدادات');
        } catch (error) {
            setMessage('❌ خطأ في التحديث');
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-slate-400">جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Settings Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    إعدادات البطاقات الهدايا
                </h3>

                <div className="space-y-4">
                    {/* Default Value */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            قيمة البطاقة الهدية الافتراضية ($)
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={settings.defaultGiftCardValue}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    defaultGiftCardValue: parseInt(e.target.value),
                                })
                            }
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">تحدد القيمة الافتراضية للبطاقات المكتسبة تلقائياً</p>
                    </div>

                    {/* Purchases for Gift Card */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            عدد الشراءات للحصول على بطاقة
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={settings.purchasesForGiftCard}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    purchasesForGiftCard: parseInt(e.target.value),
                                })
                            }
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">مثال: 10 يعني بطاقة بعد كل 10 عمليات شراء</p>
                    </div>

                    {/* Auto Enable */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="enableAuto"
                            checked={settings.enableAutoGiftCards}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    enableAutoGiftCards: e.target.checked,
                                })
                            }
                            className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                        />
                        <label htmlFor="enableAuto" className="text-sm font-medium text-slate-300">
                            تفعيل البطاقات الهدايا التلقائية بناءً على الشراءات
                        </label>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${
                            message.includes('✅')
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleUpdateSettings}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                        حفظ الإعدادات
                    </button>
                </div>
            </div>

            {/* Add New Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة بطاقة هدية جديدة
                </h3>

                {!showAddForm ? (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                        إضافة بطاقة جديدة
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                البريد الإلكتروني للعميل
                            </label>
                            <input
                                type="email"
                                value={newCard.customerEmail}
                                onChange={(e) => setNewCard({ ...newCard, customerEmail: e.target.value })}
                                placeholder="customer@example.com"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                قيمة البطاقة ($)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={newCard.value}
                                onChange={(e) => setNewCard({ ...newCard, value: parseInt(e.target.value) })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAddGiftCard}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                            >
                                إضافة
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Cards List */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    البطاقات الموجودة ({giftCards.length})
                </h3>

                {giftCards.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">لا توجد بطاقات هدايا</p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {giftCards.map((card) => (
                            <div
                                key={card.id}
                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                    card.used
                                        ? 'bg-slate-700/30 border-slate-600'
                                        : 'bg-green-500/10 border-green-500/50'
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="font-semibold text-white">{card.customerName}</div>
                                    <div className="text-xs text-slate-400">{card.customerEmail}</div>
                                </div>

                                <div className="text-right mr-4">
                                    <div className="font-bold text-white">${card.value}</div>
                                    <div className={`text-xs ${
                                        card.used ? 'text-slate-400' : 'text-green-400'
                                    }`}>
                                        {card.used ? 'مستخدمة' : 'متاحة'}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
