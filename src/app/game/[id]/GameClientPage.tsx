'use client';

import GameDetails from '@/components/GameDetails';

type Props = {
    id: string;
}

export default function GameClientPage({ id }: Props) {
    return <GameDetails id={id} />;
}
