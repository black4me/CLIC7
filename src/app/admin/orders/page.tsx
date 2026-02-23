'use client';

import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import { toast, Toaster } from 'sonner';
import { useStore } from '@/context/StoreContext';
import { sendOrderApprovalEmail } from '@/app/actions/email';

export default function AdminOrdersPage() {
    const { orders, updateOrder, settings } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (id: string, newStatus: any, productKeys: string[] = []) => {
        updateOrder(id, { status: newStatus, productKeys });
        if (newStatus === 'Completed') {
            const order = orders.find(o => o.id === id);
            if (order) {
                const whatsappNumber = settings.contact.whatsapp;
                // Trigger automated Steam-style email
                try {
                    await sendOrderApprovalEmail(order, productKeys, whatsappNumber);
                    toast.success(`تم تحديث الطلب ${id}`, {
                        description: `تم إرسال المفتاح إلى العميل ${order.customerName} عبر البريد الإلكتروني بنجاح. (Email sent successfully)`
                    });
                } catch (err) {
                    console.error('Email trigger failed:', err);
                    toast.error('فشل إرسال البريد الإلكتروني', {
                        description: 'يرجى التحقق من سجلات النظام.'
                    });
                }
            }
        }
    };

    const statusColors = {
        Completed: 'bg-green-500/20 text-green-400',
        Pending: 'bg-yellow-500/20 text-yellow-400',
        Cancelled: 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="max-w-5xl mx-auto">
            <Toaster position="top-center" theme="dark" />
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-black">سجل الطلبات</h1>

                <div className="relative w-full md:w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="بحث برقم الطلب أو اسم العميل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:border-primary outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-black/50 text-gray-400">
                        <tr>
                            <th className="p-4">رقم الطلب</th>
                            <th className="p-4">العميل</th>
                            <th className="p-4">التاريخ</th>
                            <th className="p-4">الإجمالي</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    لا توجد طلبات حتى الآن.
                                </td>
                            </tr>
                        ) : filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 font-mono font-bold text-gray-300">{order.id}</td>
                                <td
                                    className="p-4 font-bold cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    {order.customerName}
                                </td>
                                <td className="p-4 text-gray-400 text-sm">{order.date}</td>
                                <td className="p-4 text-primary font-bold">{(order.total ?? 0).toFixed(3)} OMR</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${statusColors[order.status as keyof typeof statusColors]}`}>
                                        {order.status === 'Completed' && <CheckCircle size={12} />}
                                        {order.status === 'Pending' && <Clock size={12} />}
                                        {order.status === 'Cancelled' && <XCircle size={12} />}

                                        {order.status === 'Completed' && 'مكتمل'}
                                        {order.status === 'Pending' && 'معلق'}
                                        {order.status === 'Cancelled' && 'ملغي'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors" title="عرض التفاصيل"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {order.status === 'Pending' && (
                                            <button
                                                onClick={() => handleStatusChange(order.id, 'Completed')}
                                                className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors" title="تحديد كمكتمل"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && orders.length > 0 && (
                    <div className="p-8 text-center text-gray-500">
                        لا توجد طلبات تطابق بحثك
                    </div>
                )}
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onVerify={(id: string, keys: string[]) => {
                        handleStatusChange(id, 'Completed', keys);
                        setSelectedOrder(null);
                    }}
                    onReject={(id: string) => {
                        handleStatusChange(id, 'Cancelled');
                        toast.error(`تم رفض الطلب ${id}`, { description: 'تم إشعار العميل بسبب الرفض.' });
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
}
