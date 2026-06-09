import type { IGameFeedItem } from '../types';
import { getLocalVideoAssetUrl } from './local-video-assets';

const DEFAULT_ARTICLES = [
    {
        title: 'Cyberpunk 2077: Phantom Liberty получил масштабное обновление 2.2',
        gameTitle: 'Cyberpunk 2077',
        image: 'https://images.unsplash.com/photo-1674159057061-394f68e750a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        categories: 'RPG · Обновления · Киберпанк',
    },
    {
        title: 'Elden Ring: Nightreign - все что известно о новом DLC',
        gameTitle: 'Elden Ring',
        image: 'https://images.unsplash.com/photo-1692897403215-9718cae64dd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        categories: 'Action RPG · Релизы · Фэнтези',
    },
    {
        title: 'VR-шлем нового поколения от Sony выходит в продажу',
        gameTitle: 'PlayStation VR',
        image: 'https://images.unsplash.com/photo-1758523670318-f1b79559e1d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        categories: 'VR · Технологии · Релизы',
    },
    {
        title: 'Forza Motorsport получила обновление с 20 новыми машинами',
        gameTitle: 'Forza Motorsport',
        image: 'https://images.unsplash.com/photo-1752348511160-ebe429a2dffb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        categories: 'Racing · Обновления · PC',
    },
    {
        title: 'Инди-хит Hollow Knight: Silksong наконец получил дату выхода',
        gameTitle: 'Hollow Knight',
        image: 'https://images.unsplash.com/photo-1759171052927-83f3b3a72b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        categories: 'Инди · Платформер · Релизы',
    },
    {
        title: 'Subnautica 3 анонсирована с кооперативным режимом',
        gameTitle: 'Subnautica',
        image: 'https://images.unsplash.com/photo-1680201540929-4fd82ca3add0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        categories: 'Выживание · Кооператив · Океан',
    },
];

export function buildDefaultItems(): IGameFeedItem[] {
    return Array.from({ length: 52 }, (_, index) => {
        const article = DEFAULT_ARTICLES[index % DEFAULT_ARTICLES.length];

        return {
            id: `game-feed-${index + 1}`,
            title: article.title,
            gameTitle: article.gameTitle,
            image: article.image,
            videoSrc: getLocalVideoAssetUrl(index),
            categories: article.categories,
            source: 'Яндекс Игры',
            price: `${[299, 499, 799, 1199][index % 4]} ₽`,
            accountName: 'Yandex Games',
            accountLogo: article.image,
        };
    });
}
