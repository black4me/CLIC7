'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Clear customer session
        localStorage.removeItem('clic7_current_customer');

        // Redirect to home after 2 seconds
        const timeout = setTimeout(() => {
            router.push('/');
            router.refresh();
        }, 2000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <LogOut size={32} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">تم تسجيل الخروج</h1>
                <p className="text-gray-400">سيتم توجيهك إلى الصفحة الرئيسية...</p>
            </motion.div>
        </div>
    );
}
