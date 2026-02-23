'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gift, ArrowRight, Medal, TrendingUp } from 'lucide-react';

interface GiftCard {
    id: string;
    earnedDate: string;
    value: number;
    status: 'available' | 'used';
    usedDate?: string;
}

interface LoyaltyData {
    purchases: Array<{ date: string; game: string; points?: number }>;
    giftCards: GiftCard[];
    totalPurchases: number;
    pointsTowardNextCard: number;
    totalPoints: number; // Total loyalty points earned
}

export default function LoyaltyPage() {
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [loyalty, setLoyalty] = useState<LoyaltyData>({
        purchases: [],
        giftCards: [],
        totalPurchases: 0,
        pointsTowardNextCard: 0,
        totalPoints: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentCustomer = localStorage.getItem('clic7_current_customer');
        if (!currentCustomer) {
            router.push('/login');
            return;
        }

        const customer = JSON.parse(currentCustomer);
        setCustomer(customer);

        // Get customer orders
        const allOrders = JSON.parse(localStorage.getItem('clic7_orders') || '[]');
        const customerOrders = allOrders.filter((o: any) => o.customerId === customer.id);

        const totalPurchases = customerOrders.length;
        const pointsTowardNextCard = totalPurchases % 10;
        const totalPoints = customerOrders.reduce((sum: number, order: any) => sum + (order.points || 0), 0);

        // Get or initialize gift cards
        const giftCardStorage = JSON.parse(localStorage.getItem('clic7_gift_cards') || '[]');
        const customerGiftCards = giftCardStorage.filter((gc: any) => gc.customerId === customer.id);

        // Convert to display format
        const formattedGiftCards: GiftCard[] = customerGiftCards.map((gc: any, idx: number) => ({
            id: `gc-${customer.id}-${idx}`,
            earnedDate: gc.earnedDate || new Date().toISOString(),
            value: gc.value || 30,
            status: gc.used ? 'used' : 'available',
            usedDate: gc.usedDate,
        }));

        setLoyalty({
            purchases: customerOrders.map((o: any) => ({ date: o.date, game: o.game, points: o.points })),
            giftCards: formattedGiftCards,
            totalPurchases,
            pointsTowardNextCard,
            totalPoints,
        });

        setLoading(false);
    }, [router]);

    const availableCards = loyalty.giftCards.filter(gc => gc.status === 'available');
    const usedCards = loyalty.giftCards.filter(gc => gc.status === 'used');
    const nextCardEarnedAt = 10;
    const purchasesUntilNextCard = nextCardEarnedAt - loyalty.pointsTowardNextCard;

    if (loading || !customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>جاري تحميل نظام الولاء...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-blue-400">
                        CLIC7
                    </Link>
                    <Link
                        href="/customer/dashboard"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>العودة</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-white mb-2">نظام الولاء CLIC7</h1>
                <p className="text-slate-400 mb-8">تتبع نقاطك وبطاقاتك الهدايا</p>

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* Purchases */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm opacity-90">إجمالي الشراءات</span>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="text-4xl font-bold">{loyalty.totalPurchases}</div>
                        <p className="text-sm opacity-75 mt-2">عملية شراء</p>
                    </div>

                    {/* Total Points Earned */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm opacity-90">إجمالي النقاط</span>
                            <Medal className="w-5 h-5" />
                        </div>
                        <div className="text-4xl font-bold">{loyalty.totalPoints.toLocaleString()}</div>
                        <p className="text-sm opacity-75 mt-2">نقطة ولاء</p>
                    </div>

                    {/* Available Gift Cards */}
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm opacity-90">بطاقات متاحة</span>
                            <Gift className="w-5 h-5" />
                        </div>
                        <div className="text-4xl font-bold">{availableCards.length}</div>
                        <p className="text-sm opacity-75 mt-2">
                            ${(availableCards.length * 30).toFixed(2)} قيمة إجمالية
                        </p>
                    </div>

                    {/* Points Progress */}
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm opacity-90">تقدم البطاقة</span>
                            <Medal className="w-5 h-5" />
                        </div>
                        <div className="text-4xl font-bold">{loyalty.pointsTowardNextCard}/10</div>
                        <p className="text-sm opacity-75 mt-2">
                            {purchasesUntilNextCard === 0 ? '🎉 بطاقة جديدة!' : `${purchasesUntilNextCard} شراء متبقي`}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">التقدم نحو البطاقة التالية</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">
                                {loyalty.pointsTowardNextCard} من 10 نقاط
                            </span>
                            <span className="text-slate-300">
                                {Math.round((loyalty.pointsTowardNextCard / 10) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                    purchasesUntilNextCard === 0 ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{
                                    width: `${(loyalty.pointsTowardNextCard / 10) * 100}%`,
                                }}
                            ></div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">
                            {purchasesUntilNextCard === 0
                                ? '🎉 مبروك! أنت تستحق بطاقة هدية جديدة بقيمة $30!'
                                : `شتري ${purchasesUntilNextCard} ${purchasesUntilNextCard === 1 ? 'لعبة' : 'ألعاب'} أخرى لتحصل على بطاقة هدية`}
                        </p>
                    </div>
                </div>

                {/* Gift Cards Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Available Cards */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Gift className="w-6 h-6 text-green-400" />
                            البطاقات المتاحة ({availableCards.length})
                        </h2>

                        {availableCards.length === 0 ? (
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                                <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">لم تحصل على أي بطاقات هدايا بعد</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/50 rounded-lg p-4 hover:border-green-400/80 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-slate-400">البطاقة الهدية</div>
                                                <div className="text-xl font-bold text-white">
                                                    ${card.value.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    تاريخ الحصول: {new Date(card.earnedDate).toLocaleDateString('ar-SA')}
                                                </div>
                                            </div>
                                            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                                                متاحة
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Used Cards */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Medal className="w-6 h-6 text-slate-400" />
                            البطاقات المستخدمة ({usedCards.length})
                        </h2>

                        {usedCards.length === 0 ? (
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                                <Medal className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">لم تستخدم أي بطاقات هدايا بعد</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {usedCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-slate-400">البطاقة الهدية</div>
                                                <div className="text-xl font-bold text-slate-300">
                                                    ${card.value.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    تاريخ الاستخدام:{' '}
                                                    {card.usedDate ? new Date(card.usedDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                                                </div>
                                            </div>
                                            <div className="bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full text-sm font-semibold">
                                                مستخدمة
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Purchases */}
                <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">آخر الشراءات</h2>

                    {loyalty.purchases.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">لا توجد عمليات شراء بعد</p>
                    ) : (
                        <div className="space-y-2">
                            {loyalty.purchases.reverse().slice(0, 10).map((purchase, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg text-sm"
                                >
                                    <span className="text-white font-medium">{purchase.game}</span>
                                    <div className="flex items-center gap-4">
                                        {purchase.points && purchase.points > 0 && (
                                            <span className="text-amber-400 font-semibold">+{purchase.points} نقطة</span>
                                        )}
                                        <span className="text-slate-400">
                                            {new Date(purchase.date).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* How It Works */}
                <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">كيف يعمل نظام الولاء؟</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">1 OMR</div>
                            <p className="text-slate-300 text-sm">مبلغ الشراء</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-2xl text-blue-400">=</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-amber-400 mb-2">3</div>
                            <p className="text-slate-300 text-sm">نقاط ولاء</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-2xl text-blue-400">+</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">10</div>
                            <p className="text-slate-300 text-sm">شراءات = بطاقة $30</p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-4 text-center">
                        احصل على 3 نقاط لكل 1 OMR تنفقه، واحصل على بطاقة هدية بقيمة $30 مع كل 10 عمليات شراء
                    </p>
                </div>
            </div>
        </div>
    );
}
