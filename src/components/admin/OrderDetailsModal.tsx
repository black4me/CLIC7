import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, ShoppingBag, Clock, Key, ZoomIn, Download, FileX, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/context/StoreContext';
import Image from 'next/image';

interface OrderDetailsModalProps {
    order: Order | null;
    onClose: () => void;
    onVerify: (id: string, keys: string[]) => void;
    onReject: (id: string) => void;
}

export default function OrderDetailsModal({ order, onClose, onVerify, onReject }: OrderDetailsModalProps) {
    const [keys, setKeys] = useState<string[]>([]);
    const [imageError, setImageError] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (order) {
            setKeys(order.productKeys || order.items.map(() => ''));
            setImageError(false);
        }
    }, [order]);

    if (!order) return null;

    const handleKeyChange = (index: number, value: string) => {
        const newKeys = [...keys];
        newKeys[index] = value;
        setKeys(newKeys);
    };

    // Helper function to get full image URL with cache busting
    // Uses Supabase Storage getPublicUrl pattern with timestamp to bypass browser caching
    const getReceiptUrl = (url?: string): string => {
        if (!url) return '';

        // Cache-busting timestamp for real-time upload display
        const timestamp = `?t=${Date.now()}`;

        // If it's already an absolute URL, append cache buster
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
            // Don't add timestamp to blob URLs (they're already unique)
            if (url.startsWith('blob:')) {
                return url;
            }
            return `${url}${timestamp}`;
        }

        // If it's a relative URL from Supabase storage (starts with 'receipts/')
        if (url.startsWith('receipts/')) {
            // Map to Supabase Storage public URL format with cache busting
            const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${url}`;
            return `${baseUrl}${timestamp}`;
        }

        // If it's a relative URL, prepend the origin with cache buster
        if (url.startsWith('/')) {
            return `${window.location.origin}${url}${timestamp}`;
        }

        return url;
    };

    // Handle download receipt
    const handleDownload = async () => {
        if (!order.receiptUrl || imageError) return;

        setIsDownloading(true);
        try {
            const fullUrl = getReceiptUrl(order.receiptUrl);
            const response = await fetch(fullUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-${order.id}-${new Date().toISOString().split('T')[0]}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(getReceiptUrl(order.receiptUrl), '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    const receiptUrl = getReceiptUrl(order.receiptUrl);
    const hasReceipt = order.receiptUrl && !imageError;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 sticky top-0 backdrop-blur-md z-10">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingBag className="text-primary" />
                            تفاصيل الطلب <span className="font-mono text-gray-400">{order.id}</span>
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <User size={16} /> العميل
                                </div>
                                <div className="font-bold">{order.customerName}</div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <Phone size={16} /> الهاتف
                                </div>
                                <div className="font-mono text-sm" dir="ltr">{order.phone || 'غير مسجل'}</div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <Mail size={16} /> البريد
                                </div>
                                <div className="font-mono text-sm break-all">{order.email || 'غير مسجل'}</div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="font-bold mb-4 text-gray-300">المنتجات</h3>
                            <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-white/5 text-gray-400">
                                        <tr>
                                            <th className="p-3">المنتج</th>
                                            <th className="p-3">السعر</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {order.items?.map((item, index) => (
                                            <tr key={item.id || index}>
                                                <td className="p-3 font-medium text-white flex items-center gap-2">
                                                    {item.image &&
                                                        <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                                                        </div>
                                                    }
                                                    {item.title}
                                                </td>
                                                <td className="p-3 font-mono text-primary">{(item.price ?? 0).toFixed(3)} OMR</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-white/5 bg-white/5">
                                        <tr>
                                            <td className="p-3 font-bold">الإجمالي</td>
                                            <td className="p-3 font-mono font-bold text-lg text-primary">
                                                {(order.total > 0
                                                    ? order.total
                                                    : order.items.reduce((sum, item) => sum + (item.price || 0), 0)
                                                ).toFixed(3)} OMR
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Receipt Verification Section */}
                        {order.status !== 'Completed' && (
                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                                <h3 className="font-bold text-yellow-500 mb-3 flex items-center gap-2">
                                    <Clock size={16} /> إيصال الدفع (للمراجعة)
                                </h3>
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Receipt Image Container */}
                                    <div className="w-full md:w-48 md:h-48 bg-black/50 rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden group">
                                        {hasReceipt ? (
                                            <>
                                                {/* Use regular img for external/blob URLs */}
                                                {receiptUrl.startsWith('blob:') || receiptUrl.startsWith('http') ? (
                                                    <img
                                                        src={receiptUrl}
                                                        alt="Receipt"
                                                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => setShowPreview(true)}
                                                        onError={() => setImageError(true)}
                                                    />
                                                ) : (
                                                    <Image
                                                        src={receiptUrl}
                                                        alt="Receipt"
                                                        fill
                                                        className="object-contain cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => setShowPreview(true)}
                                                        onError={() => setImageError(true)}
                                                    />
                                                )}
                                                {/* Hover overlay with zoom icon */}
                                                <div
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    onClick={() => setShowPreview(true)}
                                                >
                                                    <ZoomIn size={32} className="text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                                                <FileX size={40} className="mb-2" />
                                                <span className="text-sm">لا يوجد إيصال مرفق</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {!hasReceipt && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                                                <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-300">
                                                    <strong>تحذير:</strong> لم يتم رفع إيصال الدفع. لا يمكن التحقق من الطلب بدون إيصال.
                                                </div>
                                            </div>
                                        )}

                                        {hasReceipt && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowPreview(true)}
                                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ZoomIn size={16} />
                                                    عرض بالحجم الكامل
                                                </button>
                                                <button
                                                    onClick={handleDownload}
                                                    disabled={isDownloading}
                                                    className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Download size={16} />
                                                    {isDownloading ? 'جاري التحميل...' : 'تحميل الإيصال'}
                                                </button>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">يرجى إدخال مفاتيح التفعيل لكل منتج:</p>

                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                        <Key size={10} /> {item.title}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={keys[idx] || ''}
                                                        onChange={(e) => handleKeyChange(idx, e.target.value)}
                                                        placeholder="XXXXX-XXXXX-XXXXX"
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 font-mono text-sm focus:border-primary outline-none text-white tracking-widest uppercase"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-[10px] text-gray-500 italic">سيتم إرسال هذه المفاتيح في رسالة البريد الإلكتروني للموافقة.</p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onVerify(order.id, keys)}
                                                disabled={!hasReceipt}
                                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-green-600/20 active:scale-95"
                                            >
                                                قبول وإرسال الكود
                                            </button>
                                            <button
                                                onClick={() => onReject(order.id)}
                                                className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-3 rounded-xl text-sm font-black transition-all border border-red-500/10 active:scale-95"
                                            >
                                                رفض
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status & Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Clock size={16} />
                                <span>تاريخ الطلب: {order.date}</span>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={onClose} className="flex-1 md:flex-none bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20">
                                    إغلاق النافذة
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Full Screen Image Preview Modal */}
            {showPreview && hasReceipt && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setShowPreview(false)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setShowPreview(false)}
                    >
                        <X size={24} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                        }}
                        disabled={isDownloading}
                        className="absolute top-4 left-4 p-2 bg-primary hover:bg-primary/80 rounded-full text-white transition-colors flex items-center gap-2"
                    >
                        <Download size={20} />
                        <span className="text-sm font-bold">{isDownloading ? 'جاري التحميل...' : 'تحميل'}</span>
                    </button>
                    <img
                        src={receiptUrl}
                        alt="Receipt Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
