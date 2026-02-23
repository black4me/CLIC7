'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Settings, MessageSquare, Eye, Trash2, Check } from 'lucide-react';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    sentAt: string;
    read: boolean;
    adminEmail: string;
}

export default function AdminContactManager() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [adminEmail, setAdminEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            const msgs = JSON.parse(localStorage.getItem('clic7_contact_messages') || '[]');
            setMessages(msgs);

            const settings = JSON.parse(localStorage.getItem('clic7_admin_settings') || '{}');
            setAdminEmail(settings.contactEmail || 'admin@clic7.com');
            setNewEmail(settings.contactEmail || 'admin@clic7.com');

            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const handleSaveEmail = () => {
        try {
            const settings = JSON.parse(localStorage.getItem('clic7_admin_settings') || '{}');
            settings.contactEmail = newEmail;
            localStorage.setItem('clic7_admin_settings', JSON.stringify(settings));
            setAdminEmail(newEmail);
            setShowSettings(false);
            alert('تم حفظ البريد الإلكتروني بنجاح');
        } catch (error) {
            alert('خطأ في حفظ البريد الإلكتروني');
        }
    };

    const markAsRead = (id: string) => {
        const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
        setMessages(updated);
        localStorage.setItem('clic7_contact_messages', JSON.stringify(updated));
    };

    const deleteMessage = (id: string) => {
        const updated = messages.filter(m => m.id !== id);
        setMessages(updated);
        localStorage.setItem('clic7_contact_messages', JSON.stringify(updated));
        setSelectedMessage(null);
    };

    const unreadCount = messages.filter(m => !m.read).length;

    if (loading) {
        return <div className="text-white text-center py-8">جاري التحميل...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">رسائل التواصل</h2>
                    <p className="text-slate-400">
                        {unreadCount > 0 ? `${unreadCount} رسائل جديدة` : 'لا توجد رسائل جديدة'}
                    </p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                    <Settings className="w-4 h-4" />
                    الإعدادات
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">إعدادات البريد الإلكتروني</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                البريد الإلكتروني لاستقبال الرسائل
                            </label>
                            <p className="text-xs text-slate-500 mb-2">
                                سيتم إرسال جميع رسائل "اتصل بنا" إلى هذا البريد
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    placeholder="admin@example.com"
                                />
                                <button
                                    onClick={handleSaveEmail}
                                    className="px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                                >
                                    حفظ
                                </button>
                            </div>
                            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-blue-300 text-sm">
                                    ℹ️ البريد الحالي: <strong>{adminEmail}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages List */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                {messages.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">لا توجد رسائل</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {messages.reverse().map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                className={`p-4 cursor-pointer transition ${
                                    msg.read
                                        ? 'bg-slate-800/50 hover:bg-slate-800'
                                        : 'bg-blue-500/10 hover:bg-blue-500/20 border-l-4 border-blue-500'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white">{msg.name}</h4>
                                            {!msg.read && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400">{msg.email}</p>
                                        <p className="text-sm text-slate-300 mt-1">{msg.subject}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {new Date(msg.sentAt).toLocaleDateString('ar-SA')}
                                        </p>
                                    </div>
                                    {!msg.read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(msg.id);
                                            }}
                                            className="ml-2 p-2 text-blue-400 hover:text-blue-300"
                                            title="وضع علامة كمقروءة"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Message Details Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">{selectedMessage.subject}</h3>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="text-slate-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Sender Info */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 mb-3">معلومات المرسل</h4>
                                <div className="space-y-2">
                                    <p className="text-white">
                                        <span className="text-slate-400">الاسم:</span> {selectedMessage.name}
                                    </p>
                                    <p className="text-white flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        <a
                                            href={`mailto:${selectedMessage.email}`}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            {selectedMessage.email}
                                        </a>
                                    </p>
                                    {selectedMessage.phone && (
                                        <p className="text-white">
                                            <span className="text-slate-400">الهاتف:</span> {selectedMessage.phone}
                                        </p>
                                    )}
                                    <p className="text-slate-400 text-sm">
                                        التاريخ: {new Date(selectedMessage.sentAt).toLocaleDateString('ar-SA')}
                                    </p>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 mb-3">الرسالة</h4>
                                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-700">
                                <a
                                    href={`mailto:${selectedMessage.email}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                >
                                    <Mail className="w-4 h-4" />
                                    الرد عبر البريد
                                </a>
                                <button
                                    onClick={() => {
                                        deleteMessage(selectedMessage.id);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">إجمالي الرسائل</p>
                    <p className="text-3xl font-bold text-white">{messages.length}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">رسائل جديدة</p>
                    <p className="text-3xl font-bold text-blue-400">{unreadCount}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">مقروءة</p>
                    <p className="text-3xl font-bold text-green-400">{messages.filter(m => m.read).length}</p>
                </div>
            </div>
        </div>
    );
}
