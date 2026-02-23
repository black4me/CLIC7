export interface Review {
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Game {
    id: string;
    title: string;
    slug?: string; // Clean URL slug
    price: number;
    image: string;
    gallery?: string[];
    tags?: string[]; // Added for strict filtering
    platform: 'PC' | 'PS5' | 'Xbox';
    genre: 'Action' | 'Adventure' | 'Sports' | 'RPG' | 'Shooter';
    releaseDate?: string;
    isFlashSale?: boolean;

    // Content Engine Fields
    article?: {
        headline: string;
        introText: string;
        fullContent: string; // Rich text
        gallery: string[];
        videoGallery: string[];
    };

    socialProof?: {
        playerCount: number; // "Live" count
        storyType: 'Fiction' | 'Real Events' | 'Sci-Fi' | 'Fantasy' | 'Historical';
        reviews: Review[];
    };
    originalPrice?: number;
    rating?: number;
    reviewsCount?: number; // Total count display
    userReviews?: Review[]; // Actual review objects
    videoUrl?: string;
    hoverVideoUrl?: string;
    trailerVideoUrl?: string;
    videoStart?: number;
    videoEnd?: number;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    features?: string[];
    seasonInfo?: string;
    featureHighlights?: string[];
    availablePlatforms?: ('PC' | 'PS5' | 'Xbox')[];
    stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER';
    lastUpdated?: {
        by: string;
        at: string;
    };
    currencyPackages?: {
        amount: number;
        price: number;
        originalPrice?: number;
        isPopular?: boolean;
    }[];
    proCard?: {
        price: number;
        originalPrice?: number;
        features: string[];
        buttonLink: string;
    };
    seasonUpdates?: {
        title: string;
        description: string;
        image: string;
    }[];
    hardwareExclusives?: {
        showPlayStationExclusives: boolean;
        showDualSenseEdge: boolean;
    };

    // Phase 13: Product Page Overhaul Fields
    heroHeadline?: string;
    heroSubHeadline?: string;
    heroImage?: string; // Separate from cover image
    videoCover?: string;
    trailerUrl?: string;
    activationSteps?: string[];
    relatedArticleIds?: string[];
    category?: 'game' | 'card';
}


export const games: Game[] = [
    // --- War / Shooters (العاب الحروب) ---
    {
        id: 'cod-bo6',
        title: 'Call of Duty: Black Ops 6',
        slug: 'bo6',
        price: 24.900,
        originalPrice: 29.900,
        image: '/assets/images/bo6.png', // Updated to real User Image
        tags: ['war', 'shooting', 'action'],
        platform: 'Xbox',
        genre: 'Shooter',
        isFlashSale: true,
        rating: 4.9,
        reviewsCount: 4200,
        videoUrl: 'Oc_DJm7se3M', // Battlefield Clip (Fits generic War)
        videoStart: 45,
        videoEnd: 85,
        description: 'عودة السلسلة الأسطورية مع بلاك أوبس 6. تجربة قتال واقعية، طور قصة سينمائي، وعودة طور الزومبي المحبوب.',
        features: ['طور قصة عميق', 'لعب جماعي تنافسي', 'زومبي الجولات', 'دعم 120 إطار'],
        category: 'game'
    },
    {
        id: 'bf-2042',
        title: 'Battlefield 2042',
        slug: 'battlefield-2042',
        price: 12.500,
        originalPrice: 25.000,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop',
        tags: ['war', 'shooting', 'multiplayer'],
        platform: 'PC',
        genre: 'Shooter',
        rating: 4.2,
        reviewsCount: 1500,
        videoUrl: 'Oc_DJm7se3M',
        videoStart: 10,
        videoEnd: 50,
        description: 'حرب شاملة في ساحات معارك ضخمة تتسع لـ 128 لاعباً. أسلحة مستقبلية ومركبات فتاكة.',
        features: ['خرائط ضخمة', '128 لاعب', 'طقس ديناميكي', 'مركبات متنوعة']
    },
    {
        id: 'helldivers-2',
        title: 'Helldivers 2',
        price: 16.900,
        image: 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?q=80&w=900&auto=format&fit=crop', // Sci-fi/Space
        platform: 'PS5',
        genre: 'Shooter',
        rating: 5.0,
        reviewsCount: 8000,
        videoUrl: 'T95WwXem8Vg', // Stalker 2 Clip (Sci-fi vibe)
        videoStart: 576,
        videoEnd: 616,
        description: 'انشر الديمقراطية في المجرة! لعبة تعاونية تتطلب التنسيق للقضاء على الحشرات والروبوتات.',
        features: ['لعب تعاوني', 'نيران صديقة', 'استراتيجيات عميقة', 'تحديثات مستمرة'],
        category: 'game'
    },
    {
        id: 'rainbow-six',
        title: 'Rainbow Six Siege',
        price: 8.000,
        image: 'https://images.unsplash.com/photo-1599547076295-a131804c554e?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Shooter',
        rating: 4.7,
        reviewsCount: 3000,
        videoUrl: 'ndbzxAP_kBM', // Hell Let Loose (Tac shooter vibe)
        videoStart: 20,
        videoEnd: 60,
        description: 'لعبة التصويب التكتيكية الأولى. دمر البيئة، خطط للهجوم، ونفذ بدقة متناهية.',
        features: ['تدمير واقعي', 'شخصيات متعددة', 'لعب تكتيكي', 'رياضة إلكترونية'],
        category: 'game'
    },
    {
        id: 'overwatch-2',
        title: 'Overwatch 2: Ultimate',
        price: 15.000,
        image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Shooter',
        rating: 4.5,
        reviewsCount: 2000,
        videoUrl: 'Oc_DJm7se3M',
        videoStart: 60,
        videoEnd: 100,
        description: 'أبطال خارقون بمعارك جماعية 5 ضد 5. اختر بطلك وسيطر على ساحة المعركة.',
        features: ['لعب مجاني', 'أبطال متنوعون', 'تحديثات موسمية', 'جرافيكس ملون'],
        category: 'game'
    },
    {
        id: 'squad-game',
        title: 'Squad',
        price: 18.500,
        image: 'https://images.unsplash.com/photo-1541437158782-f32a7620a2e5?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Shooter',
        rating: 4.8,
        reviewsCount: 900,
        videoUrl: 'ndbzxAP_kBM',
        videoStart: 100,
        videoEnd: 140,
        description: 'تجسيد واقعي للمعارك الحربية الحديثة. التعاون والتواصل هو مفتاح النصر.',
        features: ['واقعية مفرطة', 'خرائط ضخمة', 'بناء قواعد', 'تواصل صوتي'],
        category: 'game'
    },

    // --- Cars / Racing (السيارات والسباقات) ---
    {
        id: 'gt7',
        title: 'Gran Turismo 7',
        price: 22.000,
        originalPrice: 29.900,
        image: 'https://images.unsplash.com/photo-1555616658-6c39f15db47a?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        isFlashSale: true,
        rating: 4.9,
        reviewsCount: 1200,
        videoUrl: '5xK7Wr-86Ew', // GT7 Clip
        videoStart: 334,
        videoEnd: 374,
        description: 'محاكي القيادة الحقيقي. أكثر من 400 سيارة ومضامير عالمية بدقة 4K.',
        features: ['فيزياء واقعية', 'تعديل سيارات', 'طور مهنة', 'دعم VR'],
        category: 'game'
    },
    {
        id: 'forza-h5',
        title: 'Forza Horizon 5',
        price: 19.500,
        image: 'https://images.unsplash.com/photo-1605335193433-289b5c234a1d?q=80&w=900&auto=format&fit=crop',
        platform: 'Xbox',
        genre: 'Sports',
        rating: 4.9,
        reviewsCount: 5000,
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 100,
        videoEnd: 140,
        description: 'استكشف المكسيك في أكبر عالم مفتوح للسيارات. سباقات، استعراضات، ومتعة لا تنتهي.',
        features: ['عالم مفتوح', 'مئات السيارات', 'طقس متغير', 'لعب جماعي'],
        category: 'game'
    },
    {
        id: 'nfs-unbound',
        title: 'Need for Speed Unbound',
        price: 14.000,
        originalPrice: 28.000,
        image: 'https://images.unsplash.com/photo-1595787143151-e601da948ea8?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 200,
        videoEnd: 240,
        description: 'الشارع ملكك. سباقات ليلية ومطاردات شرطة بأسلوب فني جديد ومبتكر.',
        features: ['تعديل سيارات عميق', 'أسلوب أنمي', 'مطاردات شرطة', 'سباقات شوارع'],
        category: 'game'
    },
    {
        id: 'f1-24',
        title: 'F1 24',
        price: 26.000,
        image: 'https://images.unsplash.com/photo-1504212781498-33dfd2eae292?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Sports',
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 50,
        videoEnd: 90,
        description: 'كن أقرب للواقع من أي وقت مضى مع لعبة الفورمولا 1 الرسمية لموسم 2024.',
        features: ['فرق رسمية', 'فيزياء جديدة', 'طور قصة', 'حلبات واقعية'],
        category: 'game'
    },
    {
        id: 'asetto-corsa',
        title: 'Assetto Corsa Comp.',
        price: 11.000,
        image: 'https://images.unsplash.com/photo-1532467554877-33a595304652?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Sports',
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 300,
        videoEnd: 340,
        description: 'لعبة المحاكاة الرسمية لسباقات GT3. دقة لا تضاهى في القيادة والإحساس بالطريق.',
        features: ['محاكاة دقيقة', 'سيارات GT3', 'حلبات ممسوحة بالليزر', 'لعب تنافسي'],
        category: 'game'
    },
    {
        id: 'crew-motorfest',
        title: 'The Crew Motorfest',
        price: 21.000,
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 150,
        videoEnd: 190,
        description: 'احتفال بالسيارات في جزيرة هاواي الجميلة. سباقات، قوارب، وطائرات في مكان واحد.',
        features: ['عالم مفتوح استوائي', 'مركبات متنوعة', 'قوائم تشغيل', 'احتفالات'],
        category: 'game'
    },

    // --- Survival / Adventure (البقاء والمغامرة) ---
    {
        id: 'ark-ascended',
        title: 'Ark: Survival Ascended',
        price: 17.500,
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Adventure',
        videoUrl: 'T95WwXem8Vg', // Stalker Clip (Wilderness vibe)
        videoStart: 10,
        videoEnd: 50,
        description: 'عالم الديناصورات بجرافيكس Unreal Engine 5. روض، ابنِ، وانجُ في عالم متوحش.',
        features: ['جرافيكس UE5', 'ترويض ديناصورات', 'بناء قواعد', 'لعب جماعي'],
        category: 'game'
    },
    {
        id: 'rust-console',
        title: 'Rust: Console Edition',
        price: 19.000,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: 'T95WwXem8Vg',
        videoStart: 100,
        videoEnd: 140,
        description: 'الهدف الوحيد هو البقاء. تغلب على الجوع، العطش، والبرد... واللاعبين الآخرين.',
        features: ['بقاء قاسي', 'بناء وصنع', 'لعب جماعي (PVP)', 'تحديثات شهرية'],
        category: 'game'
    },
    {
        id: 'dayz',
        title: 'DayZ',
        price: 15.500,
        image: 'https://images.unsplash.com/photo-1623820256242-2dce306b3e0c?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Adventure',
        videoUrl: 'T95WwXem8Vg',
        videoStart: 200,
        videoEnd: 240,
        description: 'أشهر لعبة بقاء ضد الزومبي. خريطة ضخمة، مرض، وجوع. هل يمكنك الثقة بأحد؟',
        features: ['خريطة شاسعة', 'واقعية طبية', 'تفاعل لاعبين', 'لا توجد نقاط حفظ'],
        category: 'game'
    },
    {
        id: 'sons-forest',
        title: 'Sons of the Forest',
        price: 11.500,
        image: 'https://images.unsplash.com/photo-1533236319812-78d21b3d014c?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Adventure',
        videoUrl: 'T95WwXem8Vg',
        videoStart: 300,
        videoEnd: 340,
        description: 'أرسلت إلى جزيرة معزولة للبحث عن ملياردير مفقود، لتجد نفسك في جحيم من آكلي لحوم البشر.',
        features: ['رعب وبقاء', 'بناء متطور', 'ذكاء اصطناعي للأعداء', 'لعب تعاوني'],
        category: 'game'
    },
    {
        id: 're4-remake',
        title: 'Resident Evil 4 Remake',
        price: 16.000,
        image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: 'ndbzxAP_kBM',
        videoStart: 400,
        videoEnd: 440,
        description: 'إعادة تصور للعبة الرعب الكلاسيكية. ليون كينيدي في مهمة إنقاذ محفوفة بالمخاطر.',
        features: ['رعب وإثارة', 'جرافيكس مذهل', 'قصة أيقونية', 'نظام قتال محدث'],
        category: 'game'
    },
    {
        id: 'tlou-part1',
        title: 'The Last of Us Part I',
        price: 24.500,
        image: 'https://images.unsplash.com/photo-1560250643-4560737f226d?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: 'ndbzxAP_kBM',
        videoStart: 500,
        videoEnd: 540,
        description: 'القصة التي أبكت الملايين، الآن بجرافيكس الجيل الجديد. رحلة جول وإيلي عبر أمريكا المدمرة.',
        features: ['قصة مؤثرة', 'تخفي وقتال', 'جرافيكس واقعي', 'تحسينات اللعب'],
        category: 'game'
    },
    // --- New Adventure Games Injection ---
    {
        id: 'gow-ragnarok',
        title: 'God of War Ragnarök',
        slug: 'gow-ragnarok',
        price: 26.900,
        image: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/67f9zS9sqS0pT7p0Z7q2O4u1.png',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: 'hfJ4Km46A-0',
        description: 'انطلق في رحلة ملحمية ومؤثرة مع كراتوس وأتريوس، حيث يواجهان صراعاً مع الآلهة في قلب العوالم التسعة.',
        features: ['قتال سينمائي', 'قصة ملحمية', 'عالم مفتوح غني', 'دعم 4K'],
        tags: ['adventure', 'action', 'story'],
        category: 'game'
    },
    {
        id: 'h-forbidden-west',
        title: 'Horizon Forbidden West',
        slug: 'h-forbidden-west',
        price: 19.500,
        image: 'https://image.api.playstation.com/vulcan/ap/rnd/202107/3100/H8vB7B7vB7vB7vB7vB7vB7vB.png',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: 'Lq594XmpPBg',
        description: 'استكشف أراضي شاسعة ومجهولة، وواجه آلات مرعبة وضخمة في مستقبل بعيد غامض.',
        features: ['عالم مفتوح مذهل', 'قتال آلات تكتيكي', 'رسوميات جيل جديد', 'قصة عميقة'],
        tags: ['adventure', 'rpg', 'scifi'],
        category: 'game'
    },
    {
        id: 'ghost-of-tsushima',
        title: 'Ghost of Tsushima',
        slug: 'ghost-of-tsushima',
        price: 15.000,
        image: 'https://image.api.playstation.com/vulcan/ap/rnd/202106/2322/6J7J7J7J7J7J7J7J7J7J7J7J.png',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: 'm9Vp2sW7w4Y',
        description: 'قصة جين ساكاي، الساموراي الذي يجب عليه التضحية بكل شيء لإنقاذ جزيرة تسوشيما من الغزو المغولي.',
        features: ['أسلوب ساموراي واقعي', 'جزيرة تسوشيما الجميلة', 'طور شبح مرعب', 'دعم اللغة العربية'],
        tags: ['adventure', 'samurai', 'openworld'],
        category: 'game'
    },
    {
        id: 'spider-man-2',
        title: "Marvel's Spider-Man 2",
        slug: 'spider-man-2',
        price: 26.900,
        image: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/6R7R7R7R7R7R7R7R7R7R7R7R.png',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: '9fH5R6Y3I4Y',
        description: 'حلق وتأرجح في مدينة نيويورك مع بيتر باركر ومايلز موراليس لمواجهة الشرير "فينوم" في مغامرة سينمائية.',
        features: ['شخصيتان قابلتان للعب', 'تأرجح سريع جداً', 'أشرار مارفل الأيقونيين', 'دعم ميزات DualSense'],
        tags: ['adventure', 'superhero', 'action'],
        category: 'game'
    },
    {
        id: 'uncharted-lot',
        title: 'Uncharted: Legacy of Thieves',
        slug: 'uncharted-lot',
        price: 11.500,
        image: 'https://image.api.playstation.com/vulcan/ap/rnd/202111/1717/6K7K7K7K7K7K7K7K7K7K7K7K.png',
        platform: 'PS5',
        genre: 'Adventure',
        videoUrl: 'w7u5S7w7w7w',
        description: 'استعد للمغامرة مع ناثان دريك وكلو فريزر في رحلة للبحث عن كنوز مفقودة ومواجهة أخطار عالمية.',
        features: ['مغامرات سينمائية', 'ألغاز ذكية', 'أكشن لا يتوقف', 'تحسينات الجيل الجديد'],
        tags: ['adventure', 'treasure', 'action'],
        category: 'game'
    },

    // --- Football / Sports (كرة القدم والرياضة) ---
    {
        id: 'fc-25',
        title: 'EA SPORTS FC 25',
        price: 24.000,
        originalPrice: 30.000,
        image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        isFlashSale: true,
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 50,
        videoEnd: 90,
        description: 'اللعبة الشعبية الأولى عالمياً. تحكم في فريقك المفضل ونافس في أكبر البطولات.',
        features: ['واقعية المباريات', 'Ultimate Team', 'أطوار متعددة', 'تحديثات مباشرة'],
        category: 'game'
    },
    {
        id: 'efootball',
        title: 'eFootball 2025 Coins',
        price: 9.900,
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 120,
        videoEnd: 160,
        description: 'اشحن رصيدك في eFootball وابنِ فريق الأحلام الخاص بك. تنافس أونلاين بمهارة.',
        features: ['شحن فوري', 'بناء فريق', 'لعب مجاني', 'جرافيكس محسن'],
        category: 'game'
    },
    {
        id: 'nba-2k25',
        title: 'NBA 2K25',
        price: 21.000,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 200,
        videoEnd: 240,
        description: 'أفضل تجربة كرة سلة. وضع المهنة، MyTEAM، والحي (The City).',
        features: ['واقعية الحركات', 'طور قصة رياضي', 'لعب اونلاين', 'موسيقى رائعة'],
        category: 'game'
    },
    {
        id: 'wwe-2k24',
        title: 'WWE 2K24',
        price: 16.500,
        image: 'https://images.unsplash.com/photo-1628717341663-0007b0ee2597?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        videoUrl: 'ndbzxAP_kBM',
        videoStart: 10,
        videoEnd: 50,
        description: 'أعِد عيش 40 عاماً من الراسلمينيا. نجوم المصارعة الحاليين والأساطير في حلبة واحدة.',
        features: ['طور Showcase', 'مباريات متنوعة', 'قائمة مصارعين ضخمة', 'إنشاء مصارع'],
        category: 'game'
    },
    {
        id: 'madden-25',
        title: 'Madden NFL 25',
        price: 20.000,
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=900&auto=format&fit=crop',
        platform: 'Xbox',
        genre: 'Sports',
        videoUrl: '5xK7Wr-86Ew',
        videoStart: 10,
        videoEnd: 50,
        description: 'كرة القدم الأمريكية بأفضل حلة. تكتيكات، إدارة فرق، ولعب واقعي.',
        features: ['FieldSENSE', 'إدارة الفرنشايز', 'Ultimate Team', 'جرافيكس متطور'],
        category: 'game'
    },
    {
        id: 'ufc-5',
        title: 'UFC 5',
        price: 23.000,
        image: 'https://images.unsplash.com/photo-1599827471239-1c9f417cb34f?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Sports',
        videoUrl: 'ndbzxAP_kBM',
        videoStart: 60,
        videoEnd: 100,
        description: 'واقعية القتال المختلط. نظام ضرر حقيقي وجرافيكس مذهل بفضل محرك Frostbite.',
        features: ['نظام ضرر واقعي', 'إعادات سينمائية', 'مقاتلين حقيقيين', 'أطوار أونلاين'],
        category: 'game'
    },

    // --- Gift Cards / Balance (بطاقات الهدايا والرصيد) ---
    {
        id: 'steam-10-us',
        title: 'Steam Gift Card $10 (US)',
        slug: 'steam-10-us',
        price: 4.200,
        image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Adventure', // Generic or add 'Cards' to type
        tags: ['cards', 'steam', 'balance'],
        description: 'شحن رصيد ستيم للحسابات الأمريكية. تسليم فوري للكود.',
        stockStatus: 'IN_STOCK',
        category: 'card'
    },
    {
        id: 'psn-20-om',
        title: 'PSN Card $20 (Oman)',
        slug: 'psn-20-om',
        price: 8.500,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=900&auto=format&fit=crop',
        platform: 'PS5',
        genre: 'Adventure',
        tags: ['cards', 'psn', 'playstation'],
        description: 'بطاقة بلايستيشن ستور للحساب العماني بقيمة 20 دولار.',
        stockStatus: 'IN_STOCK',
        category: 'card'
    },
    {
        id: 'xbox-25-us',
        title: 'Xbox Gift Card $25 (US)',
        slug: 'xbox-25-us',
        price: 10.000,
        image: 'https://images.unsplash.com/photo-1621259182978-f09e5e2cd1bd?q=80&w=900&auto=format&fit=crop',
        platform: 'Xbox',
        genre: 'Adventure',
        tags: ['cards', 'xbox', 'microsoft'],
        description: 'بطاقة رصيد إكس بوكس للحسابات الأمريكية.',
        stockStatus: 'IN_STOCK',
        category: 'card'
    },
    {
        id: 'razer-gold-10',
        title: 'Razer Gold $10 (Global)',
        slug: 'razer-gold-10',
        price: 4.100,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Adventure',
        tags: ['cards', 'razer', 'gold'],
        description: 'ريزر جولد العالمي لشحن أكثر من 30,000 لعبة وتطبيق.',
        stockStatus: 'IN_STOCK',
        category: 'card'
    },
    {
        id: 'itunes-10-us',
        title: 'iTunes Gift Card $10 (US)',
        slug: 'itunes-10-us',
        price: 4.500,
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Adventure',
        tags: ['cards', 'itunes', 'apple'],
        description: 'بطاقة هدايا أبل لشحن رصيد الآيتونز والآب ستور.',
        stockStatus: 'IN_STOCK',
        category: 'card'
    },
    {
        id: 'roblox-10-us',
        title: 'Roblox $10 (800 Robux)',
        slug: 'roblox-10-us',
        price: 4.300,
        image: 'https://images.unsplash.com/photo-1635326444983-49035174092d?q=80&w=900&auto=format&fit=crop',
        platform: 'PC',
        genre: 'Adventure',
        tags: ['cards', 'roblox', 'robux'],
        description: 'شحن رصيد روبلوكس للحصول على 800 روبوكس.',
        stockStatus: 'IN_STOCK',
        category: 'card'
    }
];
