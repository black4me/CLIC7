import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8A2BE2', // Neon Purple
                background: '#0B0B0F', // Deep Black Background
                surface: '#121216', // Slightly lighter than bg for cards
                success: '#00FF7F', // Spring Green
                accent: '#FFFFFF', // White text
            },
            fontFamily: {
                sans: ['var(--font-cairo)', 'sans-serif'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.5' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': "url('/grid.svg')",
            }
        },
    },
    plugins: [],
}
export default config
