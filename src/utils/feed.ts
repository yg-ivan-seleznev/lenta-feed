import type { IGameFeedItem } from '../types';

export function getSafeIndex(index: number, length: number): number {
    if (length === 0) {
        return 0;
    }

    return ((index % length) + length) % length;
}

export function getVisibleCategories(categories: string | string[]): string {
    const list = Array.isArray(categories)
        ? categories
        : categories
              .split('·')
              .map((category) => category.trim())
              .filter(Boolean);

    return list[0] ?? '';
}

export function getPreloadItems(items: IGameFeedItem[], currentIndex: number, count: number): IGameFeedItem[] {
    const preloadCount = Math.min(count, Math.max(0, items.length - 1));

    return Array.from({ length: preloadCount }, (_, index) => items[getSafeIndex(currentIndex + index + 1, items.length)]);
}
