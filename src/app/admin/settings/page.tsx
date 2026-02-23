'use client';
import { useState, useRef, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Palette, Globe, Smartphone, Shield, Type, Monitor, Layers, Sliders, ChevronDown, ChevronUp, CreditCard, Star, MessageSquare } from 'lucide-react';
import { useStore, SiteSettings, HeroSlide } from '@/context/StoreContext';
import { toast } from 'sonner';
import Link from 'next/link';

import StaffManagement from './StaffManagement';

export default function AdminSettingsPage() {
    const { settings, updateSettings, heroSlides, updateHeroSlides } = useStore();
    const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'sections' | 'contact' | 'hero' | 'seo' | 'staff' | 'pages' | 'payments' | 'marketing'>('branding');
    const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
    const [localHero, setLocalHero] = useState<HeroSlide[]>(heroSlides);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('clic7_current_user');
        if (stored) setCurrentUser(JSON.parse(stored));
    }, []);

    // Image Upload Refs
    const logoRef = useRef<HTMLInputElement>(null);
    const faviconRef = useRef<HTMLInputElement>(null);
    const bgImageRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        updateSettings(localSettings);
        updateHeroSlides(localHero);
        toast.success('Settings & Slider Updated Successfully!', {
            style: { background: '#10B981', color: '#fff' }
        });
    };

    const handleSlideImageUpload = (file: File | null, idx: number) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newHero = [...localHero];
                newHero[idx] = { ...newHero[idx], image: reader.result as string };
                setLocalHero(newHero);
            };
            reader.readAsDataURL(file);
        }
    };

    // Image Upload & Drag-and-Drop Handlers
    const handleImageUpload = (file: File | null, type: 'logo' | 'favicon' | 'bg') => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                if (type === 'logo') setLocalSettings({ ...localSettings, branding: { ...localSettings.branding, logo: url } });
                if (type === 'favicon') setLocalSettings({ ...localSettings, branding: { ...localSettings.branding, favicon: url } });
                if (type === 'bg') setLocalSettings({ ...localSettings, theme: { ...localSettings.theme, backgroundImage: url, useBackgroundImage: true } });
            };
            reader.readAsDataURL(file);
        }
    };

    const onDrop = (e: React.DragEvent, type: 'logo' | 'favicon' | 'bg') => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        handleImageUpload(file, type);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'bg') => {
        const file = e.target.files?.[0] || null;
        handleImageUpload(file, type);
    };

    const toggleSection = (section: keyof SiteSettings['sections']) => {
        setLocalSettings({
            ...localSettings,
            sections: { ...localSettings.sections, [section]: !localSettings.sections[section] }
        });
    };

    const moveSlide = (idx: number, direction: 'up' | 'down') => {
        const newHero = [...localHero];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

        if (targetIdx >= 0 && targetIdx < newHero.length) {
            [newHero[targetIdx], newHero[idx]] = [newHero[idx], newHero[targetIdx]];
            setLocalHero(newHero);
        }
    };

    const updateSlide = (idx: number, field: keyof HeroSlide, value: any) => {
        const newHero = [...localHero];
        newHero[idx] = { ...newHero[idx], [field]: value };
        setLocalHero(newHero);
    };

    return (
        <div className="max-w-6xl mx-auto pb-24 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Branding & Theme Engine</h1>
                    <p className="text-gray-400 mt-2 font-medium">تحكم في هوية المتجر، الألوان، والأقسام المعروضة.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/" target="_blank">
                        <button className="bg-white/5 hover:bg-white/10 text-white p-4 rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2 active:scale-95 cursor-pointer" title="الاستعراض الحي (Live Preview)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                            <span className="hidden md:inline">الاستعراض الحي</span>
                        </button>
                    </Link>
                    <button
                        onClick={handleSave}
                        className="bg-[#0070D1] hover:bg-[#005bb5] text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 transition-all shadow-[0_10px_30_rgba(0,112,209,0.3)] active:scale-95 cursor-pointer"
                    >
                        <Save size={20} />
                        حفظ الإعدادات
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* NAVIGATION TABS */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'branding', label: 'هوية الموقع', icon: Globe },
                        { id: 'theme', label: 'المظهر والألوان', icon: Palette },
                        { id: 'hero', label: 'بنرات السلايدر', icon: Sliders },
                        { id: 'sections', label: 'إدارة الأقسام', icon: Layers },
                        { id: 'contact', label: 'التواصل والروابط', icon: Smartphone },
                        { id: 'payments', label: 'بوابات الدفع', icon: CreditCard },
                        { id: 'pages', label: 'إدارة الصفحات', icon: Layers },
                        { id: 'seo', label: 'الأرشفة والأكواد', icon: Shield },
                        { id: 'marketing', label: 'التسويق (Klaviyo)', icon: MessageSquare },
                        { id: 'staff', label: 'إدارة الفريق', icon: Shield, requiredRole: 'OWNER' },
                    ].filter(tab => !tab.requiredRole || (currentUser?.role === tab.requiredRole)).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all border ${activeTab === tab.id
                                ? 'bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/10'
                                : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="lg:col-span-9 space-y-6">
                    {/* 1. BRANDING TAB */}
                    {activeTab === 'branding' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Globe className="text-primary" /> BRANDING HUB
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Site Logo (Drag & Drop)</label>
                                    <div
                                        onClick={() => logoRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => onDrop(e, 'logo')}
                                        className="aspect-square w-48 bg-black/50 rounded-[30px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative group"
                                    >
                                        {localSettings.branding.logo ? (
                                            <img src={localSettings.branding.logo} className="w-full h-full object-contain p-4" alt="Logo" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="text-gray-600 group-hover:text-primary mx-auto mb-2" size={32} />
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Click or Drag Logo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">Change Logo</div>
                                    </div>
                                    <input type="file" ref={logoRef} hidden onChange={(e) => handleFileChange(e, 'logo')} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Favicon (Drag & Drop)</label>
                                    <div
                                        onClick={() => faviconRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => onDrop(e, 'favicon')}
                                        className="w-24 h-24 bg-black/50 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative group"
                                    >
                                        {localSettings.branding.favicon ? (
                                            <img src={localSettings.branding.favicon} className="w-full h-full object-contain p-4" alt="Favicon" />
                                        ) : (
                                            <ImageIcon className="text-gray-600 group-hover:text-primary" size={24} />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-bold">Change</div>
                                    </div>
                                    <input type="file" ref={faviconRef} hidden onChange={(e) => handleFileChange(e, 'favicon')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Logo URL Fallback</label>
                                    <input
                                        value={localSettings.branding.logo}
                                        onChange={(e) => setLocalSettings({ ...localSettings, branding: { ...localSettings.branding, logo: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-primary outline-none"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Favicon URL Fallback</label>
                                    <input
                                        value={localSettings.branding.favicon}
                                        onChange={(e) => setLocalSettings({ ...localSettings, branding: { ...localSettings.branding, favicon: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-primary outline-none"
                                        placeholder="https://example.com/favicon.ico"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest block pr-2">Site Display Name</label>
                                    <input
                                        type="text"
                                        value={localSettings.branding.siteName}
                                        onChange={(e) => setLocalSettings({ ...localSettings, branding: { ...localSettings.branding, siteName: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest block pr-2">Currency Code (رمز العملة)</label>
                                    <input
                                        type="text"
                                        value={localSettings.branding.currency}
                                        onChange={(e) => setLocalSettings({ ...localSettings, branding: { ...localSettings.branding, currency: e.target.value } })}
                                        placeholder="مثال: OMR"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black font-mono outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* New: Global Pro Card Link */}
                            <div className="pt-6 border-t border-white/5">
                                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">رابط بطاقة الاحتراف العام (Pro Card Global Buy Link)</label>
                                <input
                                    type="text"
                                    value={localSettings.proCardBuyLink || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, proCardBuyLink: e.target.value })}
                                    placeholder="https://clic7.com/subscription/pro"
                                    className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-5 text-white font-bold outline-none focus:border-primary transition-all"
                                    dir="ltr"
                                />
                                <p className="text-[10px] text-gray-500 mt-2">سيتم استخدام هذا الرابط لجميع ألعاب المتجر ما لم يتم تحديد رابط مخصص داخل صفحة المنتج.</p>
                            </div>

                            {/* New: Loyalty System Toggle */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between bg-yellow-500/5 p-6 rounded-2xl border border-yellow-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                            <Star size={24} className="text-yellow-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg text-yellow-500 uppercase italic">Enable Loyalty System</h4>
                                            <p className="text-xs text-gray-400">تفعيل نظام النقاط والمكافآت (1 OMR = 10 Pts)</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLocalSettings({ ...localSettings, enableLoyaltySystem: !localSettings.enableLoyaltySystem })}
                                        className={`w-14 h-8 rounded-full transition-all relative ${localSettings.enableLoyaltySystem ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.enableLoyaltySystem ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">رقم حساب بنك مسقط (Bank Account)</label>
                                <input
                                    value={localSettings.contact?.bankAccount || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, contact: { ...localSettings.contact!, bankAccount: e.target.value } })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-xs focus:border-primary outline-none"
                                    placeholder="0333 0000 4444 5555"
                                    dir="ltr"
                                />
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-black text-sm uppercase flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${localSettings.announcement?.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                        شريط الإعلانات المتحرك (Marquee)
                                    </h4>
                                    <button
                                        onClick={() => setLocalSettings(prev => ({ ...prev, announcement: { ...prev.announcement!, enabled: !prev.announcement?.enabled } }))}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${localSettings.announcement?.enabled ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-400'}`}
                                    >
                                        {localSettings.announcement?.enabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={localSettings.announcement?.text || ''}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, announcement: { ...prev.announcement!, text: e.target.value } }))}
                                    placeholder="اكتب الإعلان هنا..."
                                    className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-4 text-white font-bold focus:border-purple-500 outline-none shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all"
                                />
                                <div className="flex items-center gap-4">
                                    <label className="text-xs text-gray-500 font-bold whitespace-nowrap">السرعة:</label>
                                    <input
                                        type="range" min="5" max="50" step="1"
                                        value={localSettings.announcement?.speed || 20}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, announcement: { ...prev.announcement!, speed: Number(e.target.value) } }))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. THEME TAB */}
                    {activeTab === 'theme' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Palette className="text-primary" /> DYNAMIC THEME ENGINE
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { id: 'primaryColor', label: 'اللون الأساسي (Primary)' },
                                    { id: 'accentColor', label: 'لون التمييز (Accent)' },
                                    { id: 'backgroundColor', label: 'لون الخلفية (BG)' },
                                    { id: 'textColor', label: 'لون النص (Text)' },
                                ].map((item) => (
                                    <div key={item.id} className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                        <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-tighter">{item.label}</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={localSettings.theme[item.id as keyof typeof localSettings.theme] as string}
                                                onChange={(e) => setLocalSettings({
                                                    ...localSettings,
                                                    theme: { ...localSettings.theme, [item.id]: e.target.value }
                                                })}
                                                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                                            />
                                            <span className="font-mono text-sm uppercase">{localSettings.theme[item.id as keyof typeof localSettings.theme] as string}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Background Image Options */}
                            <div className="pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h4 className="font-bold">خلفية الموقع (Background Image)</h4>
                                        <p className="text-xs text-gray-500 mt-1">تطبيق صورة خلفية مخصصة بدلاً من اللون السادة.</p>
                                    </div>
                                    <button
                                        onClick={() => setLocalSettings({ ...localSettings, theme: { ...localSettings.theme, useBackgroundImage: !localSettings.theme.useBackgroundImage } })}
                                        className={`w-14 h-8 rounded-full relative transition-all ${localSettings.theme.useBackgroundImage ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${localSettings.theme.useBackgroundImage ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                {localSettings.theme.useBackgroundImage && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-200">
                                        <div
                                            onClick={() => bgImageRef.current?.click()}
                                            className="aspect-video bg-black/50 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative group"
                                        >
                                            {localSettings.theme.backgroundImage ? (
                                                <img src={localSettings.theme.backgroundImage} className="w-full h-full object-cover" alt="BG" />
                                            ) : (
                                                <ImageIcon className="text-gray-600" size={32} />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">رفع صورة الخلفية</div>
                                        </div>
                                        <input type="file" ref={bgImageRef} hidden onChange={(e) => handleFileChange(e, 'bg')} />

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">شفافية غطاء اللون (Overlay Opacity)</label>
                                            <input
                                                type="range" min="0" max="1" step="0.1"
                                                value={localSettings.theme.overlayOpacity}
                                                onChange={(e) => setLocalSettings({ ...localSettings, theme: { ...localSettings.theme, overlayOpacity: Number(e.target.value) } })}
                                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between text-xs font-mono text-gray-400">
                                                <span>CLEAR</span>
                                                <span>DARK</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. HERO TAB - SLIDER MANAGER */}
                    {activeTab === 'hero' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Sliders className="text-primary" /> SLIDER & CTA ASSETS
                            </h3>
                            <div className="space-y-4">
                                {localHero.map((slide, idx) => (
                                    <div key={slide.id} className="bg-black/30 p-6 rounded-3xl border border-white/5 space-y-6 group">
                                        {/* HEADER: Title & Order Controls */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold border border-white/10">#{idx + 1}</span>
                                                <h4 className="font-black italic uppercase text-lg">{slide.title}</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                <button disabled={idx === 0} onClick={() => moveSlide(idx, 'up')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"><ChevronUp size={18} /></button>
                                                <button disabled={idx === localHero.length - 1} onClick={() => moveSlide(idx, 'down')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"><ChevronDown size={18} /></button>
                                            </div>
                                        </div>
                                        {/* EDITABLE FIELDS */}
                                        <div className="space-y-4 border-t border-white/5 pt-4">
                                            {/* 1. TEXT CONTENT */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Headline (Title)</label>
                                                    <input
                                                        value={slide.title}
                                                        onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:border-primary outline-none"
                                                        placeholder="e.g. LEVEL UP YOUR EXPERIENCE"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Sub-headline</label>
                                                    <input
                                                        value={slide.subtitle}
                                                        onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-gray-400 focus:border-primary outline-none"
                                                        placeholder="e.g. Discover the latest AAA titles..."
                                                    />
                                                </div>
                                            </div>
                                            {/* 2. MEDIA ASSETS */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Image URL / Upload</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={slide.image}
                                                            onChange={(e) => updateSlide(idx, 'image', e.target.value)}
                                                            className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-xs focus:border-primary outline-none"
                                                            placeholder="https://example.com/image.jpg"
                                                            dir="ltr"
                                                        />
                                                        <label className="bg-white/10 hover:bg-white/20 p-3 rounded-lg cursor-pointer transition-colors border border-white/5">
                                                            <ImageIcon size={18} className="text-gray-300" />
                                                            <input type="file" hidden onChange={(e) => handleSlideImageUpload(e.target.files?.[0] || null, idx)} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Video Background URL (Optional)</label>
                                                    <input
                                                        value={slide.videoUrl || ''}
                                                        onChange={(e) => updateSlide(idx, 'videoUrl', e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs focus:border-primary outline-none"
                                                        placeholder="https://example.com/video.mp4"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            {/* 3. CTA SETTINGS */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">CTA Link (Shop Now)</label>
                                                    <input
                                                        value={slide.ctaLink}
                                                        onChange={(e) => updateSlide(idx, 'ctaLink', e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs font-bold font-mono focus:border-primary outline-none"
                                                        placeholder="/game/id"
                                                        dir="ltr"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Button Color</label>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="color"
                                                            value={slide.ctaColor || slide.color}
                                                            onChange={(e) => updateSlide(idx, 'ctaColor', e.target.value)}
                                                            className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                                                        />
                                                        <span className="text-xs font-mono text-gray-400">{slide.ctaColor || slide.color}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. SECTIONS TAB */}
                    {activeTab === 'sections' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Layers className="text-primary" /> SECTION CONTROLS
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'heroSlider', label: 'بنر السلايدر الرئيسي', desc: 'إظهار/إخفاء السلايد الرئيسي العلوي' },
                                    { id: 'flashSales', label: 'قسم العروض الصاعقة', desc: 'إظهار/إخفاء ألعاب Flash Sale' },
                                    { id: 'trending', label: 'قسم الألعاب الشائعة', desc: 'إظهار/إخفاء قسم الأكثر مبيعاً' },
                                    { id: 'categories', label: 'قسم التصنيفات السريع', desc: 'إظهار/إخفاء شبكة التصنيفات' },
                                    { id: 'proCard', label: 'قسم بطاقة الاحتراف (Pro Card)', desc: 'إظهار/إخفاء قسم البرو كارد في الصفحة الرئيسية' },
                                    { id: 'hardware', label: 'قسم Hardware Exclusives', desc: 'إظهار/إخفاء قسم قطع الهاردوير' },
                                    { id: 'news', label: 'قسم الأخبار والمدونة', desc: 'إظهار/إخفاء المقالات والأخبار' },
                                ].map((item) => (
                                    <div key={item.id} className="bg-black/30 p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight">{item.label}</h4>
                                            <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleSection(item.id as any)}
                                            className={`w-12 h-6 rounded-full relative transition-all ${localSettings.sections[item.id as keyof SiteSettings['sections']] ? 'bg-primary shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localSettings.sections[item.id as keyof SiteSettings['sections']] ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 5. CONTACT TAB */}
                    {activeTab === 'contact' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Smartphone className="text-primary" /> CONTACT & SOCIALS
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">رقم الواتساب (Global Support)</label>
                                    <input
                                        value={localSettings.contact.whatsapp}
                                        onChange={(e) => setLocalSettings({ ...localSettings, contact: { ...localSettings.contact, whatsapp: e.target.value } })}
                                        placeholder="968xxxx"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none font-bold"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Support Email</label>
                                    <input
                                        value={localSettings.contact.email}
                                        onChange={(e) => setLocalSettings({ ...localSettings, contact: { ...localSettings.contact, email: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none font-bold"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                {[
                                    { id: 'instagram', label: 'Instagram', color: 'border-pink-500/30 font-black' },
                                    { id: 'tiktok', label: 'TikTok', color: 'border-cyan-500/30' },
                                    { id: 'youtube', label: 'YouTube', color: 'border-red-500/30' },
                                    { id: 'twitter', label: 'Twitter (X)', color: 'border-white/30' },
                                ].map((s) => (
                                    <div key={s.id}>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{s.label} Link</label>
                                        <input
                                            value={localSettings.contact[s.id as keyof typeof localSettings.contact]}
                                            onChange={(e) => setLocalSettings({ ...localSettings, contact: { ...localSettings.contact, [s.id]: e.target.value } })}
                                            className={`w-full bg-black/50 border rounded-xl p-4 text-xs focus:border-white outline-none ${s.color}`}
                                            placeholder={`https://${s.id}.com/username`}
                                            dir="ltr"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. SEO TAB */}
                    {activeTab === 'seo' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Shield className="text-primary" /> SEO & SCRIPTS
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Meta Description</label>
                                    <textarea
                                        value={localSettings.seo.description}
                                        onChange={(e) => setLocalSettings({ ...localSettings, seo: { ...localSettings.seo, description: e.target.value } })}
                                        className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none"
                                        placeholder="اكتب وصفاً لمحركات البحث..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Keywords (Separated by commas)</label>
                                    <input
                                        value={localSettings.seo.keywords}
                                        onChange={(e) => setLocalSettings({ ...localSettings, seo: { ...localSettings.seo, keywords: e.target.value } })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none"
                                        placeholder="games, cod, fifa, clic7..."
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-red-500/80 mb-2 uppercase tracking-tighter">Header Inject (Meta Pixel, Google Analytics)</label>
                                    <textarea
                                        value={localSettings.scripts.header}
                                        onChange={(e) => setLocalSettings({ ...localSettings, scripts: { ...localSettings.scripts, header: e.target.value } })}
                                        className="w-full h-32 bg-black/60 border border-red-500/10 rounded-xl p-4 text-xs font-mono text-gray-400 focus:border-red-500 outline-none"
                                        placeholder="<script>...</script>"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 7. PAGES TAB */}
                    {activeTab === 'pages' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-10 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Layers className="text-primary" /> PAGES CONTENT MANAGER
                            </h3>

                            {/* About Us Section */}
                            <div className="space-y-6">
                                <h4 className="font-bold text-lg border-r-4 border-primary pr-3 flex items-center gap-2">
                                    <Globe size={20} className="text-primary" /> صفحة "من نحن" (About Us)
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">العنوان (Title)</label>
                                        <input
                                            value={localSettings.aboutUs?.title || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, aboutUs: { ...localSettings.aboutUs!, title: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-primary outline-none"
                                            placeholder="أدخل عنوان الصفحة..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">المحتوى (Content)</label>
                                        <textarea
                                            value={localSettings.aboutUs?.content || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, aboutUs: { ...localSettings.aboutUs!, content: e.target.value } })}
                                            className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 text-white leading-relaxed focus:border-primary outline-none resize-none"
                                            placeholder="اكتب تفاصيل عن المتجر..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">رابط الصورة (Image URL)</label>
                                        <div className="flex gap-4">
                                            <input
                                                value={localSettings.aboutUs?.image || ''}
                                                onChange={(e) => setLocalSettings({ ...localSettings, aboutUs: { ...localSettings.aboutUs!, image: e.target.value } })}
                                                className="flex-grow bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 focus:border-primary outline-none"
                                                placeholder="https://example.com/about-image.jpg"
                                                dir="ltr"
                                            />
                                            {localSettings.aboutUs?.image && (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                                                    <img src={localSettings.aboutUs.image} className="w-full h-full object-cover" alt="Preview" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Policy Section */}
                            <div className="pt-10 border-t border-white/5 space-y-6">
                                <h4 className="font-bold text-lg border-r-4 border-primary pr-3 flex items-center gap-2">
                                    <Shield size={20} className="text-primary" /> صفحة "سياسة الخصوصية" (Privacy Policy)
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">العنوان (Title)</label>
                                        <input
                                            value={localSettings.privacyPolicy?.title || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, privacyPolicy: { ...localSettings.privacyPolicy!, title: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-primary outline-none"
                                            placeholder="سياسة الخصوصية والبنود..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">الشروط والأحكام (Terms & Privacy Content)</label>
                                        <textarea
                                            value={localSettings.privacyPolicy?.content || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, privacyPolicy: { ...localSettings.privacyPolicy!, content: e.target.value } })}
                                            className="w-full h-64 bg-black/50 border border-white/10 rounded-xl p-4 text-white leading-relaxed focus:border-primary outline-none resize-none"
                                            placeholder="اكتب بنود الخصوصية هنا..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Help Page Section */}
                            <div className="pt-10 border-t border-white/5 space-y-6">
                                <h4 className="font-bold text-lg border-r-4 border-yellow-500 pr-3 flex items-center gap-2">
                                    <Plus size={20} className="text-yellow-500" /> صفحة "مركز المساعدة" (Help Center)
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">العنوان (Title)</label>
                                        <input
                                            value={localSettings.helpPage?.title || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, helpPage: { ...localSettings.helpPage!, title: e.target.value } })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-yellow-500 outline-none"
                                            placeholder="مركز المساعدة والدعم..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">محتوى المساعدة (Help Content - Markdown Supported)</label>
                                        <textarea
                                            value={localSettings.helpPage?.content || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, helpPage: { ...localSettings.helpPage!, content: e.target.value } })}
                                            className="w-full h-80 bg-black/50 border border-white/10 rounded-xl p-4 text-white leading-relaxed focus:border-yellow-500 outline-none resize-none font-mono text-sm"
                                            placeholder="اكتب تعليمات المساعدة والأسئلة الشائعة هنا..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 8. PAYMENTS TAB */}
                    {activeTab === 'payments' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-10 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <CreditCard className="text-primary" /> PAYMENT GATEWAYS (بوابات الدفع)
                            </h3>

                            <div className="space-y-8">
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <CreditCard className="text-primary" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">PayPal Express Checkout</h4>
                                            <p className="text-xs text-gray-500">تمكين الدفع التلقائي عبر باي بال (PayPal Gateway)</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLocalSettings({
                                            ...localSettings,
                                            paymentSettings: {
                                                ...localSettings.paymentSettings,
                                                paypal: { ...localSettings.paymentSettings.paypal, enabled: !localSettings.paymentSettings.paypal.enabled }
                                            }
                                        })}
                                        className={`w-14 h-8 rounded-full transition-all relative ${localSettings.paymentSettings?.paypal?.enabled ? 'bg-primary' : 'bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.paymentSettings?.paypal?.enabled ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">PayPal Client ID</label>
                                        <input
                                            type="password"
                                            value={localSettings.paymentSettings?.paypal?.clientId || ''}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings,
                                                paymentSettings: {
                                                    ...localSettings.paymentSettings,
                                                    paypal: { ...localSettings.paymentSettings.paypal, clientId: e.target.value }
                                                }
                                            })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-primary outline-none"
                                            placeholder="Enter PayPal Client ID..."
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">PayPal Secret Key</label>
                                        <input
                                            type="password"
                                            value={localSettings.paymentSettings?.paypal?.secretKey || ''}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings,
                                                paymentSettings: {
                                                    ...localSettings.paymentSettings,
                                                    paypal: { ...localSettings.paymentSettings.paypal, secretKey: e.target.value }
                                                }
                                            })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-primary outline-none"
                                            placeholder="Enter PayPal Secret Key..."
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex items-start gap-4">
                                    <Shield className="text-primary mt-1" size={20} />
                                    <div className="text-sm">
                                        <h5 className="font-bold text-primary mb-1">تشفير أمني عالي</h5>
                                        <p className="text-gray-400">يتم تشفير هذه المفاتيح محلياً وتستخدم فقط لمعالجة عمليات الدفع. لا تشارك هذه المفاتيح مع أي شخص آخر.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 9. MARKETING TAB */}
                    {activeTab === 'marketing' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <MessageSquare className="text-primary" /> MARKETING & CRM (KLAVIYO)
                            </h3>

                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <MessageSquare className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Klaviyo Email Marketing</h4>
                                        <p className="text-xs text-gray-500">اربط متجرك بمنصة Klaviyo لتتبع الزوار وإرسال رسائل تسويقية.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Klaviyo Public API Key</label>
                                        <input
                                            type="text"
                                            value={localSettings.marketing?.klaviyoPublicKey || ''}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings,
                                                marketing: { ...localSettings.marketing, klaviyoPublicKey: e.target.value }
                                            })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-primary outline-none"
                                            placeholder="Enter your Public API Key (e.g. AB12CD)"
                                            dir="ltr"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">تجده في إعدادات Klaviyo تحت قسم (API Keys {"->"} Public API Key / Site ID).</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">إعدادات التتبع التلقائي:</h5>
                                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <li className="flex items-center gap-2 text-[10px] text-green-500 font-bold bg-green-500/5 px-3 py-2 rounded-lg border border-green-500/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Viewed Product
                                        </li>
                                        <li className="flex items-center gap-2 text-[10px] text-green-500 font-bold bg-green-500/5 px-3 py-2 rounded-lg border border-green-500/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Added to Cart
                                        </li>
                                        <li className="flex items-center gap-2 text-[10px] text-green-500 font-bold bg-green-500/5 px-3 py-2 rounded-lg border border-green-500/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Started Checkout
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 10. STAFF TAB */}
                    {activeTab === 'staff' && currentUser?.role === 'OWNER' && (
                        <div className="bg-[#1A1A1A] p-8 rounded-[30px] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <StaffManagement />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
