'use client';

import { useStore } from '@/context/StoreContext';
import { useEffect } from 'react';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const { settings } = useStore();

    useEffect(() => {
        // This ensures the variables are applied immediately on the client side
        const theme = settings.theme;
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

        // Favicon handling
        if (settings.branding.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = settings.branding.favicon;
        }

        // Header Scripts Injection (Careful with this)
        if (settings.scripts.header) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = settings.scripts.header;
            Array.from(tempDiv.childNodes).forEach(node => {
                if (node instanceof HTMLScriptElement) {
                    const script = document.createElement('script');
                    Array.from(node.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
                    script.innerHTML = node.innerHTML;
                    document.head.appendChild(script);
                }
            });
        }
    }, [settings]);

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Full Site Background Image (if enabled) */}
            {settings.theme.useBackgroundImage && settings.theme.backgroundImage && (
                <div
                    className="fixed inset-0 z-[-1] pointer-events-none transition-all duration-700"
                    style={{
                        backgroundImage: `url(${settings.theme.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div
                        className="absolute inset-0 bg-black transition-opacity duration-700"
                        style={{ opacity: settings.theme.overlayOpacity }}
                    />
                </div>
            )}
            {children}

            {/* Footer Scripts Injection */}
            {settings.scripts.footer && (
                <div dangerouslySetInnerHTML={{ __html: settings.scripts.footer }} />
            )}
        </div>
    );
}
