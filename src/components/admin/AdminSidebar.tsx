'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Layers, Settings, CreditCard, Menu, X, LogOut, FileText, MessageSquare, Bell, Terminal, Tag } from 'lucide-react';
import Clic7Logo from '@/components/Clic7Logo';

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { icon: LayoutDashboard, label: 'لوحة القيادة', href: '/admin' },
        { icon: Package, label: 'المخزون (Inventory)', href: '/admin/inventory' },
        { icon: Layers, label: 'المنتجات', href: '/admin/products' },
        { icon: ShoppingCart, label: 'الطلبات', href: '/admin/orders' },
        { icon: FileText, label: 'المقالات', href: '/admin/posts/add' },
        { icon: Bell, label: 'الطلبات المسبقة', href: '/admin/preorders' },
        { icon: Tag, label: 'العروض والهدايا', href: '/admin/promotions' },
        { icon: MessageSquare, label: 'رسائل التواصل', href: '/admin/messages' },
        { icon: MessageSquare, label: 'التذاكر', href: '/admin/tickets' },
        { icon: Layers, label: 'التصنيفات', href: '/admin/categories' },
        { icon: Settings, label: 'الإعدادات', href: '/admin/settings' },
        { icon: CreditCard, label: 'بوابة الدفع', href: '/admin/payments' },
        { icon: Terminal, label: 'سجلات النظام', href: '/admin/logs' },
    ];

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 bg-background border border-white/10 p-2 rounded-lg text-white"
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 right-0 z-40 w-72 bg-[#08080A] border-l border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'} shadow-[10px_0_30px_rgba(0,0,0,0.5)]`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-24 flex items-center justify-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="scale-100 origin-center block">
                            <Clic7Logo />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-3 custom-scrollbar">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isSub = item.label.includes('SUB');

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group border relative overflow-hidden ${isActive
                                        ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(138,43,226,0.4)]'
                                        : isSub
                                            ? 'bg-primary/10 border-primary/20 text-white hover:bg-primary/20'
                                            : 'text-white border-transparent hover:bg-white/5 hover:border-white/10'
                                        }`}>
                                        {isSub && !isActive && (
                                            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/40 animate-pulse" />
                                        )}
                                        <div className={`p-2 rounded-xl transition-colors ${isActive
                                            ? 'bg-white/20'
                                            : isSub ? 'bg-primary/20 text-white' : 'bg-white/5 group-hover:bg-white/10'
                                            }`}>
                                            <item.icon size={22} className={isActive ? 'text-white' : isSub ? 'text-white' : 'text-white'} />
                                        </div>
                                        <span className={`text-[15px] tracking-tight uppercase font-black text-white`}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute right-0 w-2 h-10 bg-white rounded-l-full shadow-[0_0_15px_white]"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/5 bg-gradient-to-t from-white/5 to-transparent">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 w-full px-5 py-4 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all font-black uppercase text-sm tracking-widest"
                        >
                            <LogOut size={20} />
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                />
            )}
        </>
    );
}
