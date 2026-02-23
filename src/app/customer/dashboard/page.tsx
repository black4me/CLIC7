'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Gift, TrendingUp, LogOut, Settings, History, Medal } from 'lucide-react';

interface Customer {
    id: string;
    email: string;
    name: string;
    phone: string;
}

interface Order {
    id: string;
    customerId: string;
    game: string;
    gameType: string;
    price: number;
    discountApplied?: number;
    giftCardUsed?: number;
    date: string;
    points?: number; // Loyalty points earned (1 OMR = 3 points)
}

interface LoyaltyInfo {
    totalPurchases: number;
    totalSpent: number;
    giftCardsEarned: number;
    giftCardsUsed: number;
    purchasesTowardsNextCard: number;
    totalPoints: number; // Total loyalty points earned (1 OMR = 3 points)
}

export default function CustomerDashboard() {
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loyalty, setLoyalty] = useState<LoyaltyInfo>({
        totalPurchases: 0,
        totalSpent: 0,
        giftCardsEarned: 0,
        giftCardsUsed: 0,
        purchasesTowardsNextCard: 0,
        totalPoints: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const currentCustomer = localStorage.getItem('clic7_current_customer');
            if (!currentCustomer) {
                router.push('/login');
                return;
            }

            const parsedCustomer = JSON.parse(currentCustomer);
            if (!parsedCustomer || !parsedCustomer.id) {
                console.error('Invalid customer data in localStorage');
                localStorage.removeItem('clic7_current_customer');
                router.push('/login');
                return;
            }

            setCustomer(parsedCustomer);

            // Get customer orders and calculate loyalty
            const allOrders = JSON.parse(localStorage.getItem('clic7_orders') || '[]');
            const customerOrders = allOrders.filter((o: Order) => o?.customerId === parsedCustomer?.id);
            setRecentOrders(customerOrders.slice(-5)); // Last 5 orders

            // Calculate loyalty info
            const totalPurchases = customerOrders.length;
            const totalSpent = customerOrders.reduce((sum: number, order: Order) => sum + (order?.price || 0), 0);
            const giftCardsEarned = Math.floor(totalPurchases / 10);
            const purchasesTowardsNextCard = totalPurchases % 10;
            const totalPoints = customerOrders.reduce((sum: number, order: Order) => sum + ((order as any)?.points || 0), 0);

            // Get gift card usage from payments
            const payments = JSON.parse(localStorage.getItem('clic7_payments') || '[]');
            const customerPayments = payments.filter((p: any) => p?.customerId === parsedCustomer?.id);
            const giftCardsUsed = customerPayments.filter((p: any) => p?.paymentMethod === 'giftCard').length;

            setLoyalty({
                totalPurchases,
                totalSpent,
                giftCardsEarned,
                giftCardsUsed,
                purchasesTowardsNextCard,
                totalPoints,
            });
        } catch (error) {
            console.error('Error loading customer dashboard:', error);
            localStorage.removeItem('clic7_current_customer');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('clic7_current_customer');
        router.push('/login');
    };

    if (loading || !customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>جاري تحميل لوحة التحكم...</p>
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">مرحباً، {customer.name}</h1>
                    <p className="text-slate-400">{customer.email}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {/* Total Spent */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">إجمالي الإنفاق</span>
                            <ShoppingCart className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            ${loyalty.totalSpent.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{loyalty.totalPurchases} عملية شراء</p>
                    </div>

                    {/* Total Loyalty Points */}
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/50 rounded-lg p-6 hover:border-amber-400/80 transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-amber-400 text-sm">إجمالي النقاط</span>
                            <Medal className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-3xl font-bold text-amber-400">
                            {loyalty.totalPoints.toLocaleString()}
                        </div>
                        <p className="text-xs text-amber-500/70 mt-1">1 OMR = 3 نقاط</p>
                    </div>

                    {/* Loyalty Points Progress */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">تقدم البطاقة</span>
                            <Medal className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {loyalty.purchasesTowardsNextCard}/10
                        </div>
                        <p className="text-xs text-slate-500 mt-1">حتى الحصول على بطاقة هدية</p>
                    </div>

                    {/* Gift Cards Earned */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-green-500/50 transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">بطاقات هدايا</span>
                            <Gift className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {loyalty.giftCardsEarned - loyalty.giftCardsUsed}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {loyalty.giftCardsEarned} مكتسبة - {loyalty.giftCardsUsed} مستخدمة
                        </p>
                    </div>

                    {/* Discount Usage */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">الخصومات</span>
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            ${recentOrders
                                .reduce((sum, order) => sum + (order.discountApplied || 0), 0)
                                .toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">موفر من الخصومات</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Link
                        href="/customer/purchases"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center gap-3 transition"
                    >
                        <History className="w-6 h-6" />
                        <div>
                            <div className="font-semibold">سجل الشراء</div>
                            <div className="text-sm text-blue-100">عرض كل عمليات الشراء والإيصالات</div>
                        </div>
                    </Link>

                    <Link
                        href="/customer/loyalty"
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-4 flex items-center gap-3 transition"
                    >
                        <Medal className="w-6 h-6" />
                        <div>
                            <div className="font-semibold">نظام الولاء</div>
                            <div className="text-sm text-amber-100">تتبع بطاقاتك الهدايا</div>
                        </div>
                    </Link>

                    <Link
                        href="/customer/settings"
                        className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-4 flex items-center gap-3 transition"
                    >
                        <Settings className="w-6 h-6" />
                        <div>
                            <div className="font-semibold">الإعدادات</div>
                            <div className="text-sm text-slate-300">تحديث البيانات الشخصية</div>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">آخر عمليات الشراء</h2>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-400">لا توجد عمليات شراء حتى الآن</p>
                            <Link href="/games" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                                ابدأ التسوق الآن
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentOrders.reverse().map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                                >
                                    <div className="flex-1">
                                        <div className="font-semibold text-white">{order.game}</div>
                                        <div className="text-xs text-slate-400">
                                            {order.gameType} • {new Date(order.date).toLocaleDateString('ar-SA')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-white">${order.price.toFixed(2)}</div>
                                        {order.discountApplied && (
                                            <div className="text-xs text-green-400">
                                                -{order.discountApplied.toFixed(2)}$ خصم
                                            </div>
                                        )}
                                        {order.giftCardUsed && (
                                            <div className="text-xs text-purple-400">
                                                -{order.giftCardUsed.toFixed(2)}$ بطاقة هدية
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loyalty Progress */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">الطريق إلى بطاقتك الهدية التالية</h3>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm">
                            {loyalty.purchasesTowardsNextCard} من 10 عمليات شراء
                        </span>
                        <span className="text-sm font-semibold">
                            {Math.round((loyalty.purchasesTowardsNextCard / 10) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-blue-900 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-green-400 h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${(loyalty.purchasesTowardsNextCard / 10) * 100}%`,
                            }}
                        ></div>
                    </div>
                    <p className="text-sm text-blue-100 mt-3">
                        {10 - loyalty.purchasesTowardsNextCard === 0
                            ? '🎉 مبروك! تم كسب بطاقة هدية جديدة!'
                            : `${10 - loyalty.purchasesTowardsNextCard} عملية شراء متبقية`}
                    </p>
                </div>
            </div>
        </div>
    );
}
