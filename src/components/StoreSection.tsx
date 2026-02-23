import { motion } from 'framer-motion';
import { ShoppingCart, Check, Zap, Shield, Crown } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Game } from '@/data/games';

const defaultCoins = [
    { amount: 1100, price: 9.99, popular: false, originalPrice: undefined },
    { amount: 2400, price: 19.99, popular: false, originalPrice: undefined },
    { amount: 5000, price: 39.99, popular: true, originalPrice: undefined }
];

export default function StoreSection({ game }: { game?: Game }) {
    const { settings } = useStore();
    const calculateDiscount = (price: number) => (price * 0.9).toFixed(3);

    // If proCard section is disabled globally, we might still want to show currency. 
    // Usually 'proCard' toggle refers to the card itself.
    const showProCard = settings.sections.proCard;

    const displayCoins: { amount: number; price: number; popular: boolean | undefined; originalPrice: number | undefined; }[] = (game?.currencyPackages && game.currencyPackages.length > 0)
        ? game.currencyPackages.map(p => ({ amount: p.amount, price: p.price, popular: p.isPopular, originalPrice: p.originalPrice }))
        : defaultCoins;

    const proCardData = game?.proCard || {
        price: 22.49,
        originalPrice: 24.99,
        features: [
            'Ignition Legendary Skin',
            'Tactician Bundle Access',
            '20 Tier Skips for Battle Pass',
            'Exclusive Player Emblem',
            '500 Bonus Battlefield Coins'
        ],
        buttonLink: settings.proCardBuyLink // Use dynamic link from settings as fallback
    };

    return (
        <section id="features" className="py-24 px-4 bg-[#0B0B0F]">
            <div className="max-w-[1600px] mx-auto">
                <div className={`grid grid-cols-1 ${showProCard ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-12`}>

                    {/* LEFT: Currency Grid (7 Columns) */}
                    <div className={showProCard ? 'lg:col-span-7 space-y-12' : 'space-y-12'}>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">متجر العملات الافتراضية</h2>
                            <p className="text-gray-400 text-lg max-w-xl">اشترِ العملات الآن لتحصل على تذكرة المعركة (Battle Pass) وأحدث الحزم المتميزة.</p>
                        </div>

                        <div className={`grid grid-cols-1 ${showProCard ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-6`}>
                            {displayCoins.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className={`relative p-6 rounded-3xl border ${item.popular ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-white/5'} flex flex-col items-center text-center gap-4 transition-all group`}
                                >
                                    {item.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">
                                            Best Value
                                        </div>
                                    )}

                                    <div className="w-16 h-16 relative">
                                        <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full group-hover:bg-yellow-400/40 transition-all" />
                                        <img src="/assets/images/coins-stack.png" className="w-full h-full object-contain relative z-10" alt="Coins" />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white">{item.amount}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{game?.title || 'Game'} Coins</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-lg font-black text-white">{item.price} {settings.branding.currency}</span>
                                            {item.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through">{item.originalPrice} {settings.branding.currency}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-1.5 text-primary text-[10px] font-black uppercase">
                                            <Crown size={12} />
                                            <span>خصم المشتركين: {calculateDiscount(item.price)} {settings.branding.currency}</span>
                                        </div>
                                    </div>

                                    <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all border border-white/10 active:scale-95">
                                        إضافة إلى السلة
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* EA Play Promo */}
                        <div className="bg-gradient-to-r from-primary/20 to-transparent p-8 rounded-3xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-primary rounded-2xl">
                                    <Crown size={32} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white italic">وفر 10% مع عضوية كليك7</h4>
                                    <p className="text-gray-400 text-sm">يحصل المشتركون المميزون على خصم فوري على كافة المشتريات الرقمية.</p>
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-white text-black font-black italic rounded-full hover:scale-105 active:scale-95 transition-all">
                                انضم الآن
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Battlefield Pro Card (5 Columns) */}
                    {showProCard && (
                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-[#1A1A1A] to-black p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="space-y-2">
                                        <span className="bg-white/10 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Special Edition</span>
                                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{game?.title || 'Battlefield'} Pro Card</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-white">{proCardData.price} {settings.branding.currency}</p>
                                        {proCardData.originalPrice && (
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest line-through">{proCardData.originalPrice} {settings.branding.currency}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6 mb-12 relative z-10">
                                    {proCardData.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-4 text-gray-300">
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                {i === 0 ? <Zap size={18} className="text-primary" /> : i === 1 ? <Shield size={18} className="text-primary" /> : <Check size={18} className="text-primary" />}
                                            </div>
                                            <span className="font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href={game?.proCard?.buttonLink || settings.proCardBuyLink}
                                    className="w-full py-6 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black italic text-lg shadow-[0_20px_40px_rgba(209,52,52,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart size={24} />
                                    <span>الحصول على البطاقة</span>
                                </a>
                            </motion.div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
