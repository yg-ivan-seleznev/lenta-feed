import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { GameFeed, type IGameFeedProps } from '../component';
import type { IGameFeedItem, IMcApiFetch } from '../types';
import {
    dedupeFeedItems,
    loadMainCatalogFeedPage,
    type IMainCatalogFeedRequest,
    type IMainCatalogPageInfo,
} from './main-catalog-feed';

type TFeedStatus = NonNullable<IGameFeedProps['feedState']>;

export function MainCatalogFeedView({
    apiFetch,
    endpoint,
    props,
    request,
}: {
    apiFetch: IMcApiFetch;
    endpoint: string;
    props?: Omit<IGameFeedProps, 'feedState' | 'items' | 'onNeedMoreItems'>;
    request: IMainCatalogFeedRequest;
}) {
    const [feedState, setFeedState] = useState<TFeedStatus>('loading');
    const [items, setItems] = useState<IGameFeedItem[]>([]);
    const [pageInfo, setPageInfo] = useState<IMainCatalogPageInfo | undefined>();
    const hasLoadedInitialPage = useRef(false);
    const isLoadingNextPage = useRef(false);
    const requestRef = useRef(request);

    const loadInitialPage = useCallback(() => {
        if (hasLoadedInitialPage.current) {
            return;
        }

        hasLoadedInitialPage.current = true;
        setFeedState('loading');
        setItems([]);
        setPageInfo(undefined);

        let isCancelled = false;

        void loadMainCatalogFeedPage({ apiFetch, endpoint, request })
            .then((page) => {
                if (isCancelled) {
                    return;
                }

                setItems(dedupeFeedItems(page.items));
                setPageInfo(page.pageInfo);
                setFeedState('ready');
            })
            .catch(() => {
                if (!isCancelled) {
                    setFeedState('error');
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [apiFetch, endpoint, request]);

    useEffect(() => {
        requestRef.current = request;
        hasLoadedInitialPage.current = false;
        setItems([]);
        setPageInfo(undefined);

        if (props?.openInitially ?? true) {
            return loadInitialPage();
        }
    }, [loadInitialPage, props?.openInitially, request]);

    const loadNextPage = useCallback(() => {
        const nextPageId = pageInfo?.nextPageId;

        if (!nextPageId || pageInfo?.hasNextPage === false || isLoadingNextPage.current) {
            return;
        }

        isLoadingNextPage.current = true;

        void loadMainCatalogFeedPage({
            apiFetch,
            endpoint,
            request: {
                ...requestRef.current,
                pageId: nextPageId,
            },
        })
            .then((page) => {
                setItems((currentItems) => dedupeFeedItems([...currentItems, ...page.items]));
                setPageInfo(page.pageInfo);
            })
            .finally(() => {
                isLoadingNextPage.current = false;
            });
    }, [apiFetch, endpoint, pageInfo?.hasNextPage, pageInfo?.nextPageId]);

    const gameFeedProps = useMemo<IGameFeedProps>(() => ({
        ...(props ?? {}),
        feedState,
        items,
        onOpen: loadInitialPage,
        onNeedMoreItems: loadNextPage,
    }), [feedState, items, loadInitialPage, loadNextPage, props]);

    return h(GameFeed, gameFeedProps);
}
