'use client';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';

export default function WhatsAppButton() {
    const { settings } = useStore();
    const whatsappNumber = settings.contact.whatsapp.replace(/\D/g, ''); // Ensure only numbers

    return (
        <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-40 group"
        >
            <span className="absolute left-full ml-3 bottom-0 mb-3 w-max bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                تواصل معنا عبر واتساب
            </span>
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-shadow"
            >
                {/* Using Phone icon as placeholder for WA logo */}
                <Phone className="fill-current w-7 h-7" />
            </motion.div>
        </a>
    );
}
