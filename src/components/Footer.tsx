'use client';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, ExternalLink, ChevronRight, Gamepad2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
    const { settings } = useStore();
    const contact = settings?.contact;

    const columns = [
        {
            title: 'المنتجات',
            links: [
                { name: 'ألعاب PC', href: '/pc' },
                { name: 'ألعاب PS5', href: '/ps5' },
                { name: 'ألعاب Xbox', href: '/xbox' },
                { name: 'البطاقات الرقمية', href: '/cards' },
                { name: 'العروض الأسبوعية', href: '/flash-sales' }
            ]
        },
        {
            title: 'القيم والهوية',
            links: [
                { name: 'عن CLIC7', href: '/about' },
                { name: 'الأمان والخصوصية', href: '/privacy' },
                { name: 'شروط الخدمة', href: '/terms' },
                { name: 'الاستدامة', href: '/sustainability' }
            ]
        },
        {
            title: 'الدعم الفني',
            links: [
                { name: 'مركز المساعدة', href: '/help' },
                { name: 'حالة الطلب', href: '/orders' },
                { name: 'سياسة الاسترجاع', href: '/refund' },
                { name: 'اتصل بنا', href: '/contact' }
            ]
        },
        {
            title: 'المصادر',
            links: [
                { name: 'الأسئلة الشائعة', href: '/faq' },
                { name: 'المدونة', href: '/blog' },
                { name: 'البرنامج التابع', href: '/affiliate' },
                { name: 'المطورين', href: '/dev' }
            ]
        }
    ];

    return (
        <footer className="bg-black text-white pt-24 pb-12 border-t border-white/5">
            {/* Breadcrumb Section */}
            <div className="max-w-[1600px] mx-auto px-4 lg:px-12 mb-20">
                <nav className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <Link href="/games" className="hover:text-white transition-colors">Games</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-300">Battlefield 6</span>
                    <ChevronRight size={14} />
                    <span className="text-primary italic">Season Updates</span>
                </nav>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="text-3xl font-black italic tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
                            {settings?.branding?.logo ? (
                                <img src={settings.branding.logo} alt="CLIC7" className="h-10 w-auto" />
                            ) : (
                                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">CLIC7</span>
                            )}
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                            وجهتك الأولى والأكثر موثوقية للحصول على أحدث مفاتيح الألعاب والبطاقات الرقمية في الخليج العربي.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { Icon: Facebook, href: '#' }, // Facebook not in contact type
                                { Icon: Twitter, href: contact?.twitter },
                                { Icon: Instagram, href: contact?.instagram },
                                { Icon: Youtube, href: contact?.youtube }
                            ].map((s, i) => s.href && (
                                <a key={i} href={s.href} target="_blank" className="p-2 bg-white/5 rounded-lg hover:bg-primary transition-all group">
                                    <s.Icon size={18} className="text-gray-400 group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {columns.map((column, i) => (
                        <div key={i} className="space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">{column.title}</h4>
                            <ul className="space-y-4">
                                {column.links.map((link, j) => (
                                    <li key={j}>
                                        <Link href={link.href} className="text-gray-400 hover:text-white text-sm font-bold transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} CLIC7 Store. All Rights Reserved. Designed for Battlefield Experience.
                    </p>
                    <div className="flex gap-8">
                        <div className="flex items-center gap-6">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Visa" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Mastercard" />
                        </div>
                        <div className="text-[10px] font-black text-gray-600 flex items-center gap-2">
                            <span>OMAN</span>
                            <div className="w-4 h-3 bg-red-600 rounded-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
