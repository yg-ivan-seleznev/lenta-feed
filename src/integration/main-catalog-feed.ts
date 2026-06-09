import type { IGameFeedItem, IMcApiFetch } from '../types';

const DEFAULT_ICON_SIZE = 'size48';
const DEFAULT_COVER_SIZE = 'pjpg480x270';

export type TMainCatalogFeedQuery = Record<string, string | number | boolean | undefined>;

export interface IMainCatalogFeedRequest {
    pageId?: string;
    query?: TMainCatalogFeedQuery;
    section?: {
        category?: string;
        title?: string;
        type?: string;
    };
}

export interface IMainCatalogFeedPage {
    items: IGameFeedItem[];
    pageInfo?: IMainCatalogPageInfo;
}

export interface IMainCatalogFeedResponse {
    feed?: IMainCatalogFeedSection[];
    pageInfo?: IMainCatalogPageInfo;
}

export interface IMainCatalogPageInfo {
    hasNextPage?: boolean;
    isFirstPage?: boolean;
    nextPageId?: string;
    rtxReqId?: string;
}

export interface IMainCatalogFeedSection {
    category?: string;
    items?: IMainCatalogFeedGame[];
    title?: string;
    type?: string;
}

export interface IMainCatalogFeedGame {
    appID: number;
    categoryIDs?: number[];
    media?: IMainCatalogGameMedia;
    tagIDs?: number[];
    title: string;
}

export interface IMainCatalogGameMedia {
    cover?: IMainCatalogImage;
    icon?: IMainCatalogImage;
    videos?: IMainCatalogVideo[];
}

export interface IMainCatalogImage {
    'prefix-url'?: string;
}

export interface IMainCatalogVideo {
    previewUrl?: string;
}

export async function loadMainCatalogFeedPage({
    apiFetch,
    endpoint,
    request = {},
}: {
    apiFetch: IMcApiFetch;
    endpoint: string;
    request?: IMainCatalogFeedRequest;
}): Promise<IMainCatalogFeedPage> {
    const response = await apiFetch<IMainCatalogFeedResponse>(endpoint, 'get', {
        params: getMainCatalogFeedParams(request),
    });

    return mapMainCatalogFeedPage(response, request.section);
}

export function getMainCatalogFeedParams(request: IMainCatalogFeedRequest): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {
        with_promos: true,
        ...(request.query ?? {}),
    };

    if (request.pageId) {
        params.page_id = request.pageId;
    }

    return Object.fromEntries(
        Object.entries(params).filter((entry): entry is [string, string | number | boolean] => (
            typeof entry[1] !== 'undefined'
        )),
    );
}

export function mapMainCatalogFeedPage(
    response: IMainCatalogFeedResponse,
    sectionMatcher?: IMainCatalogFeedRequest['section'],
): IMainCatalogFeedPage {
    const section = pickVideoFeedSection(response.feed ?? [], sectionMatcher);

    return {
        items: mapMainCatalogFeedItems(section?.items ?? []),
        pageInfo: response.pageInfo,
    };
}

export function pickVideoFeedSection(
    feed: IMainCatalogFeedSection[],
    matcher?: IMainCatalogFeedRequest['section'],
): IMainCatalogFeedSection | undefined {
    return feed.find((section) => {
        if (!hasMatchingSectionMeta(section, matcher)) {
            return false;
        }

        return (section.items ?? []).some(hasPreviewVideo);
    });
}

export function mapMainCatalogFeedItems(games: IMainCatalogFeedGame[]): IGameFeedItem[] {
    return games.map(mapCatalogGameToFeedItem).filter((item): item is IGameFeedItem => item !== null);
}

export function mapCatalogGameToFeedItem(game: IMainCatalogFeedGame): IGameFeedItem | null {
    const videoSrc = game.media?.videos?.[0]?.previewUrl;
    const icon = getImageUrl(game.media?.icon, DEFAULT_ICON_SIZE);
    const image = getImageUrl(game.media?.cover, DEFAULT_COVER_SIZE) || icon;

    if (!videoSrc || !image || !game.title) {
        return null;
    }

    return {
        id: String(game.appID),
        title: game.title,
        gameId: String(game.appID),
        gameTitle: game.title,
        image,
        icon,
        videoSrc,
        categories: [],
        rawCategoryIds: game.categoryIDs,
        rawTagIds: game.tagIDs,
    };
}

export function dedupeFeedItems(items: IGameFeedItem[]): IGameFeedItem[] {
    const seen = new Set<string>();

    return items.filter((item) => {
        if (seen.has(item.id)) {
            return false;
        }

        seen.add(item.id);

        return true;
    });
}

function hasPreviewVideo(game: IMainCatalogFeedGame): boolean {
    return Boolean(game.media?.videos?.[0]?.previewUrl);
}

function hasMatchingSectionMeta(
    section: IMainCatalogFeedSection,
    matcher?: IMainCatalogFeedRequest['section'],
): boolean {
    if (!matcher) {
        return true;
    }

    return (
        (!matcher.type || section.type === matcher.type) &&
        (!matcher.category || section.category === matcher.category) &&
        (!matcher.title || section.title === matcher.title)
    );
}

function getImageUrl(image?: IMainCatalogImage, size?: string): string | undefined {
    const prefixUrl = image?.['prefix-url'];

    if (!prefixUrl) {
        return undefined;
    }

    return prefixUrl.endsWith('/') ? `${prefixUrl}${size}` : `${prefixUrl}/${size}`;
}
