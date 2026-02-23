'use client';

import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Ticket, Plus, Trash2, Search, Gift, Copy, Percent, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPromotionsPage() {
    const { discounts, giftCards, addDiscount, deleteDiscount, addGiftCard, deleteGiftCard, categories, games } = useStore();
    const [activeTab, setActiveTab] = useState<'DISCOUNTS' | 'GIFTCARDS'>('DISCOUNTS');

    // Forms State
    const [discountForm, setDiscountForm] = useState({
        code: '',
        type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        value: 0
    });

    const [giftCardForm, setGiftCardForm] = useState({
        amount: 20,
        scope: 'GLOBAL' as 'GLOBAL' | 'CATEGORY' | 'GAME',
        target: ''
    });

    const handleAddDiscount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!discountForm.code || discountForm.value <= 0) {
            toast.error('Please enter valid discount details');
            return;
        }
        addDiscount({
            code: discountForm.code.toUpperCase().trim(),
            type: discountForm.type,
            value: Number(discountForm.value),
            active: true,
            uses: 0
        });
        setDiscountForm({ code: '', type: 'PERCENTAGE', value: 0 });
        toast.success('Discount Code Created!');
    };

    const handleGenerateGiftCard = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for specific scopes
        if (giftCardForm.scope !== 'GLOBAL' && !giftCardForm.target) {
            toast.error('Please select a target for the specific scope');
            return;
        }

        const uniqueCode = `GC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const targetName = giftCardForm.scope === 'CATEGORY'
            ? categories.find(c => c.slug === giftCardForm.target)?.name
            : giftCardForm.scope === 'GAME'
                ? games.find(g => g.id === giftCardForm.target)?.title
                : 'Global';

        addGiftCard({
            code: uniqueCode,
            balance: Number(giftCardForm.amount),
            active: true,
            scope: giftCardForm.scope,
            validTargets: giftCardForm.target ? [giftCardForm.target] : [],
            createdDate: new Date().toISOString()
        });

        toast.success(`Generated Gift Card: ${uniqueCode}`);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white flex items-center gap-3">
                        <Tag className="text-primary" />
                        Promotions & Gift Cards
                    </h1>
                    <p className="text-gray-400 mt-2">Manage discount codes and issue specialized gift cards</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('DISCOUNTS')}
                    className={`pb-4 px-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'DISCOUNTS' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    <Percent size={18} />
                    Discount Coupons
                </button>
                <button
                    onClick={() => setActiveTab('GIFTCARDS')}
                    className={`pb-4 px-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'GIFTCARDS' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    <Gift size={18} />
                    Gift Cards
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0B0B0F] border border-white/10 rounded-2xl p-6 sticky top-8">
                        {activeTab === 'DISCOUNTS' ? (
                            <form onSubmit={handleAddDiscount} className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Plus size={20} className="text-primary" />
                                    New Coupon
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Code Name</label>
                                    <input
                                        type="text"
                                        value={discountForm.code}
                                        onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                                        placeholder="e.g. SAVE30"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Discount Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setDiscountForm({ ...discountForm, type: 'PERCENTAGE' })}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${discountForm.type === 'PERCENTAGE' ? 'bg-primary border-primary' : 'bg-black/50 border-white/10 text-gray-400'}`}
                                        >
                                            <Percent size={16} /> Percentage
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDiscountForm({ ...discountForm, type: 'FIXED' })}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${discountForm.type === 'FIXED' ? 'bg-primary border-primary' : 'bg-black/50 border-white/10 text-gray-400'}`}
                                        >
                                            <span>OMR</span> Fixed
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Value ({discountForm.type === 'PERCENTAGE' ? '%' : 'OMR'})</label>
                                    <input
                                        type="number"
                                        value={discountForm.value}
                                        onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                    />
                                </div>

                                <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                    Create Coupon
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleGenerateGiftCard} className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Gift size={20} className="text-primary" />
                                    Generate Gift Card
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Balance (OMR)</label>
                                    <input
                                        type="number"
                                        value={giftCardForm.amount}
                                        onChange={(e) => setGiftCardForm({ ...giftCardForm, amount: Number(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Scope</label>
                                    <select
                                        value={giftCardForm.scope}
                                        onChange={(e) => setGiftCardForm({ ...giftCardForm, scope: e.target.value as any })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                    >
                                        <option value="GLOBAL">Global (Store-wide)</option>
                                        <option value="CATEGORY">Specific Category</option>
                                        <option value="GAME">Specific Game</option>
                                    </select>
                                </div>

                                {/* Dynamic Target Selector */}
                                {giftCardForm.scope === 'CATEGORY' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Select Category</label>
                                        <select
                                            value={giftCardForm.target}
                                            onChange={(e) => setGiftCardForm({ ...giftCardForm, target: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                        >
                                            <option value="">-- Select --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.slug}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {giftCardForm.scope === 'GAME' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Select Game</label>
                                        <select
                                            value={giftCardForm.target}
                                            onChange={(e) => setGiftCardForm({ ...giftCardForm, target: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                        >
                                            <option value="">-- Select --</option>
                                            {games.map(g => (
                                                <option key={g.id} value={g.id}>{g.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
                                    Generate Card
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-400">Active {activeTab === 'DISCOUNTS' ? 'Coupons' : 'Gift Cards'}</h3>

                    {activeTab === 'DISCOUNTS' ? (
                        <div className="space-y-3">
                            {discounts.length === 0 && <p className="text-gray-500 italic">No active coupons</p>}
                            {discounts.map((discount) => (
                                <div key={discount.code} className="bg-[#0B0B0F] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-xl text-primary font-black text-xl">
                                            {discount.value}{discount.type === 'PERCENTAGE' ? '%' : ' OMR'}
                                        </div>
                                        <div>
                                            <div className="font-mono text-white text-lg font-bold flex items-center gap-2">
                                                {discount.code}
                                                <button onClick={() => copyToClipboard(discount.code)} className="text-gray-500 hover:text-white"><Copy size={14} /></button>
                                            </div>
                                            <div className="text-gray-400 text-sm">{discount.type} Discount</div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteDiscount(discount.code)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {giftCards.length === 0 && <p className="text-gray-500 italic">No generated gift cards</p>}
                            {giftCards.map((card) => (
                                <div key={card.code} className="bg-[#0B0B0F] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400 font-bold">
                                            {card.balance} OMR
                                        </div>
                                        <div>
                                            <div className="font-mono text-white text-lg font-bold flex items-center gap-2">
                                                {card.code}
                                                <button onClick={() => copyToClipboard(card.code)} className="text-gray-500 hover:text-white"><Copy size={14} /></button>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${card.scope === 'GLOBAL' ? 'border-green-500/30 text-green-500' :
                                                        card.scope === 'CATEGORY' ? 'border-blue-500/30 text-blue-500' :
                                                            'border-orange-500/30 text-orange-500'
                                                    }`}>
                                                    {card.scope}: {card.validTargets.join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteGiftCard(card.code)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
