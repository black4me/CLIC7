'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard, Upload, CheckCircle, ArrowLeft, ArrowRight, X, QrCode, Building2, Smartphone, Globe, Star } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { sendOrderNotification, sendOrderApprovalEmail } from '@/app/actions/email';
import Link from 'next/link';


const steps = [
    { number: 1, title: 'السلة' },
    { number: 2, title: 'الدفع' },
    { number: 3, title: 'التأكيد' }
];

export default function CheckoutFlow() {
    const { cart, removeFromCart, addOrder, currentUser, updateUserPoints, settings } = useStore();
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>('bank');
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [customerInfo, setCustomerInfo] = useState({
        firstName: '',
        fatherName: '',
        country: 'عمان',
        phone: '',
        email: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Promotion State
    const { validatePromo } = useStore();
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);
    const [usePoints, setUsePoints] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);

    // 1. Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.price * (item as any).quantity || item.price, 0);
    const giftCardDeduction = appliedGiftCard?.amount || appliedGiftCard?.balance || 0;

    // 2. Consolidated Price Calculations (totals)
    const totals = useMemo(() => {
        const couponDiscount = appliedCoupon ? (subtotal * (appliedCoupon.discount / 100)) : 0;
        const pointsDiscount = pointsToRedeem * 0.01; // 100 points = 1 OMR

        // Final Total
        const finalTotal = Math.max(0, subtotal - couponDiscount - pointsDiscount - giftCardDeduction);

        return {
            subtotal,
            couponDiscount,
            pointsDiscount,
            giftCardDeduction,
            finalTotal
        };
    }, [subtotal, appliedCoupon, pointsToRedeem, giftCardDeduction]);

    const { finalTotal, couponDiscount, pointsDiscount } = totals;

    useEffect(() => {
        if (step === 1 && cart.length > 0 && (window as any)._learnq) {
            (window as any)._learnq.push(['track', 'Started Checkout', {
                $event_id: 'checkout_' + Date.now(),
                Value: subtotal,
                Items: cart.map(item => ({
                    ProductName: item.title,
                    ProductID: item.id,
                    Quantity: 1,
                    ItemPrice: item.price,
                    RowTotal: item.price,
                    ImageURL: item.image
                }))
            }]);
        }
    }, []);

    useEffect(() => {
        if (step === 2 && paymentMethod === 'card') {
            const clientId = settings.paymentSettings?.paypal?.clientId || "test";
            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
            script.async = true;
            script.onload = () => {
                if ((window as any).paypal) {
                    (window as any).paypal.Buttons({
                        style: { layout: "vertical", shape: "pill", label: "pay" },
                        createOrder: (data: any, actions: any) => {
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        currency_code: "USD",
                                        value: (finalTotal * 2.6).toFixed(2)
                                    }
                                }]
                            });
                        },
                        onApprove: async (data: any, actions: any) => {
                            await actions.order.capture();
                            handleSubmitOrder(true);
                        }
                    }).render("#paypal-button-container");
                }
            };
            document.body.appendChild(script);

            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            };
        }
    }, [step, paymentMethod, finalTotal, settings.paymentSettings?.paypal?.clientId]);

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!customerInfo.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
        if (!customerInfo.fatherName.trim()) newErrors.fatherName = 'اسم الأب مطلوب';
        if (!customerInfo.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
        if (!customerInfo.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
        else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = 'البريد الإلكتروني غير صالح';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleApplyPromo = () => {
        const { discount, giftCard, error } = validatePromo(promoCode);

        if (error) {
            setPromoError(error);
            return;
        }

        setPromoError('');
        if (discount) {
            setAppliedCoupon({ ...discount, discount: discount.value });
            setPromoCode('');
        } else if (giftCard) {
            // Scope Validation (Legacy fallback or specific check)
            if (giftCard.scope === 'GLOBAL') {
                setAppliedGiftCard(giftCard);
                setPromoCode('');
            } else if (giftCard.scope === 'CATEGORY') {
                const isPlatformScope = giftCard.validTargets.some(t => ['PS5', 'PC', 'Xbox'].includes(t));
                if (isPlatformScope) {
                    const isPlatformValid = cart.every(item => giftCard.validTargets.includes(item.platform));
                    if (!isPlatformValid) {
                        setPromoError(`This card is valid only for: ${giftCard.validTargets.join(', ')}`);
                        return;
                    }
                } else {
                    const isGenreValid = cart.every(item => giftCard.validTargets.includes(item.genre || ''));
                    if (!isGenreValid) {
                        setPromoError(`This card is valid only for: ${giftCard.validTargets.join(', ')}`);
                        return;
                    }
                }
                setAppliedGiftCard(giftCard);
                setPromoCode('');
            } else if (giftCard.scope === 'GAME') {
                const isValid = cart.every(item => giftCard.validTargets.includes(item.id));
                if (!isValid) {
                    setPromoError('This card is valid only for specific games in your cart.');
                    return;
                }
                setAppliedGiftCard(giftCard);
                setPromoCode('');
            }
        }
    };


    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleInfodrug = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = (autoComplete: boolean = false) => {
        // Calculate loyalty points: 1 OMR = 3 points
        const pointsEarned = Math.floor(finalTotal * 3);
        
        const newOrder = {
            id: `#C7-${Math.floor(Math.random() * 10000)}`,
            customerName: `${customerInfo.firstName} ${customerInfo.fatherName}`.trim() || 'عميل زائر',
            email: customerInfo.email || 'pending@email.com',
            phone: customerInfo.phone || '',
            country: customerInfo.country,
            items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, image: item.image })),
            total: finalTotal,
            status: (autoComplete ? 'Completed' : 'Pending') as any,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethod,
            receiptUrl: file ? URL.createObjectURL(file) : undefined,
            discountCode: appliedCoupon?.code,
            giftCardCode: appliedGiftCard?.code,
            points: pointsEarned
        };

        addOrder(newOrder);

        if (autoComplete) {
            sendOrderApprovalEmail(newOrder, [], settings.contact.whatsapp).catch(() => null);
        } else {
            sendOrderNotification(newOrder, settings.contact.email).catch(() => null);
        }

        // Deduct points if used
        if (usePoints && currentUser && pointsToRedeem > 0) {
            updateUserPoints(currentUser.email, -pointsToRedeem, 'ADD');
        }

        // Klaviyo Tracking: Placed Order
        if ((window as any)._learnq) {
            (window as any)._learnq.push(['track', 'Placed Order', {
                OrderID: newOrder.id,
                TotalValue: newOrder.total,
                Currency: settings.branding.currency,
                Items: newOrder.items.map(item => item.title),
                CustomerEmail: newOrder.email,
                PaymentMethod: newOrder.paymentMethod
            }]);
        }

        setStep(3);
        cart.forEach(item => removeFromCart(item.id));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-[#15151A] rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden my-8 text-white" dir="rtl">
            {/* Progress Bar */}
            <div className="mb-12 relative h-20">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0" />
                <div className="absolute top-1/2 right-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />

                <div className="flex justify-between relative z-10 font-bold">
                    {steps.map((s) => (
                        <div key={s.number} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${step >= s.number ? 'bg-primary border-[#15151A] text-white' : 'bg-[#15151A] border-white/10 text-gray-500'
                                }`}>
                                {step > s.number ? <CheckCircle size={20} /> : s.number}
                            </div>
                            <span className={`text-sm ${step >= s.number ? 'text-white' : 'text-gray-500'}`}>{s.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Cart Review & Customer Info */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        <h2 className="text-2xl font-black mb-6 uppercase tracking-wider">مراجعة السلة</h2>

                        {/* Cart Items List */}
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 group">
                                    <div className="relative w-20 h-24 rounded-xl overflow-hidden shadow-xl">
                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <div className="text-primary font-black uppercase text-xs tracking-widest">{item.platform}</div>
                                        <div className="text-gray-400 text-sm mt-1">{item.price.toFixed(3)} OMR</div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="text-center py-12 bg-black/10 rounded-3xl border border-dashed border-white/5">
                                    <ShoppingCart size={48} className="mx-auto mb-4 text-gray-600" />
                                    <p className="text-gray-500">السلة فارغة حالياً</p>
                                    <Link href="/" className="text-primary hover:underline mt-2 inline-block">تصفح الألعاب</Link>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <>
                                {/* Customer Form */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold border-r-4 border-primary pr-3">معلومات المستلم</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <input type="text" name="firstName" placeholder="الاسم الأول *" value={customerInfo.firstName} onChange={handleInfodrug} className={`w-full bg-black/30 border ${errors.firstName ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-primary transition-colors text-right placeholder:text-gray-600`} />
                                            {errors.firstName && <p className="text-red-500 text-[10px] font-bold pr-2">{errors.firstName}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <input type="text" name="fatherName" placeholder="اسم الأب *" value={customerInfo.fatherName} onChange={handleInfodrug} className={`w-full bg-black/30 border ${errors.fatherName ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-primary transition-colors text-right placeholder:text-gray-600`} />
                                            {errors.fatherName && <p className="text-red-500 text-[10px] font-bold pr-2">{errors.fatherName}</p>}
                                        </div>

                                        <div className="relative">
                                            <select
                                                name="country"
                                                onChange={handleInfodrug}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-colors text-right appearance-none cursor-pointer"
                                                defaultValue="عمان"
                                            >
                                                <option value="عمان">سلطنة عمان</option>
                                                <option value="السعودية">المملكة العربية السعودية</option>
                                                <option value="الإمارات">الإمارات العربية المتحدة</option>
                                                <option value="قطر">قطر</option>
                                                <option value="البحرين">البحرين</option>
                                                <option value="الكويت">الكويت</option>
                                                <option value="أخرى">دولة أخرى</option>
                                            </select>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <Globe size={18} />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="رقم الهاتف (واتساب) *"
                                                value={customerInfo.phone}
                                                onChange={handleInfodrug}
                                                className={`w-full bg-black/30 border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-primary transition-colors text-right placeholder:text-gray-600`}
                                            />
                                            {errors.phone && <p className="text-red-500 text-[10px] font-bold pr-2">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-1 md:col-span-2">
                                            <input type="email" name="email" placeholder="البريد الإلكتروني *" value={customerInfo.email} onChange={handleInfodrug} className={`w-full bg-black/30 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-primary transition-colors text-right placeholder:text-gray-600`} />
                                            {errors.email && <p className="text-red-500 text-[10px] font-bold pr-2">{errors.email}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Promo Code Section */}
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">كوبون خصم أو بطاقة هدية</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="أدخل الرمز هنا"
                                            className="flex-grow bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary font-mono text-center placeholder:font-sans"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={!!appliedCoupon || !!appliedGiftCard}
                                            className="bg-primary hover:bg-white hover:text-primary text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50"
                                        >
                                            تطبيق
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {promoError && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm font-bold flex items-center gap-2">
                                                <X size={14} /> {promoError}
                                            </motion.div>
                                        )}
                                        {appliedCoupon && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-green-500 text-sm font-bold flex items-center gap-2 bg-green-500/10 p-2 rounded-lg">
                                                <CheckCircle size={14} /> تم تطبيق الخصم: {appliedCoupon.code}
                                                <button onClick={() => { setAppliedCoupon(null); setPromoCode(''); }} className="mr-auto text-xs underline opacity-70 hover:opacity-100">إزالة</button>
                                            </motion.div>
                                        )}
                                        {appliedGiftCard && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-purple-400 text-sm font-bold flex items-center gap-2 bg-purple-500/10 p-2 rounded-lg">
                                                <CheckCircle size={14} /> بطاقة هدية فعالة: {appliedGiftCard.code}
                                                <button onClick={() => { setAppliedGiftCard(null); setPromoCode(''); }} className="mr-auto text-xs underline opacity-70 hover:opacity-100">إزالة</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Your Rewards Section */}
                                {settings.enableLoyaltySystem && currentUser && (
                                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-3xl space-y-4 shadow-xl shadow-primary/5">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                                                    <Star size={24} className="fill-primary" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black uppercase tracking-tight">Your Rewards</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Available Balance: {currentUser.points} Pts</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={pointsToRedeem}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setPointsToRedeem(Math.min(val, currentUser.points));
                                                    }}
                                                    placeholder="0"
                                                    className="w-20 bg-black/30 border border-white/10 rounded-lg p-2 text-center text-white outline-none focus:border-primary font-mono text-sm"
                                                />
                                                <button
                                                    onClick={() => setUsePoints(!usePoints)}
                                                    disabled={pointsToRedeem < 100}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${usePoints
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                                                        }`}
                                                >
                                                    {usePoints ? 'Deducted' : pointsToRedeem < 100 ? 'Min 100' : 'Redeem'}
                                                </button>
                                            </div>
                                        </div>
                                        {usePoints && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="text-[11px] text-primary font-black bg-primary/5 p-3 rounded-xl text-center border border-primary/10"
                                            >
                                                Applying {pointsToRedeem} points for a {pointsDiscount.toFixed(3)} OMR discount.
                                            </motion.div>
                                        )}
                                        {currentUser.points < 100 && !usePoints && (
                                            <p className="text-[10px] text-gray-500 font-bold text-center">Minimum 100 points required to redeem discount (100 Pts = 1 OMR).</p>
                                        )}
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div className="border-t border-white/10 pt-6 space-y-3">
                                    <div className="flex justify-between items-center text-gray-500">
                                        <span>المجموع الفرعي</span>
                                        <span className="font-mono">{subtotal.toFixed(3)} OMR</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between items-center text-green-500">
                                            <span>الخصم</span>
                                            <span className="font-mono">- {couponDiscount.toFixed(3)} OMR</span>
                                        </div>
                                    )}
                                    {appliedGiftCard && (
                                        <div className="flex justify-between items-center text-purple-400">
                                            <span>رصيد البطاقة</span>
                                            <span className="font-mono">- {giftCardDeduction.toFixed(3)} OMR</span>
                                        </div>
                                    )}
                                    {usePoints && pointsDiscount > 0 && (
                                        <div className="flex justify-between items-center text-primary font-bold">
                                            <span>نقاط المكافآت ({pointsToRedeem} نقطة)</span>
                                            <span className="font-mono">- {pointsDiscount.toFixed(3)} OMR</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <span className="text-2xl font-black">الإجمالي النهائي</span>
                                        <span className="text-3xl font-black text-primary font-mono">{finalTotal.toFixed(3)} OMR</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        <h2 className="text-2xl font-black mb-6 text-right">وسيلة الدفع</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('bank')}
                                className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'bank' ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <Smartphone size={32} className={paymentMethod === 'bank' ? 'text-primary' : 'text-gray-400'} />
                                <span className="font-bold">تحويل بنكي</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <CreditCard size={32} className={paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'} />
                                <span className="font-bold">بطاقة / PayPal</span>
                            </button>
                        </div>

                        {paymentMethod === 'bank' && (
                            <div className="bg-black/30 p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="bg-white p-4 rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                                        <QrCode size={120} className="text-black" />
                                    </div>
                                    <div className="space-y-4 flex-grow w-full">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-primary/50 transition-colors">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">بنك مسقط</div>
                                                <div className="text-lg font-mono font-black mt-1">{settings.contact.bankAccount || '0333 0000 4444 5555'}</div>
                                            </div>
                                            <Building2 className="text-gray-600 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-primary/50 transition-colors">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">رقم الهاتف</div>
                                                <div className="text-lg font-mono font-black mt-1">{settings.contact.whatsapp}</div>
                                            </div>
                                            <Smartphone className="text-gray-600 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className="text-sm font-bold text-gray-400 block text-right">ارفاق إيصال التحويل</label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${dragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20 bg-black/20'
                                            }`}
                                    >
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} />
                                        {file ? (
                                            <div className="flex flex-col items-center gap-2 text-primary">
                                                <CheckCircle size={48} className="animate-bounce" />
                                                <span className="font-black text-lg">{file.name}</span>
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }} className="text-xs text-red-500 hover:underline">إلغاء</button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={40} className="mb-4 text-gray-600" />
                                                <p className="font-bold text-lg">اسحب الصورة هنا أو اضغط للرفع</p>
                                                <p className="text-xs text-gray-500 mt-2">PNG, JPG (أقصى حجم 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'card' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-primary/10 border border-primary/30 p-6 rounded-3xl flex items-start gap-4 text-right">
                                    <div className="bg-primary p-3 rounded-2xl text-white">
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-black text-primary mb-1">الدفع عبر بطاقة بنكية</h4>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            سيتم توجيهك لبوابة Thawani Pay الآمنة لإتمام الدفع باستخدام بطاقتك البنكية.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#003087]/20 border border-[#003087]/50 p-6 rounded-3xl flex items-start gap-4 text-right">
                                    <div className="bg-[#003087] p-3 rounded-2xl text-white">
                                        <Globe size={24} />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-black text-[#009cde] mb-1 italic uppercase tracking-tighter">PayPal & International Cards</h4>
                                        <p className="text-sm text-white leading-relaxed font-black">
                                            GCC customers can pay via Visa, MasterCard, or PayPal account.
                                        </p>
                                        <p className="text-xs text-blue-300 mt-2 font-bold">
                                            يمكن لعملاء الخليج الدفع عبر فيزا، ماستركارد، أو حساب باي بال.
                                        </p>
                                        <div id="paypal-button-container" className="mt-8 transition-all duration-300">
                                            <button
                                                onClick={() => handleSubmitOrder(true)}
                                                className="w-full bg-[#0070ba] hover:bg-[#003087] text-white py-4 rounded-full font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 transform hover:scale-105"
                                            >
                                                <Globe size={24} />
                                                Pay with PayPal (Demo Mode)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                            <CheckCircle size={56} className="text-green-500" />
                        </div>
                        <h2 className="text-4xl font-black mb-6">تم تسجيل طلبك بنجاح!</h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-12 text-lg leading-relaxed">
                            شكراً لثقتك بمتجر CLIC7. سيتم مراجعة الدفعة وإرسال أكواد التفعيل عبر الواتساب والبريد الإلكتروني الخاص بك في أسرع وقت ممكن.
                        </p>
                        <Link href="/" className="inline-block bg-white text-black hover:bg-primary hover:text-white px-12 py-4 rounded-2xl font-black transition-all transform hover:scale-105 shadow-2xl">
                            العودة للرئيسية
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions Bar */}
            {step < 3 && (
                <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold"
                        >
                            <ArrowRight size={20} /> السابق
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        onClick={() => {
                            if (step === 1) {
                                if (validateStep1()) setStep(2);
                            } else if (step === 2) {
                                handleSubmitOrder();
                            }
                        }}
                        disabled={(step === 1 && cart.length === 0) || (step === 2 && paymentMethod === 'bank' && !file)}
                        className={`bg-primary hover:bg-white hover:text-primary text-white px-12 py-4 rounded-2xl font-black transition-all shadow-xl flex items-center gap-3 transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                    >
                        {step === 2 ? 'تأكيد الطلب الآن' : 'متابعة'} <ArrowLeft size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
