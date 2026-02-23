'use client';

import Navbar from '@/components/Navbar';
import CheckoutFlow from '@/components/CheckoutFlow';

export default function CheckoutPage() {
    return (
        <main className="min-h-screen bg-background text-white pb-20">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-5xl font-black mb-12 text-center tracking-tighter">SECURE CHECKOUT</h1>
                <CheckoutFlow />
            </div>
        </main>
    );
}
