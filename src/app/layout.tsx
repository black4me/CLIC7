import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { cn } from '@/utils/cn'
import { StoreProvider } from '@/context/StoreContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import SiteLayout from '@/components/SiteLayout';
import { Toaster } from 'sonner';
import KlaviyoTracker from '@/components/KlaviyoTracker';

const cairo = Cairo({
    subsets: ['arabic'],
    variable: '--font-cairo',
    display: 'swap',
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl" className="dark">
            <body className={cn(cairo.variable, "font-sans min-h-screen")}>
                <StoreProvider>
                    <ThemeWrapper>
                        <SiteLayout>
                            {children}
                        </SiteLayout>
                        <KlaviyoTracker />
                        <Toaster position="top-center" theme="dark" richColors />
                    </ThemeWrapper>
                </StoreProvider>
            </body>
        </html >
    )
}

export const metadata: Metadata = {
    title: {
        template: '%s | CLIC7 Store',
        default: 'CLIC7 | المتجر الأول للألعاب الرقمية في عُمان',
    },
    description: 'اشترِ أحدث ألعاب PC, PS5, Xbox بأسعار تنافسية وتسليم فوري. متجر عماني 100% يدعم الدفع المحلي.',
    keywords: ['ألعاب', 'بطاقات رقمية', 'بلايستيشن', 'PC', 'Steam', 'Oman Gamers', 'متجر ألعاب'],
    authors: [{ name: 'CLIC7 Team' }],
    openGraph: {
        type: 'website',
        locale: 'ar_OM',
        url: 'https://clic7.com',
        siteName: 'CLIC7',
        images: [
            {
                url: '/assets/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'CLIC7 Store',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@clic7store',
    },
    icons: {
        icon: '/favicon.ico',
    }
};
