'use client';

import { useEffect } from 'react';
import { useStore } from '@/context/StoreContext';

declare global {
    interface Window {
        _learnq: any[];
    }
}

export default function KlaviyoTracker() {
    const { settings } = useStore();
    const klaviyoKey = settings.marketing?.klaviyoPublicKey;

    useEffect(() => {
        if (!klaviyoKey || typeof window === 'undefined') return;

        // Initialize Klaviyo array if it doesn't exist
        window._learnq = window._learnq || [];

        // Load Klaviyo Script
        const scriptId = 'klaviyo-js';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'text/javascript';
            script.async = true;
            script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${klaviyoKey}`;
            document.head.appendChild(script);
        }
    }, [klaviyoKey]);

    return null;
}
