'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Download, Receipt, Medal } from 'lucide-react';

interface Order {
    id: string;
    customerId: string;
    game: string;
    gameType: string;
    price: number;
    discountApplied?: number;
    discountCode?: string;
    giftCardUsed?: number;
    date: string;
    points?: number; // Loyalty points earned (1 OMR = 3 points)
}

export default function PurchasesPage() {
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
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
        const customerOrders = allOrders.filter((o: Order) => o.customerId === customer.id);
        setOrders(customerOrders.reverse()); // Most recent first

        setLoading(false);
    }, [router]);

    const handleDownloadReceipt = (order: Order) => {
        const receiptContent = `
╔════════════════════════════════════════╗
║          إيصال الشراء - CLIC7          ║
╚════════════════════════════════════════╝

رقم الطلب: ${order.id}
التاريخ: ${new Date(order.date).toLocaleDateString('ar-SA')}
العميل: ${customer.name}
البريد: ${customer.email}

─────────────────────────────────────────
المنتج
─────────────────────────────────────────

اللعبة: ${order.game}
النوع: ${order.gameType}
السعر الأصلي: $${order.price.toFixed(2)}

─────────────────────────────────────────
الخصومات والتطبيقات
─────────────────────────────────────────

${order.discountApplied ? `الخصم (${order.discountCode || 'بدون كود'}): -$${order.discountApplied.toFixed(2)}` : 'بدون خصومات'}
${order.giftCardUsed ? `بطاقة هدية مستخدمة: -$${order.giftCardUsed.toFixed(2)}` : 'بدون بطاقات هدايا'}

─────────────────────────────────────────
الإجمالي النهائي
─────────────────────────────────────────

${order.discountApplied || order.giftCardUsed
            ? `المبلغ المدفوع: $${(order.price - (order.discountApplied || 0) - (order.giftCardUsed || 0)).toFixed(2)}`
            : `$${order.price.toFixed(2)}`
        }

════════════════════════════════════════
شكراً لتسوقك في CLIC7
════════════════════════════════════════
        `;

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
        element.setAttribute('download', `receipt-${order.id}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading || !customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>جاري تحميل سجل الشراء...</p>
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
                <h1 className="text-4xl font-bold text-white mb-2">سجل الشراء</h1>
                <p className="text-slate-400 mb-8">عرض جميع عمليات الشراء والإيصالات</p>

                {orders.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                        <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">لا توجد عمليات شراء</h3>
                        <p className="text-slate-400 mb-6">لم تقم بأي عمليات شراء حتى الآن</p>
                        <Link
                            href="/games"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                        >
                            تصفح الألعاب
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">إجمالي الطلبات</div>
                                <div className="text-3xl font-bold text-white">{orders.length}</div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">إجمالي الإنفاق</div>
                                <div className="text-3xl font-bold text-white">
                                    ${orders.reduce((sum, o) => sum + o.price, 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">إجمالي الخصومات</div>
                                <div className="text-3xl font-bold text-green-400">
                                    -${orders.reduce((sum, o) => sum + (o.discountApplied || 0) + (o.giftCardUsed || 0), 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/50 rounded-lg p-4">
                                <div className="text-amber-400 text-sm mb-1">نقاط الولاء المكتسبة</div>
                                <div className="text-3xl font-bold text-amber-400">
                                    {orders.reduce((sum, o) => sum + (o.points || 0), 0)}
                                </div>
                                <div className="text-xs text-amber-500/70 mt-1">1 OMR = 3 نقاط</div>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Left Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{order.game}</h3>
                                                    <div className="flex gap-4 mt-1 text-sm text-slate-400">
                                                        <span>النوع: {order.gameType}</span>
                                                        <span>•</span>
                                                        <span>{new Date(order.date).toLocaleDateString('ar-SA')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Applied Discounts */}
                                            {(order.discountApplied || order.giftCardUsed) && (
                                                <div className="mt-3 space-y-1">
                                                    {order.discountApplied && (
                                                        <div className="text-sm text-green-400">
                                                            ✓ خصم {order.discountCode || 'مطبق'}: -${order.discountApplied.toFixed(2)}
                                                        </div>
                                                    )}
                                                    {order.giftCardUsed && (
                                                        <div className="text-sm text-purple-400">
                                                            ✓ بطاقة هدية مستخدمة: -${order.giftCardUsed.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Points Earned Badge */}
                                            {order.points && order.points > 0 && (
                                                <div className="mt-3">
                                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold">
                                                        <Medal className="w-4 h-4" />
                                                        <span>+{order.points} نقطة</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Info */}
                                        <div className="flex flex-col items-end gap-3 md:items-end">
                                            <div>
                                                {order.discountApplied || order.giftCardUsed ? (
                                                    <>
                                                        <div className="text-sm text-slate-400 line-through">
                                                            ${order.price.toFixed(2)}
                                                        </div>
                                                        <div className="text-2xl font-bold text-green-400">
                                                            ${(order.price - (order.discountApplied || 0) - (order.giftCardUsed || 0)).toFixed(2)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-2xl font-bold text-white">
                                                        ${order.price.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => handleDownloadReceipt(order)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>تحميل الإيصال</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order ID */}
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <span className="text-xs text-slate-500">رقم الطلب: {order.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
