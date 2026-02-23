'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Bell, Search, Mail, Phone, Calendar, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPreOrdersPage() {
    const { preOrders } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = preOrders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNotify = (customerName: string, email: string) => {
        const arabicTemplate = `
مرحباً ${customerName}،

يسرنا إبلاغك بأن لعبة "${filteredOrders.find(o => o.email === email)?.gameTitle}" التي قمت بطلبها مسبقاً أصبحت متوفرة الآن!

يمكنك إتمام عملية الشراء عبر موقعنا:
https://clic7.com

شكراً لثقتك بنا،
فريق CLIC7
        `.trim();

        navigator.clipboard.writeText(arabicTemplate);

        // Open Mailto
        window.location.href = `mailto:${email}?subject=CLIC7: اللعبة التي طلبتها توفرت الآن!&body=${encodeURIComponent(arabicTemplate)}`;

        toast.success(`تم نسخ الرسالة وفتح تطبيق البريد لـ ${customerName}`);
    };

    return (
        <div className="p-8 lg:p-12 text-white min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Bell className="text-primary" size={40} />
                            الطلبات المسبقة
                        </h1>
                        <p className="text-gray-400">إدارة طلبات الحجز المسبق وإشعار العملاء</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="بحث باسم العميل، اللعبة، أو البريد..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:border-primary outline-none"
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-black/40 text-gray-400 font-bold text-sm uppercase">
                                <tr>
                                    <td className="p-6 rounded-tr-2xl">العميل</td>
                                    <td className="p-6">اللعبة</td>
                                    <td className="p-6">معلومات الاتصال</td>
                                    <td className="p-6">التاريخ</td>
                                    <td className="p-6 rounded-tl-2xl">إجراءات</td>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            لا توجد طلبات مسبقة حالياً
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-bold text-white mb-1">{order.customerName}</div>
                                                <div className="text-xs text-gray-500 font-mono">{order.transactionId}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                                        <Gamepad2 size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{order.gameTitle}</div>
                                                        <div className="text-xs text-green-400 font-mono">{order.price.toFixed(3)} OMR</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Mail size={14} className="text-primary" />
                                                    {order.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Phone size={14} className="text-green-500" />
                                                    {order.phone}
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm text-gray-400 font-mono">
                                                {new Date(order.date).toLocaleDateString('en-US')}
                                            </td>
                                            <td className="p-6">
                                                <button
                                                    onClick={() => handleNotify(order.customerName, order.email)}
                                                    className="bg-primary hover:bg-white hover:text-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                                                >
                                                    <Bell size={16} />
                                                    تنبيه العميل
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
