export interface IGameFeedItem {
    id: string;
    title: string;
    gameId?: string;
    gameTitle: string;
    image: string;
    icon?: string;
    videoSrc: string;
    categories: string | string[];
    source?: string;
    price?: string;
    accountName?: string;
    accountLogo?: string;
    rawCategoryIds?: number[];
    rawTagIds?: number[];
    forceVideoLoadingPreview?: boolean;
}

export type IGameFeedState = 'ready' | 'loading' | 'error';

export interface IGameFeedProps {
    title?: string;
    logoSrc?: string;
    items?: IGameFeedItem[];
    initialIndex?: number;
    openInitially?: boolean;
    entryTitle?: string;
    entrySubtitle?: string;
    entryButtonText?: string;
    entryImage?: string;
    entryBadgeText?: string;
    feedState?: IGameFeedState;
    errorMessage?: string;
    playButtonText?: string;
    retryButtonText?: string;
    closeButtonText?: string;
    onOpen?: () => void;
    onPlay?: (item: IGameFeedItem) => void;
    onNeedMoreItems?: () => void;
    onRetry?: () => void;
    onClose?: () => void;
}

export type IMcApiFetch = <TResponse = unknown, TBody = unknown>(
    url: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    options?: {
        body?: TBody;
        params?: Record<string, string | number | boolean>;
        directlyToBackend?: boolean;
        isSdkUrl?: boolean;
        parseJSON?: boolean;
        csrfSupport?: boolean;
        additionalHeaders?: HeadersInit;
    }
) => Promise<TResponse>;

export interface IMcPackageConfig {
    dispatcher?: {
        dispatch(action: string, props?: unknown): void;
        subscribe(action: string, callback: (props: unknown) => void): void;
    };
    name: string;
    packageUrl: string;
    version: string;
    apiFetch?: IMcApiFetch;
    mainCatalogFeedEndpoint?: string;
    mainPageFeedEndpoint?: string;
    userData?: {
        uid?: string;
        login?: string;
        displayName?: string;
        avatar?: string;
        isChild?: boolean;
        isAuth: boolean;
    };
}
