'use client';
import { Tag, Edit, Trash, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminTicketsPage() {
    const tickets = [
        { id: '#TK-204', subject: 'مشكلة في تفعيل Helldivers 2', user: 'ahmed@example.com', date: 'منذ ساعة', status: 'Open', priority: 'High' },
        { id: '#TK-203', subject: 'استفسار عن طرق الدفع', user: 'sara@example.com', date: 'منذ 3 ساعات', status: 'Closed', priority: 'Low' },
        { id: '#TK-202', subject: 'الكود لا يعمل', user: 'ali@example.com', date: 'أمس', status: 'Pending', priority: 'Medium' },
    ];

    const statusStyles = {
        Open: 'bg-green-500/10 text-green-400 border-green-500/20',
        Closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-black mb-8">تذاكر الدعم الفني</h1>

            <div className="grid gap-4">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ticket.priority === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                    <MessageSquare size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-400 font-mono">{ticket.id} • {ticket.user}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[ticket.status as keyof typeof statusStyles]}`}>
                                {ticket.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-white/5 pt-4 mt-2">
                            <span className="flex items-center gap-1">
                                <AlertCircle size={14} />
                                الأولوية: {ticket.priority}
                            </span>
                            <span>{ticket.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
