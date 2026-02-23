'use client';
import { useState } from 'react';
import { Save, ToggleRight, ToggleLeft } from 'lucide-react';

export default function AdminPaymentsPage() {
    const [stripeEnabled, setStripeEnabled] = useState(true);
    const [paypalEnabled, setPaypalEnabled] = useState(false);

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-black mb-8">بوابات الدفع</h1>

            <div className="space-y-6">
                {/* Stripe */}
                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                            Stripe
                        </h3>
                        <button onClick={() => setStripeEnabled(!stripeEnabled)} className={`transition-colors ${stripeEnabled ? 'text-green-400' : 'text-gray-600'}`}>
                            {stripeEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                        </button>
                    </div>

                    {stripeEnabled && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Publishable Key</label>
                                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono text-sm" placeholder="pk_test_..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Secret Key</label>
                                <input type="password" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono text-sm" placeholder="sk_test_..." />
                            </div>
                        </div>
                    )}
                </div>

                {/* PayPal */}
                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-800" />
                            PayPal
                        </h3>
                        <button onClick={() => setPaypalEnabled(!paypalEnabled)} className={`transition-colors ${paypalEnabled ? 'text-green-400' : 'text-gray-600'}`}>
                            {paypalEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                        </button>
                    </div>

                    {paypalEnabled && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Client ID</label>
                                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Secret</label>
                                <input type="password" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono text-sm" />
                            </div>
                        </div>
                    )}
                </div>

                <button className="w-full bg-primary hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                    <Save size={18} />
                    حفظ الإعدادات
                </button>
            </div>
        </div>
    );
}
