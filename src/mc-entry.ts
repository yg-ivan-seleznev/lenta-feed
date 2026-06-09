import { h, render } from 'preact';
import { GameFeed, type IGameFeedProps } from './component';
import { MainCatalogFeedView, type IMainCatalogFeedRequest } from './integration';
import styles from './styles.css?inline';
import type { IMcPackageConfig } from './types';

export type { IGameFeedItem, IGameFeedProps } from './component';
export type { IMainCatalogFeedRequest };

export class McPackage {
    private readonly config: IMcPackageConfig;

    constructor(config: IMcPackageConfig) {
        this.config = config;
    }

    public getStyles(): string {
        return styles;
    }

    public renderMcGameFeed(container: HTMLElement, props: IGameFeedProps): void {
        render(h(GameFeed, props), container);
    }

    public renderMcGameFeedFromMainCatalogSection(
        container: HTMLElement,
        request: IMainCatalogFeedRequest,
        props: Omit<IGameFeedProps, 'feedState' | 'items' | 'onNeedMoreItems'> = {},
    ): void {
        const endpoint = this.config.mainCatalogFeedEndpoint || this.config.mainPageFeedEndpoint;
        const { apiFetch } = this.config;

        if (!apiFetch || !endpoint) {
            render(h(GameFeed, { ...props, feedState: 'error' }), container);
            return;
        }

        render(h(MainCatalogFeedView, { apiFetch, endpoint, props, request }), container);
    }

    public renderMcGameFeedFromMainPageBlock(
        container: HTMLElement,
        request: IMainCatalogFeedRequest,
        props: Omit<IGameFeedProps, 'feedState' | 'items' | 'onNeedMoreItems'> = {},
    ): void {
        this.renderMcGameFeedFromMainCatalogSection(container, request, {
            openInitially: false,
            ...props,
        });
    }
}
