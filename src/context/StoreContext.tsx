'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { games as initialGames, Game } from '@/data/games';

// Settings Types
export interface SeasonPass {
    id: string;
    title: string;
    gameId: string;
    status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED';
    price: number;
    image: string;
    phases: {
        number: string;
        name: string;
        englishName: string;
        summary: string;
        image: string;
        color: string;
    }[];
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    count?: number;
}

export interface SiteSettings {
    branding: {
        logo: string;
        favicon: string;
        siteName: string;
        currency: string;
    };
    theme: {
        primaryColor: string;
        backgroundColor: string;
        textColor: string;
        accentColor: string;
        backgroundImage: string;
        overlayOpacity: number;
        useBackgroundImage: boolean;
    };
    sections: {
        heroSlider: boolean;
        flashSales: boolean;
        trending: boolean;
        news: boolean;
        videoShowcase: boolean;
        categories: boolean;
        proCard: boolean; // New
        hardware: boolean; // New
    };
    proCardBuyLink: string; // New
    announcement: {
        text: string;
        enabled: boolean;
        speed: number;
    };
    contact: {
        whatsapp: string;
        email: string;
        bankAccount: string;
        instagram: string;
        tiktok: string;
        twitter: string;
        youtube: string;
    };
    seo: {
        description: string;
        keywords: string;
    };
    scripts: {
        header: string;
        footer: string;
    };
    aboutUs: {
        title: string;
        content: string;
        image: string;
    };
    privacyPolicy: {
        title: string;
        content: string;
    };
    paymentSettings: {
        paypal: {
            enabled: boolean;
            clientId: string;
            secretKey: string;
        };
    };
    enableLoyaltySystem: boolean;
    helpPage: {
        title: string;
        content: string;
    };
    marketing: {
        klaviyoPublicKey: string;
    };
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    role: 'OWNER' | 'MANAGER' | 'EDITOR';
    addedDate: string;
}

export interface AppUser {
    id: string;
    email: string;
    name: string;
    points: number;
    phone?: string;
}

export interface SystemLog {
    id: string;
    type: 'ERROR' | 'INFO' | 'WARNING';
    message: string;
    timestamp: string;
    stack?: string;
}

const defaultSettings: SiteSettings = {
    branding: {
        logo: '',
        favicon: '',
        siteName: 'CLIC7',
        currency: 'OMR'
    },
    theme: {
        primaryColor: '#0070D1',
        backgroundColor: '#0B0B0F',
        textColor: '#FFFFFF',
        accentColor: '#3192FF',
        backgroundImage: '',
        overlayOpacity: 0.8,
        useBackgroundImage: false
    },
    sections: {
        heroSlider: true,
        flashSales: true,
        trending: true,
        news: true,
        videoShowcase: true,
        categories: true,
        proCard: true,
        hardware: true
    },
    proCardBuyLink: 'https://clic7.com/pro',
    announcement: {
        text: 'مرحباً بكم في متجر CLIC7! 🚀 عروض خاصة بمناسبة الافتتاح',
        enabled: true,
        speed: 20
    },
    contact: {
        whatsapp: '+968 9000 0000',
        email: 'support@clic7.com',
        bankAccount: '0333 0000 4444 5555',
        instagram: '',
        tiktok: '',
        twitter: '',
        youtube: ''
    },
    seo: {
        description: 'متجر CLIC7 لأحدث الألعاب والاشتراكات',
        keywords: 'games, ps5, pc, xbox, subscriptions'
    },
    scripts: {
        header: '',
        footer: ''
    },
    aboutUs: {
        title: 'من نحن',
        content: 'متجر CLIC7 هو وجهتك الأولى للحصول على أفضل الألعاب والاشتراكات الرقمية بأفضل الأسعار وبخدمة عملاء متميزة.',
        image: ''
    },
    privacyPolicy: {
        title: 'سياسة الخصوصية',
        content: 'نحن نلتزم بحماية خصوصية بياناتك وتوفير تجربة تسوق آمنة وموثوقة لجميع عملائنا.'
    },
    paymentSettings: {
        paypal: {
            enabled: false,
            clientId: '',
            secretKey: ''
        }
    },
    enableLoyaltySystem: true,
    helpPage: {
        title: 'مركز المساعدة',
        content: '# Help Center\n\nWelcome to our help center. How can we assist you today?'
    },
    marketing: {
        klaviyoPublicKey: ''
    }
};

interface StoreContextType {
    games: Game[];
    addGame: (game: Game) => void;
    updateGame: (id: string, updates: Partial<Game>) => void;
    deleteGame: (id: string) => void;

    // Hero Slides
    heroSlides: HeroSlide[];
    updateHeroSlides: (slides: HeroSlide[]) => void;

    // Settings
    settings: SiteSettings;
    updateSettings: (newSettings: SiteSettings) => void;

    // Cart
    cart: Game[];
    addToCart: (game: Game) => void;
    removeFromCart: (id: string) => void;

    // Pre-Orders
    preOrders: PreOrder[];
    addPreOrder: (order: PreOrder) => void;

    // Season Passes
    seasonPasses: SeasonPass[];
    addSeasonPass: (pass: SeasonPass) => void;
    updateSeasonPass: (id: string, updates: Partial<SeasonPass>) => void;
    deleteSeasonPass: (id: string) => void;

    // Categories
    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // Orders (New)
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrder: (id: string, updates: Partial<Order>) => void;

    // Promotions
    discounts: DiscountCode[];
    addDiscount: (discount: DiscountCode) => void;
    deleteDiscount: (code: string) => void;

    giftCards: GiftCard[];
    addGiftCard: (card: GiftCard) => void;
    updateGiftCard: (code: string, updates: Partial<GiftCard>) => void;
    deleteGiftCard: (code: string) => void;

    // Logs
    logs: SystemLog[];
    addLog: (message: string, type?: SystemLog['type'], stack?: string) => void;
    clearLogs: () => void;

    // Staff
    staff: Staff[];
    addStaff: (member: Staff) => void;
    updateStaff: (id: string, updates: Partial<Staff>) => void;
    removeStaff: (id: string) => void;
    // Cart UI
    showCartModal: boolean;
    setShowCartModal: (open: boolean) => void;
    lastAddedGame: Game | null;
    validatePromo: (code: string) => { discount: DiscountCode | null, giftCard: GiftCard | null, error: string | null };

    // Loyalty Points
    users: AppUser[];
    currentUser: AppUser | null;
    updateUserPoints: (email: string, points: number, mode: 'ADD' | 'SET') => void;
}

export interface OrderItem {
    id: string;
    title: string;
    price: number;
    image: string;
}

export interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    items: OrderItem[];
    total: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
    date: string;
    paymentMethod: 'bank' | 'card';
    receiptUrl?: string;
    productKeys?: string[];
    points: number; // Loyalty points earned (1 OMR = 3 points)
}

export interface PreOrder {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    gameId: string;
    gameTitle: string;
    price: number;
    transactionId: string;
    date: string;
}

export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    color: string;
    ctaLink: string;
    ctaColor?: string;
    videoUrl?: string;
    order?: number;
}

const initialHeroSlides: HeroSlide[] = [
    {
        id: 1,
        title: "CALL OF DUTY: BLACK OPS 6",
        subtitle: "عودة الأسطورة - احجز نسختك الآن",
        image: "/assets/images/bo6.png",
        color: "#FF4500",
        ctaLink: "/game/cod-bo6",
        ctaColor: "#FF4500",
        order: 1
    },
    {
        id: 2,
        title: "GRAND TURISMO 7",
        subtitle: "تجربة القيادة الواقعية - متوفرة الآن",
        image: "https://images.unsplash.com/photo-1555616658-6c39f15db47a?q=80&w=1200&auto=format&fit=crop",
        color: "#3B82F6",
        ctaLink: "/game/gt7",
        ctaColor: "#3B82F6",
        order: 2
    },
    {
        id: 3,
        title: "ELDEN RING: SHADOW OF ERDTREE",
        subtitle: "توسعة القصة الجديدة - رحلة لا تنسى",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
        color: "#EAB308",
        ctaLink: "/game/elden-ring",
        ctaColor: "#EAB308",
        order: 3
    }
];

// Promotions
export interface DiscountCode {
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    active: boolean;
    uses: number;
}

export interface GiftCard {
    code: string;
    balance: number;
    active: boolean;
    scope: 'GLOBAL' | 'CATEGORY' | 'GAME';
    validTargets: string[]; // IDs or Slugs
    createdDate: string;
}

const initialCategories: Category[] = [
    { id: 'pc', name: 'PC Games', slug: 'pc', count: 15 },
    { id: 'ps5', name: 'PS5 Games', slug: 'ps5', count: 8 },
    { id: 'xbox', name: 'Xbox Games', slug: 'xbox', count: 5 },
    { id: 'flash-sales', name: 'Flash Sales', slug: 'flash-sales', count: 3 },
    { id: 'adventure', name: 'مغامرات وأكشن', slug: 'adventure', count: 5 },
];

const initialDiscounts: DiscountCode[] = [
    { code: 'BLACK4ME546', type: 'FIXED', value: 30, active: true, uses: 0 }
];
const initialGiftCards: GiftCard[] = [];
const initialStaff: Staff[] = [
    { id: '1', name: 'Super Owner', email: 'admin@clic7.com', role: 'OWNER', addedDate: new Date().toISOString() }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [games, setGames] = useState<Game[]>(initialGames);
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [cart, setCart] = useState<Game[]>([]);
    const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
    const [seasonPasses, setSeasonPasses] = useState<SeasonPass[]>([]);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [orders, setOrders] = useState<Order[]>([]);
    const [discounts, setDiscounts] = useState<DiscountCode[]>(initialDiscounts);
    const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [staff, setStaff] = useState<Staff[]>(initialStaff);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [lastAddedGame, setLastAddedGame] = useState<Game | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setGames(data);
                        console.log('Fetched products:', data.length);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch products from DB:', error);
                const savedGames = localStorage.getItem('clic7_games');
                if (savedGames) setGames(JSON.parse(savedGames));
            }
        };
        fetchProducts();

        try {
            const savedHero = localStorage.getItem('clic7_hero');
            if (savedHero) setHeroSlides(JSON.parse(savedHero));

            const savedSettings = localStorage.getItem('clic7_settings');
            if (savedSettings) setSettings(JSON.parse(savedSettings));

            // NEW: Anti-Crash Purge - If old cart exists, remove it immediately to free space
            localStorage.removeItem('clic7_cart');

            // Optimised Cart Hydration
            const savedCartIds = localStorage.getItem('clic7_cart_ids');
            const legacyCart = localStorage.getItem('clic7_cart');

            if (savedCartIds) {
                const ids = JSON.parse(savedCartIds);
                if (Array.isArray(ids)) {
                    // Reconstruct cart objects
                    // We need to look up games from initialGames AND saved games
                    const savedGamesStr = localStorage.getItem('clic7_games');
                    const savedGames = savedGamesStr ? JSON.parse(savedGamesStr) : [];
                    const allGames = [...initialGames, ...savedGames];

                    const hydratedCart = ids.map((id: string) =>
                        allGames.find(g => g.id === id)
                    ).filter(Boolean) as Game[];

                    setCart(hydratedCart);
                }
            } else if (legacyCart) {
                // Fallback for transition
                try {
                    setCart(JSON.parse(legacyCart));
                } catch (e) { console.error('Error parsing legacy cart', e); }
            }

            const savedPreOrders = localStorage.getItem('clic7_preorders');
            if (savedPreOrders) setPreOrders(JSON.parse(savedPreOrders));

            const savedPasses = localStorage.getItem('clic7_season_passes');
            if (savedPasses) {
                const parsed = JSON.parse(savedPasses);
                if (Array.isArray(parsed)) setSeasonPasses(parsed);
            }

            const savedCats = localStorage.getItem('clic7_categories');
            if (savedCats) {
                const parsed = JSON.parse(savedCats);
                if (Array.isArray(parsed)) setCategories(parsed);
            }

            // Limit orders to recent 100 only to save space
            const savedOrders = localStorage.getItem('clic7_orders');
            if (savedOrders) {
                const parsed = JSON.parse(savedOrders);
                if (Array.isArray(parsed)) setOrders(parsed.slice(-100));
            }

            const savedDiscounts = localStorage.getItem('clic7_discounts');
            if (savedDiscounts) setDiscounts(JSON.parse(savedDiscounts));

            const savedGiftCards = localStorage.getItem('clic7_giftcards');
            if (savedGiftCards) setGiftCards(JSON.parse(savedGiftCards));

            // Skip loading logs - they consume too much storage space
            // Clear any existing logs to free up space
            localStorage.removeItem('clic7_logs');

            const savedStaff = localStorage.getItem('clic7_staff');
            if (savedStaff) setStaff(JSON.parse(savedStaff));

            const savedUsers = localStorage.getItem('clic7_users');
            if (savedUsers) setUsers(JSON.parse(savedUsers));

            const savedCurrentUser = localStorage.getItem('clic7_current_customer');
            if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
        } catch (e) {
            console.error('Error loading state from localStorage:', e);
        }
    }, []);

    // Safe localStorage setter with automatic cleanup on quota exceeded
    const safeSetStorage = (key: string, value: any) => {
        let jsonStr: string;
        try {
            jsonStr = JSON.stringify(value);
            localStorage.setItem(key, jsonStr);
        } catch (e) {
            if (e instanceof Error && e.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded. Clearing old data...');
                try {
                    localStorage.removeItem('clic7_logs');
                    localStorage.removeItem('clic7_activity');
                    // Re-stringify in case it wasn't done above
                    jsonStr = JSON.stringify(value);
                    localStorage.setItem(key, jsonStr);
                } catch (retry) {
                    console.error('Still cannot save after cleanup:', key);
                }
            } else {
                console.error('Storage error:', e);
            }
        }
    };

    useEffect(() => {
        if (games !== initialGames) safeSetStorage('clic7_games', games);
    }, [games]);

    useEffect(() => {
        safeSetStorage('clic7_hero', heroSlides);
    }, [heroSlides]);

    useEffect(() => {
        safeSetStorage('clic7_settings', settings);
        // Apply dynamic CSS variables
        applyThemeVariables(settings.theme);
    }, [settings]);

    useEffect(() => {
        safeSetStorage('clic7_users', users);
    }, [users]);

    useEffect(() => {
        safeSetStorage('clic7_current_customer', currentUser);
    }, [currentUser]);

    useEffect(() => {
        try {
            // Optimize: Save only IDs to reduce storage usage
            const cartIds = cart.map(item => item.id);
            safeSetStorage('clic7_cart_ids', cartIds);
            // Cleanup old huge cart if exists
            localStorage.removeItem('clic7_cart');
        } catch (error) {
            console.error('Failed to save cart IDs:', error);
        }
    }, [cart]);

    useEffect(() => {
        safeSetStorage('clic7_preorders', preOrders);
    }, [preOrders]);

    useEffect(() => {
        safeSetStorage('clic7_season_passes', seasonPasses);
    }, [seasonPasses]);

    useEffect(() => {
        safeSetStorage('clic7_categories', categories);
    }, [categories]);

    useEffect(() => {
        // Limit to recent 100 orders to save space
        const recentOrders = orders.slice(-100);
        safeSetStorage('clic7_orders', recentOrders);
    }, [orders]);

    useEffect(() => {
        safeSetStorage('clic7_discounts', discounts);
    }, [discounts]);

    useEffect(() => {
        safeSetStorage('clic7_giftcards', giftCards);
    }, [giftCards]);

    // Skip saving logs - use in-memory only
    // This prevents QuotaExceededError

    useEffect(() => {
        safeSetStorage('clic7_staff', staff);
    }, [staff]);

    const applyThemeVariables = (theme: SiteSettings['theme']) => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--bg-color', theme.backgroundColor);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--accent-color', theme.accentColor);

        if (theme.useBackgroundImage && theme.backgroundImage) {
            root.style.setProperty('--bg-image', `url(${theme.backgroundImage})`);
            root.style.setProperty('--bg-overlay-opacity', theme.overlayOpacity.toString());
        } else {
            root.style.removeProperty('--bg-image');
            root.style.removeProperty('--bg-overlay-opacity');
        }
    };

    const addGame = async (game: Game) => {
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(game)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create product');
            }

            const data = await response.json();
            // Update local state with server-confirmed data
            setGames((prev) => [data.product || game, ...prev]);
            return data;
        } catch (error) {
            console.error('Sync failed', error);
            // Still update local state for offline mode
            setGames((prev) => [game, ...prev]);
            throw error;
        }
    };

    const updateGame = async (id: string, updates: Partial<Game>) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update product');
            }

            const data = await response.json();
            // Update local state with server-confirmed data
            setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
            return data;
        } catch (error) {
            console.error('Sync failed', error);
            // Still update local state for offline mode
            setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
            throw error;
        }
    };

    const deleteGame = async (id: string) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete product');
            }

            // Update local state after server confirmation
            setGames((prev) => prev.filter((g) => g.id !== id));
        } catch (error) {
            console.error('Sync failed', error);
            // Still update local state for offline mode
            setGames((prev) => prev.filter((g) => g.id !== id));
            throw error;
        }
    };

    const updateHeroSlides = (slides: HeroSlide[]) => setHeroSlides(slides);

    const updateSettings = (newSettings: SiteSettings) => setSettings(newSettings);

    const addToCart = (game: Game) => {
        setCart((prev) => {
            if (prev.some(item => item.id === game.id)) return prev;

            // Klaviyo Tracking: Added to Cart
            if ((window as any)._learnq) {
                (window as any)._learnq.push(['track', 'Added to Cart', {
                    ProductName: game.title,
                    ProductID: game.id,
                    Price: game.price,
                    ImageURL: game.image,
                    Brand: 'CLIC7',
                    AddedItemCategories: [game.genre]
                }]);
            }

            setLastAddedGame(game);
            setShowCartModal(true);
            return [...prev, game];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const addPreOrder = (order: PreOrder) => setPreOrders(prev => [order, ...prev]);
    const addSeasonPass = (pass: SeasonPass) => setSeasonPasses(prev => [pass, ...prev]);
    const updateSeasonPass = (id: string, updates: Partial<SeasonPass>) => {
        setSeasonPasses(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };
    const deleteSeasonPass = (id: string) => setSeasonPasses(prev => prev.filter(p => p.id !== id));

    const addCategory = (category: Category) => setCategories(prev => [...prev, category]);
    const updateCategory = (id: string, updates: Partial<Category>) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };
    const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

    const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
    const updateOrder = (id: string, updates: Partial<Order>) => {
        setOrders(prev => prev.map(o => {
            if (o.id === id) {
                const updated = { ...o, ...updates };
                // Loyalty Points Logic: 1 OMR = 10 Points
                if (updates.status === 'Completed' && o.status !== 'Completed') {
                    const pointsEarned = Math.floor(o.total * 10);
                    updateUserPoints(o.email, pointsEarned, 'ADD');
                }
                return updated;
            }
            return o;
        }));
    };

    const addDiscount = (discount: DiscountCode) => setDiscounts(prev => [...prev, discount]);
    const deleteDiscount = (code: string) => setDiscounts(prev => prev.filter(d => d.code !== code));

    const addGiftCard = (card: GiftCard) => setGiftCards(prev => [...prev, card]);
    const updateGiftCard = (code: string, updates: Partial<GiftCard>) => {
        setGiftCards(prev => prev.map(c => c.code === code ? { ...c, ...updates } : c));
    };
    const deleteGiftCard = (code: string) => setGiftCards(prev => prev.filter(c => c.code !== code));

    const addLog = (message: string, type: SystemLog['type'] = 'INFO', stack?: string) => {
        const newLog: SystemLog = {
            id: Date.now().toString(),
            type,
            message,
            timestamp: new Date().toISOString(),
            stack
        };
        setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    const clearLogs = () => setLogs([]);

    const addStaff = (member: Staff) => setStaff(prev => [...prev, member]);
    const updateStaff = (id: string, updates: Partial<Staff>) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };
    const removeStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));

    const updateUserPoints = (email: string, points: number, mode: 'ADD' | 'SET' = 'ADD') => {
        setUsers(prev => {
            const userIndex = prev.findIndex(u => u.email === email);
            if (userIndex > -1) {
                const updatedUsers = [...prev];
                const newPoints = mode === 'ADD' ? updatedUsers[userIndex].points + points : points;
                updatedUsers[userIndex] = { ...updatedUsers[userIndex], points: Math.max(0, newPoints) };

                // Also update currentUser if it's the same person
                if (currentUser?.email === email) {
                    setCurrentUser(updatedUsers[userIndex]);
                }

                return updatedUsers;
            } else {
                // Create new user if not exists
                const newUser: AppUser = {
                    id: Date.now().toString(),
                    email,
                    name: email.split('@')[0], // Fallback name
                    points: Math.max(0, points)
                };
                if (currentUser?.email === email) setCurrentUser(newUser);
                return [...prev, newUser];
            }
        });
    };

    const validatePromo = (code: string) => {
        const normalized = code.trim().toUpperCase();
        if (!normalized) return { discount: null, giftCard: null, error: 'Enter a code' };

        const discount = discounts.find(d => d.code.toUpperCase() === normalized && d.active);
        if (discount) return { discount, giftCard: null, error: null };

        const giftCard = giftCards.find(g => g.code.toUpperCase() === normalized && g.active && g.balance > 0);
        if (giftCard) return { discount: null, giftCard, error: null };

        return { discount: null, giftCard: null, error: 'Invalid or expired code' };
    };

    return (
        <StoreContext.Provider value={{
            games, addGame, updateGame, deleteGame,
            heroSlides, updateHeroSlides,
            settings, updateSettings,
            cart, addToCart, removeFromCart,
            preOrders, addPreOrder,
            seasonPasses, addSeasonPass, updateSeasonPass, deleteSeasonPass,
            categories, addCategory, updateCategory, deleteCategory,
            orders, addOrder, updateOrder,
            discounts, addDiscount, deleteDiscount,
            giftCards, addGiftCard, updateGiftCard, deleteGiftCard,
            logs, addLog, clearLogs,
            staff, addStaff, updateStaff, removeStaff,
            showCartModal, setShowCartModal, lastAddedGame,
            validatePromo,
            users, currentUser, updateUserPoints
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
