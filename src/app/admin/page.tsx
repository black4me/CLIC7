'use client';
import { DollarSign, ShoppingBag, Star, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const { orders } = useStore();
    const [stats, setStats] = useState({
        revenue: 0,
        pendingOrders: 0,
        customers: 0
    });

    // Calculate Real-Time Stats
    useEffect(() => {
        const completedOrders = orders.filter(o => o.status === 'Completed');
const revenue = completedOrders.reduce((acc, curr) => {
            const totalValue = typeof curr.total === 'number' ? curr.total : parseFloat(curr.total ?? '0');
            return acc + (isNaN(totalValue) ? 0 : totalValue);
        }, 0);

        const pending = orders.filter(o => o.status === 'Pending').length;
        const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;

        setStats({
            revenue,
            pendingOrders: pending,
            customers: uniqueCustomers
        });
    }, [orders]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black">لوحة القيادة</h1>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <div className="text-gray-400 text-sm font-mono">LIVE DATA</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-colors"
                >
                    <div>
                        <p className="text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">إجمالي المبيعات</p>
                        <h3 className="text-4xl font-black flex items-baseline gap-1 text-white group-hover:text-primary transition-colors">
                            {stats.revenue.toFixed(3)} <span className="text-xs font-normal text-gray-500">OMR</span>
                        </h3>
                    </div>
                    <div className="p-4 rounded-xl bg-green-400/10 text-green-400">
                        <DollarSign size={24} />
                    </div>
                </motion.div>

                {/* Pending Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-yellow-500/50 transition-colors"
                >
                    <div>
                        <p className="text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">طلبات معلقة</p>
                        <h3 className="text-4xl font-black flex items-baseline gap-1 text-white group-hover:text-yellow-500 transition-colors">
                            {stats.pendingOrders} <span className="text-xs font-normal text-gray-500">طلب</span>
                        </h3>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-400/10 text-yellow-400 relative">
                        <ShoppingBag size={24} />
                        {stats.pendingOrders > 0 && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1A1A1A]"></div>
                        )}
                    </div>
                </motion.div>

                {/* Customers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 transition-colors"
                >
                    <div>
                        <p className="text-gray-400 text-sm font-bold mb-1 uppercase tracking-wider">العملاء</p>
                        <h3 className="text-4xl font-black flex items-baseline gap-1 text-white group-hover:text-blue-500 transition-colors">
                            {stats.customers} <span className="text-xs font-normal text-gray-500">مشترك</span>
                        </h3>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-400/10 text-blue-400">
                        <Users size={24} />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Custom CSS Chart Section */}
                <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="text-primary" />
                            تحليل المبيعات (Live)
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors">أسبوعي</button>
                            <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold">يومي</button>
                        </div>
                    </div>

                    {/* Custom CSS Bar Chart */}
                    <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-600 pointer-events-none pb-6">
                            <span>100 OMR</span>
                            <span>75 OMR</span>
                            <span>50 OMR</span>
                            <span>25 OMR</span>
                            <span>0 OMR</span>
                        </div>

                        {/* Mock Data Bars (simulating last 7 days) */}
                        {[35, 60, 25, 80, 50, 90, 45].map((height, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 z-10 w-full group">
                                <div className="relative w-full bg-white/5 rounded-t-lg h-full flex items-end group-hover:bg-white/10 transition-colors overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                                        className="w-full bg-gradient-to-t from-primary/50 to-primary relative"
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {height} OMR
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-xs text-gray-500 font-bold">
                                    {new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 flex flex-col">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Star className="text-yellow-400" />
                        آخر التحديثات
                    </h2>
                    <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar space-y-4 pr-2">
                        {orders.slice(0, 5).reverse().map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${order.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {order.customerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-200">{order.customerName}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {order.status === 'Completed' ? <ArrowUpRight size={10} className="text-green-500" /> : <ArrowDownRight size={10} className="text-yellow-500" />}
                                            {order.items && order.items.length > 0 ? order.items[0].title : 'Order'}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-sm text-primary">
                                    {typeof order.total === 'number' ? order.total.toFixed(3) : order.total}
                                </span>
                            </motion.div>
                        ))}
                        {orders.length === 0 && (
                            <div className="text-center text-gray-500 py-10">
                                لا توجد بيانات للنشاط الحديث
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
