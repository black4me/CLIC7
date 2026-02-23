import { games } from '@/data/games';
import GameContent from './GameContent';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const game = games.find(g => g.id === id || g.slug === id);

    if (!game) {
        return {
            title: 'Game Not Found | CLIC7',
            description: 'The requested game could not be found.'
        };
    }

    return {
        title: `${game.title} | CLIC7`,
        description: game.metaDescription || game.description?.slice(0, 160) || `Buy ${game.title} at CLIC7`,
        openGraph: {
            title: game.title,
            description: game.description?.slice(0, 160),
            images: [
                game.image?.startsWith('/') || game.image?.startsWith('http')
                    ? game.image
                    : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200'
            ],
        }
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    return <GameContent id={id} />;
}
