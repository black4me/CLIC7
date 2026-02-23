export interface Post {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    author: string;
    category: string;
}

export const posts: Post[] = [
    {
        id: 'gta6-leaks',
        title: 'تسريبات GTA VI: موعد الإطلاق الرسمي والميزات الجديدة',
        excerpt: 'كل ما نعرفه حتى الآن عن اللعبة الأكثر انتظاراً في التاريخ. تعرف على الخريطة الجديدة، الشخصيات، وموعد الصدور المتوقع.',
        content: '...', // Placeholder for rich content
        image: 'https://images.unsplash.com/photo-1560250643-4560737f226d?q=80&w=900&auto=format&fit=crop', // Generic high-res gaming
        date: '08 يناير 2026',
        author: 'أحمد سعيد',
        category: 'أخبار'
    },
    {
        id: 'ps5-pro-review',
        title: 'مراجعة PS5 Pro: هل يستحق الترقية؟',
        excerpt: 'اختبرنا الجهاز الجديد من سوني لنعرف هل يقدم قفزة حقيقية في الأداء مع ألعاب 4K و 120Hz.',
        content: '...',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=900&auto=format&fit=crop', // PS5 controller
        date: '05 يناير 2026',
        author: 'خالد محمد',
        category: 'مراجعات'
    },
    {
        id: 'best-games-2025',
        title: 'أفضل 10 ألعاب في عام 2025 يجب عليك تجربتها',
        excerpt: 'قائمة بأقوى العناوين التي صدرت هذا العام والتي لا يجب أن تفوتها.',
        content: '...',
        image: 'https://images.unsplash.com/photo-1593305841991-05c29736cec7?q=80&w=900&auto=format&fit=crop', // Gaming setup
        date: '01 يناير 2026',
        author: 'سارة العلي',
        category: 'قوائم'
    }
];
