'use client';
import { useStore } from '@/context/StoreContext';
import { AlertCircle, Info, ShieldAlert, Trash2, Clock, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LogsPage() {
    const { logs, clearLogs } = useStore();

    const getIcon = (type: string) => {
        switch (type) {
            case 'ERROR': return <AlertCircle className="text-red-500" size={20} />;
            case 'WARNING': return <ShieldAlert className="text-yellow-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Terminal className="text-primary" />
                        سجلات النظام (System Logs)
                    </h1>
                    <p className="text-gray-400">مراقبة أداء الموقع والأخطاء البرمجية في الوقت الفعلي</p>
                </div>
                <button
                    onClick={clearLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold text-sm"
                >
                    <Trash2 size={18} />
                    مسح السجلات
                </button>
            </div>

            <div className="bg-[#1A1A1A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/5 text-gray-400 text-xs uppercase tracking-widest font-black">
                                <th className="p-6">الحالة</th>
                                <th className="p-6 text-right">الرسالة</th>
                                <th className="p-6">الوقت</th>
                                <th className="p-6">التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-gray-500 italic">
                                        لا توجد سجلات حالياً. النظام يعمل بشكل مثالي ✨
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={log.id}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 font-bold text-xs">
                                                {getIcon(log.type)}
                                                <span className={
                                                    log.type === 'ERROR' ? 'text-red-500' :
                                                        log.type === 'WARNING' ? 'text-yellow-500' :
                                                            'text-blue-500'
                                                }>
                                                    {log.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 max-w-xl">
                                            <div className="text-sm text-gray-200 font-medium leading-relaxed">
                                                {log.message}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                                <Clock size={14} />
                                                {new Date(log.timestamp).toLocaleString('ar-OM')}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {log.stack && (
                                                <button
                                                    className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1 rounded-md transition-all font-mono"
                                                    onClick={() => alert(log.stack)}
                                                >
                                                    View Stack
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 space-y-2">
                    <h3 className="text-blue-500 font-black flex items-center gap-2">
                        <Info size={18} />
                        Total Events
                    </h3>
                    <p className="text-2xl font-black text-white">{logs.length}</p>
                </div>
                <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10 space-y-2">
                    <h3 className="text-red-500 font-black flex items-center gap-2">
                        <AlertCircle size={18} />
                        Errors
                    </h3>
                    <p className="text-2xl font-black text-white">{logs.filter(l => l.type === 'ERROR').length}</p>
                </div>
                <div className="bg-yellow-500/5 p-6 rounded-3xl border border-yellow-500/10 space-y-2">
                    <h3 className="text-yellow-500 font-black flex items-center gap-2">
                        <ShieldAlert size={18} />
                        Warnings
                    </h3>
                    <p className="text-2xl font-black text-white">{logs.filter(l => l.type === 'WARNING').length}</p>
                </div>
            </div>
        </div>
    );
}
