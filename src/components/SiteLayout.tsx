'use client';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import AddToCartModal from '@/components/AddToCartModal';
import React from 'react';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isLogin = pathname === '/login';

    return (
        <>
            {children}
            {!isAdmin && !isLogin && (
                <>
                    <AddToCartModal />
                    <WhatsAppButton />
                    <Footer />
                </>
            )}
        </>
    );
}
