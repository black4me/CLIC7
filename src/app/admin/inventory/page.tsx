"use client";

import { useState, useEffect } from 'react';
import {
    Package,
    Search,
    AlertTriangle,
    CheckCircle2,
    Plus,
    RefreshCcw,
    ArrowUpRight,
    Filter,
    Gamepad2,
    Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface InventoryItem {
    gameId: string;
    gameName: string;
    platform: string;
    total: number;
    available: number;
    sold: number;
    reserved: number;
    lowStock: boolean;
}

interface InventoryStats {
    total: number;
    available: number;
    sold: number;
    reserved: number;
}

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'low'>('all');

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/gamekeys/inventory');
            const data = await res.json();

            if (data.success) {
                setInventory(data.data.inventory);
                setStats(data.data.totals);
            } else {
                toast.error(data.error || 'Failed to fetch inventory');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.gameName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || item.lowStock;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        إدارة المخزون
                    </h1>
                    <p className="text-gray-400 mt-2">مراقبة وإدارة مفاتيح الألعاب وتوفر المنتجات</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4"
                >
                    <button
                        onClick={fetchInventory}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5" />
                        إضافة مفاتيح جديدة
                    </button>
                </motion.div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'إجمالي المفاتيح', value: stats?.total || 0, icon: Package, color: 'blue' },
                    { label: 'متاح للبيع', value: stats?.available || 0, icon: CheckCircle2, color: 'green' },
                    { label: 'تم بيعها', value: stats?.sold || 0, icon: ArrowUpRight, color: 'purple' },
                    { label: 'نقص المخزون', value: inventory.filter(i => i.lowStock).length, icon: AlertTriangle, color: 'red' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/10 blur-3xl`} />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                                <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 bg-${stat.color}-500/20 rounded-xl`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="البحث عن منتج..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === 'all' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${filter === 'low' ? 'bg-red-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        نقص المخزون
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-gray-400 font-medium">المنتج</th>
                                <th className="px-6 py-4 text-gray-400 font-medium">المنصة</th>
                                <th className="px-6 py-4 text-gray-400 font-medium">المتاح</th>
                                <th className="px-6 py-4 text-gray-400 font-medium">المباع</th>
                                <th className="px-6 py-4 text-gray-400 font-medium">المحجوز</th>
                                <th className="px-6 py-4 text-gray-400 font-medium">الحالة</th>
                                <th className="px-6 py-4 text-gray-400 font-medium">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <RefreshCcw className="w-10 h-10 animate-spin mx-auto text-blue-500 mb-4" />
                                            <p className="text-gray-400">جاري تحميل البيانات...</p>
                                        </td>
                                    </tr>
                                ) : filteredInventory.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                                            لا توجد بيانات تطابق بحثك
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInventory.map((item, idx) => (
                                        <motion.tr
                                            key={`${item.gameId}-${item.platform}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-white/5 hover:bg-white/10 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                        <Gamepad2 className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{item.gameName}</p>
                                                        <p className="text-xs text-gray-500">{item.gameId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Monitor className="w-4 h-4" />
                                                    {item.platform}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-lg">
                                                {item.available}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {item.sold}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {item.reserved}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.available === 0 ? (
                                                    <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20">نفذت الكمية</span>
                                                ) : item.lowStock ? (
                                                    <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-bold border border-orange-500/20">كمية منخفضة</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">متوفر</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-500 hover:text-blue-400 font-medium text-sm transition-colors">
                                                    عرض التفاصيل
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
