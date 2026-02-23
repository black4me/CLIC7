'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Save, ArrowLeft, Image as ImageIcon, DollarSign, CloudUpload, FileText, Star, Trash2, Youtube, Monitor, Laptop, Gamepad2, Play, X, Loader2, ExternalLink } from 'lucide-react';
import { Game } from '@/data/games';
import { toast } from 'sonner';
import { getYouTubeID, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/utils/youtube';

interface ProductFormProps {
    initialData?: Partial<Game>;
    onSubmit: (gameData: Game) => void;
    isLoading: boolean;
    buttonText?: string;
}

export default function ProductForm({ initialData, onSubmit, isLoading, buttonText = 'حفظ المنتج' }: ProductFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'enhanced'>('basic');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [formData, setFormData] = useState<Partial<Game>>({
        id: '',
        title: '',
        slug: '',
        metaTitle: '',
        metaDescription: '',
        description: '',
        price: 0,
        originalPrice: 0,
        genre: 'Action',
        platform: 'PS5',
        image: '',
        videoUrl: '',
        hoverVideoUrl: '',
        trailerVideoUrl: '',
        gallery: [],
        features: [],
        stockStatus: 'IN_STOCK',
        seasonInfo: '',
        featureHighlights: [],
        availablePlatforms: ['PC'],
        currencyPackages: [],
        proCard: { price: 0, features: [], buttonLink: '' },
        seasonUpdates: [
            { title: 'Phase 1', description: '', image: '' },
            { title: 'Phase 2', description: '', image: '' },
            { title: 'Phase 3', description: '', image: '' }
        ],
        hardwareExclusives: { showPlayStationExclusives: false, showDualSenseEdge: false },
        heroHeadline: '',
        heroSubHeadline: '',
        heroImage: '',
        videoCover: '',
        activationSteps: [],
        relatedArticleIds: [],
        lastUpdated: { by: 'Admin', at: '' },
        ...initialData
    });

    const [newFeature, setNewFeature] = useState('');

    // Update image preview when formData.image changes
    useEffect(() => {
        if (formData.image) {
            setImagePreview(formData.image);
        } else {
            setImagePreview('');
        }
    }, [formData.image]);

    useEffect(() => {
        if (initialData && initialData.id) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                availablePlatforms: initialData.availablePlatforms || (initialData.platform ? [initialData.platform as any] : ['PC']),
                featureHighlights: initialData.featureHighlights || [],
                slug: initialData.slug || initialData.id,
                activationSteps: initialData.activationSteps || [],
                relatedArticleIds: initialData.relatedArticleIds || []
            }));
        }
    }, [initialData]);

    const validateSlug = (slug: string) => {
        return slug
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Manual Validation
        if (!formData.title?.trim()) {
            toast.error('الرجاء إدخال اسم المنتج');
            setActiveTab('basic');
            return;
        }
        if (!formData.price || formData.price <= 0) {
            toast.error('الرجاء إدخال سعر صحيح');
            setActiveTab('basic');
            return;
        }

        // Parse YouTube IDs
        const hoverUrl = formData.hoverVideoUrl || formData.videoUrl;
        const trailerUrl = formData.trailerVideoUrl;

        const parsedVideoId = getYouTubeID(hoverUrl || '');
        const parsedTrailerId = getYouTubeID(trailerUrl || '');

        if (hoverUrl && !parsedVideoId) {
            toast.error('رابط الفيديو الاستعراضي غير صحيح (YouTube URL invalid)');
            setActiveTab('seo');
            return;
        }
        if (trailerUrl && !parsedTrailerId) {
            toast.error('رابط التريلر غير صحيح (YouTube URL invalid)');
            setActiveTab('seo');
            return;
        }

        const finalSlug = validateSlug(formData.slug || formData.title.toLowerCase());

        const gameData: Game = {
            id: formData.id || finalSlug,
            title: formData.title || '',
            slug: finalSlug,
            metaTitle: formData.metaTitle || formData.title,
            metaDescription: formData.metaDescription || (formData.description?.substring(0, 160) || ''),
            description: formData.description || '',
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice) || 0,
            genre: (formData.genre as any) || 'Action',
            platform: (formData.platform as any) || (formData.availablePlatforms?.[0] || 'PC'),
            image: formData.image || '/assets/images/bo6.png',
            videoUrl: parsedVideoId || 'Oc_DJm7se3M',
            hoverVideoUrl: parsedVideoId || '',
            trailerVideoUrl: parsedTrailerId || '',
            videoStart: formData.videoStart || 10,
            videoEnd: formData.videoEnd || 50,
            features: formData.features?.length ? formData.features : ['تسليم فوري', 'ضمان مدى الحياة', 'دعم فني 24/7'],
            rating: formData.rating || 5.0,
            reviewsCount: formData.reviewsCount || 0,
            isFlashSale: (Number(formData.originalPrice) || 0) > Number(formData.price),
            stockStatus: (formData.stockStatus as any) || 'IN_STOCK',
            seasonInfo: formData.seasonInfo || '',
            featureHighlights: formData.featureHighlights || [],
            availablePlatforms: formData.availablePlatforms || ['PC'],
            currencyPackages: formData.currencyPackages || [],
            proCard: formData.proCard || { price: 0, features: [], buttonLink: '' },
            seasonUpdates: formData.seasonUpdates || [],
            hardwareExclusives: formData.hardwareExclusives || { showPlayStationExclusives: false, showDualSenseEdge: false },

            heroHeadline: formData.heroHeadline || formData.title,
            heroSubHeadline: formData.heroSubHeadline || formData.description?.slice(0, 50),
            heroImage: formData.heroImage || formData.image,
            videoCover: formData.videoCover || '',
            activationSteps: formData.activationSteps || [],
            relatedArticleIds: formData.relatedArticleIds || [],

            lastUpdated: {
                by: 'Admin',
                at: new Date().toISOString()
            }
        };

        onSubmit(gameData);
    };

    const addFeatureHighlight = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                featureHighlights: [...(prev.featureHighlights || []), newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeatureHighlight = (index: number) => {
        setFormData(prev => ({
            ...prev,
            featureHighlights: (prev.featureHighlights || []).filter((_, i) => i !== index)
        }));
    };

    const togglePlatform = (p: 'PC' | 'PS5' | 'Xbox') => {
        setFormData(prev => {
            const platforms = prev.availablePlatforms || [];
            if (platforms.includes(p)) {
                if (platforms.length === 1) return prev;
                return { ...prev, availablePlatforms: platforms.filter(x => x !== p) };
            }
            return { ...prev, availablePlatforms: [...platforms, p] };
        });
    };

    // Handle file upload
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show immediate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setUploadingImage(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);

            const response = await fetch('/api/upload/product-image', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success('تم رفع الصورة بنجاح!');
            } else {
                toast.error(data.error || 'فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('حدث خطأ أثناء رفع الصورة');
        } finally {
            setUploadingImage(false);
        }
    };

    // Handle direct URL input
    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, image: url }));
    };

    // YouTube Video Preview Component
    const YouTubePreview = ({ url, label }: { url: string; label: string }) => {
        const [showPlayer, setShowPlayer] = useState(false);
        const videoId = getYouTubeID(url);
        const thumbnailUrl = videoId ? getYouTubeThumbnailUrl(videoId) : null;
        const embedUrl = videoId ? getYouTubeEmbedUrl(url) : null;

        if (!videoId) {
            return (
                <div className="mt-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs text-red-400 flex items-center gap-2">
                        <X size={14} />
                        رابط يوتيوب غير صالح
                    </p>
                </div>
            );
        }

        return (
            <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-green-400 flex items-center gap-2">
                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            تم التعرف على ID: {videoId}
                        </span>
                    </p>
                </div>
                
                {!showPlayer ? (
                    <div 
                        className="relative aspect-video bg-black/50 rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => setShowPlayer(true)}
                    >
                        {thumbnailUrl ? (
                            <img 
                                src={thumbnailUrl} 
                                alt={`${label} thumbnail`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/50">
                                <Youtube size={48} className="text-red-500" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <Play size={32} className="text-white ml-1" fill="white" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                        <iframe
                            src={`${embedUrl}?autoplay=1`}
                            title={label}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        <button
                            onClick={() => setShowPlayer(false)}
                            className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
            {/* Header with Save Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 sticky top-0 z-30 shadow-xl backdrop-blur-md bg-opacity-90">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white">{formData.title || 'منتج جديد'}</h2>
                    <p className="text-gray-400 text-xs">إدارة كافة تفاصيل المنتج من مكان واحد</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isLoading || uploadingImage}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 cursor-pointer"
                    >
                        <Save size={20} />
                        {isLoading ? 'جاري الحفظ...' : buttonText}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Editor Section */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'basic' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            المعلومات الأساسية
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('seo')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'seo' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            SEO و الوسائط
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('enhanced')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'enhanced' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            المميزات المتقدمة
                        </button>
                    </div>

                    {/* Tab 1: Basic Info */}
                    {activeTab === 'basic' && (
                        <div className="space-y-6 motion-safe:animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">اسم المنتج</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors"
                                        placeholder="مثال: Battlefield 2042"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">وصف المنتج</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors"
                                        placeholder="اكتب وصفاً تفصيلياً للعبة..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">التسعير (OMR)</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">السعر الحالي</label>
                                            <input
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                type="number"
                                                step="0.001"
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">السعر الأصلي (للخصم)</label>
                                            <input
                                                value={formData.originalPrice}
                                                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                                type="number"
                                                step="0.001"
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">التصنيف والمنصة</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">المنصة الأساسية</label>
                                            <select
                                                value={formData.platform}
                                                onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none text-white"
                                            >
                                                <option value="PC">PC</option>
                                                <option value="PS5">PS5</option>
                                                <option value="Xbox">Xbox</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">نوع اللعبة</label>
                                            <select
                                                value={formData.genre}
                                                onChange={(e) => setFormData({ ...formData, genre: e.target.value as any })}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none text-white"
                                            >
                                                <option value="Action">Action</option>
                                                <option value="Adventure">Adventure</option>
                                                <option value="Shooter">Shooter</option>
                                                <option value="RPG">RPG</option>
                                                <option value="Sports">Sports</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: SEO & Media */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6 motion-safe:animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-6">
                                <h3 className="font-bold flex items-center gap-2"><ImageIcon size={18} className="text-primary" /> إعدادات SEO الروابط</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">الرابط المخصص (Slug)</label>
                                        <div className="relative">
                                            <input
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                type="text"
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors"
                                                placeholder="battlefield-2042-standard-edition"
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
                                                clic7.com/game/
                                            </div>
                                        </div>
                                        <p className="mt-1 text-[10px] text-gray-500">سوف يتم تنظيف الرابط تلقائياً عند الحفظ (مثال: battle-field-6)</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">عنوان SEO (Meta Title)</label>
                                            <input
                                                value={formData.metaTitle}
                                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                                type="text"
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">وصف SEO (Meta Description)</label>
                                            <input
                                                value={formData.metaDescription}
                                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                                type="text"
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-6">
                                <h3 className="font-bold flex items-center gap-2"><Youtube size={18} className="text-red-500" /> روابط فيديو اليوتيوب</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <Youtube size={14} className="text-red-600" />
                                            Preview (Hover Preview / Shorts)
                                        </label>
                                        <input
                                            value={formData.hoverVideoUrl}
                                            onChange={(e) => setFormData({ ...formData, hoverVideoUrl: e.target.value })}
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white"
                                            placeholder="انسخ رابط اليوتيوب هنا..."
                                        />
                                        {formData.hoverVideoUrl && (
                                            <YouTubePreview url={formData.hoverVideoUrl} label="Preview Video" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <Youtube size={14} className="text-red-600" />
                                            Full Trailer / Showcase
                                        </label>
                                        <input
                                            value={formData.trailerVideoUrl}
                                            onChange={(e) => setFormData({ ...formData, trailerVideoUrl: e.target.value })}
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white"
                                            placeholder="رابط تريلر اللعبة الكامل..."
                                        />
                                        {formData.trailerVideoUrl && (
                                            <YouTubePreview url={formData.trailerVideoUrl} label="Trailer Video" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Enhanced Features */}
                    {activeTab === 'enhanced' && (
                        <div className="space-y-6 motion-safe:animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Season Updates Section */}
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#0070D1]/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-6 bg-[#0070D1] rounded-full" />
                                    <h3 className="font-bold text-lg text-white">إعلان الموسم (Season Info Banner)</h3>
                                </div>
                                <textarea
                                    value={formData.seasonInfo}
                                    onChange={(e) => setFormData({ ...formData, seasonInfo: e.target.value })}
                                    className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#0070D1] outline-none transition-colors"
                                    placeholder="مثال: الموسم السادس: الظلام المحتوم - متاح الآن..."
                                />
                            </div>

                            {/* Pro Card Section */}
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-white">🏎️ بطاقة الاحتراف (Pro Card Settings)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2">سعر البطاقة</label>
                                            <input
                                                type="number"
                                                value={formData.proCard?.price}
                                                onChange={(e) => setFormData({ ...formData, proCard: { ...formData.proCard!, price: Number(e.target.value) } })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2">رابط الشراء المباشر</label>
                                            <input
                                                type="text"
                                                value={formData.proCard?.buttonLink}
                                                onChange={(e) => setFormData({ ...formData, proCard: { ...formData.proCard!, buttonLink: e.target.value } })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">المميزات (سطر لكل ميزة)</label>
                                        <textarea
                                            value={formData.proCard?.features?.join('\n')}
                                            onChange={(e) => setFormData({ ...formData, proCard: { ...formData.proCard!, features: e.target.value.split('\n').filter(Boolean) } })}
                                            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                                            placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Holiday/Phases Section */}
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-white">📅 مراحل المنتج (Phases / Roadmap)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[0, 1, 2].map((idx) => (
                                        <div key={idx} className="space-y-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                                            <h4 className="text-primary font-black uppercase text-[10px] tracking-[0.2em]">Phase {idx + 1}</h4>
                                            <input
                                                type="text"
                                                value={formData.seasonUpdates?.[idx]?.title}
                                                onChange={(e) => {
                                                    const newSeasons = [...(formData.seasonUpdates || [])];
                                                    newSeasons[idx] = { ...newSeasons[idx], title: e.target.value };
                                                    setFormData({ ...formData, seasonUpdates: newSeasons });
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                                                placeholder="العنوان"
                                            />
                                            <textarea
                                                value={formData.seasonUpdates?.[idx]?.description}
                                                onChange={(e) => {
                                                    const newSeasons = [...(formData.seasonUpdates || [])];
                                                    newSeasons[idx] = { ...newSeasons[idx], description: e.target.value };
                                                    setFormData({ ...formData, seasonUpdates: newSeasons });
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none h-20"
                                                placeholder="الوصف"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hero Section Settings */}
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-white">🎬 إعدادات الهيرو (Hero Design)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">العنوان الرئيسي (Hero Headline)</label>
                                        <input
                                            type="text"
                                            value={formData.heroHeadline}
                                            onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                                            placeholder="عنوان سينمائي ضخم..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">العنوان الفرعي (Sub-headline)</label>
                                        <input
                                            type="text"
                                            value={formData.heroSubHeadline}
                                            onChange={(e) => setFormData({ ...formData, heroSubHeadline: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                                            placeholder="وصف قصير ومثير..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">صورة الهيرو (تختلف عن الغلاف)</label>
                                        <input
                                            type="text"
                                            value={formData.heroImage}
                                            onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Activation Steps */}
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-white">🔑 خطوات التفعيل (Activation Steps)</h3>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, activationSteps: [...(formData.activationSteps || []), ''] })}
                                        className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30 transition-all font-bold"
                                    >
                                        + إضافة خطوة
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.activationSteps?.map((step, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="flex items-center justify-center w-8 h-10 font-black text-gray-600">{idx + 1}</span>
                                            <input
                                                type="text"
                                                value={step}
                                                onChange={(e) => {
                                                    const newSteps = [...(formData.activationSteps || [])];
                                                    newSteps[idx] = e.target.value;
                                                    setFormData({ ...formData, activationSteps: newSteps });
                                                }}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                                                placeholder={`الخطوة ${idx + 1}...`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, activationSteps: formData.activationSteps?.filter((_, i) => i !== idx) })}
                                                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Highlights (Re-added here) */}
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold mb-4 flex items-center gap-2">✨ مميزات اللعبة (Feature Highlights)</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addFeatureHighlight(e)}
                                            type="text"
                                            className="flex-1 bg-black/50 border border-white/10 rounded-xl p-4 outline-none focus:border-primary"
                                            placeholder="اضف ميزة جديدة..."
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => addFeatureHighlight(e)}
                                            className="bg-primary hover:bg-primary-dark p-4 rounded-xl transition-all active:scale-95"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {formData.featureHighlights?.map((f, i) => (
                                            <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center group transition-all hover:border-white/20">
                                                <span className="text-sm font-medium">{f}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeatureHighlight(i)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Currency Packages (Common in Enhanced) */}
                            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                    <h3 className="font-bold flex items-center gap-2">💰 حزم العملات</h3>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            currencyPackages: [...(prev.currencyPackages || []), { amount: 0, price: 0, originalPrice: 0, isPopular: false }]
                                        }))}
                                        className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30 transition-all font-bold"
                                    >
                                        + إضافة حزمة
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.currencyPackages?.map((pkg, idx) => (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-black/40 p-4 rounded-xl items-end relative group">
                                            <div className="md:col-span-1">
                                                <label className="block text-[10px] text-gray-500 mb-1 font-bold">الكمية</label>
                                                <input
                                                    type="number"
                                                    value={pkg.amount}
                                                    onChange={(e) => {
                                                        const newPkgs = [...(formData.currencyPackages || [])];
                                                        newPkgs[idx].amount = Number(e.target.value);
                                                        setFormData({ ...formData, currencyPackages: newPkgs });
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-[10px] text-gray-500 mb-1 font-bold">السعر</label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={pkg.price}
                                                    onChange={(e) => {
                                                        const newPkgs = [...(formData.currencyPackages || [])];
                                                        newPkgs[idx].price = Number(e.target.value);
                                                        setFormData({ ...formData, currencyPackages: newPkgs });
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-1 flex items-center justify-center pb-2">
                                                <label className="flex items-center gap-2 cursor-pointer group/check">
                                                    <input
                                                        type="checkbox"
                                                        checked={pkg.isPopular}
                                                        onChange={(e) => {
                                                            const newPkgs = [...(formData.currencyPackages || [])];
                                                            newPkgs[idx].isPopular = e.target.checked;
                                                            setFormData({ ...formData, currencyPackages: newPkgs });
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-4 h-4 rounded border ${pkg.isPopular ? 'bg-primary border-primary' : 'border-white/20'}`} />
                                                    <span className="text-[10px] text-gray-400 group-hover/check:text-gray-200 transition-colors">عروض مميزة</span>
                                                </label>
                                            </div>
                                            <div className="md:col-span-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPkgs = (formData.currencyPackages || []).filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, currencyPackages: newPkgs });
                                                    }}
                                                    className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} className="mx-auto" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Sticky Section */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Status Tracker */}
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">📊 حالة المنتج</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">حالة التوفر</label>
                                <select
                                    value={formData.stockStatus}
                                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as any })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                                >
                                    <option value="IN_STOCK">متوفر حالياً</option>
                                    <option value="OUT_OF_STOCK">غير متوفر</option>
                                    <option value="PRE_ORDER">طلب مسبق</option>
                                </select>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 italic text-[10px] text-gray-500 flex justify-between">
                                <span>آخر تحديث:</span>
                                <span>{formData.lastUpdated?.at ? new Date(formData.lastUpdated.at).toLocaleString('ar-OM') : 'غير محدد'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section - Enhanced */}
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">🖼️ صورة المنتج</h3>
                        
                        {/* Image Preview Area */}
                        <div
                            onClick={() => !uploadingImage && handleImageClick()}
                            className={`aspect-[4/5] bg-black/50 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden ${uploadingImage ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                            {uploadingImage ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="text-primary animate-spin" size={40} />
                                    <span className="text-sm text-gray-400 font-medium">جاري رفع الصورة...</span>
                                </div>
                            ) : imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="text-center">
                                            <CloudUpload size={40} className="text-white mx-auto mb-2" />
                                            <span className="text-sm text-white font-medium">تغيير الصورة</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <CloudUpload className="text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all" size={32} />
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">اختيار صورة الغلاف</span>
                                    <span className="text-[10px] text-gray-600">انقر هنا أو اسحب الصورة</span>
                                </div>
                            )}
                        </div>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploadingImage}
                        />
                        
                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="px-2 bg-[#1A1A1A] text-gray-500">أو</span>
                            </div>
                        </div>
                        
                        {/* Direct URL Input */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">رابط صورة مباشر</label>
                            <input
                                value={formData.image}
                                onChange={handleImageUrlChange}
                                type="text"
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-gray-300 outline-none focus:border-primary"
                                placeholder="https://..."
                            />
                            <p className="text-[10px] text-gray-600">
                                الصورة ستظهر في المتجر فوراً بعد الإدخال
                            </p>
                        </div>
                    </div>

                    {/* Multi-Platform Support */}
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold mb-4">الدعم المتعدد للمنصات</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'PC', icon: Monitor, color: '#9333ea' },
                                { id: 'PS5', icon: Gamepad2, color: '#0070D1' },
                                { id: 'Xbox', icon: Laptop, color: '#10b981' }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => togglePlatform(p.id as any)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${formData.availablePlatforms?.includes(p.id as any)
                                        ? `bg-white/10 border-white/20 text-white`
                                        : 'bg-black/20 border-white/5 text-gray-600'
                                        }`}
                                    style={{ borderColor: formData.availablePlatforms?.includes(p.id as any) ? p.color : '' }}
                                >
                                    <p.icon size={20} style={{ color: formData.availablePlatforms?.includes(p.id as any) ? p.color : '' }} />
                                    <span className="text-[10px] font-bold">{p.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hardware Toggle */}
                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="font-bold">أقسام Hardware (للمتحكمات فقط)</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <span className="text-[10px] font-bold text-gray-300">PlayStation Exclusives</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.hardwareExclusives?.showPlayStationExclusives}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            hardwareExclusives: { ...formData.hardwareExclusives || { showPlayStationExclusives: false, showDualSenseEdge: false }, showPlayStationExclusives: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                            </label>
                            <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <span className="text-[10px] font-bold text-gray-300">DualSense Edge Section</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.hardwareExclusives?.showDualSenseEdge}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            hardwareExclusives: { ...formData.hardwareExclusives || { showPlayStationExclusives: false, showDualSenseEdge: false }, showDualSenseEdge: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
