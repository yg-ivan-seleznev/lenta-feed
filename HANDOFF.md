# MC Game Feed Handoff

## What This Package Is

`mc-game-feed` is a Yandex Games Media Component for a vertical short-video game feed. It can render prepared `items`, or load a video section from the main catalog feed endpoint. The main-page variant renders a compact entry card first and opens the full feed lazily after user interaction.

## Structure

- `src/component.tsx` - public component shell: main-page entry card, open/close, header, `loading` / `error` / `ready`.
- `src/components/feed-player.tsx` - native CSS scroll-snap player: current/previous/next slots, playback, progress, preload, and next-page trigger.
- `src/components/video-layer.tsx` - active video playback and hidden preload videos.
- `src/data/local-video-assets.ts` - temporary local video source for preview/stub mode. Replace this source layer when backend video URLs become the primary source.
- `src/integration/main-catalog-feed.ts` - `/catalogue/v2/feed/` request params, video-section selection, mapper, dedupe.
- `src/integration/main-catalog-feed-view.tsx` - runtime loader that renders loading, ready, error, and loads the next page.

## Runtime Flow

Render prepared items:

```ts
mcPackage.renderMcGameFeed(container, {
    feedState: 'ready',
    items,
    onPlay: (item) => {},
});
```

Render from the main catalog feed directly:

```ts
const mcPackage = new McPackage({
    ...config,
    apiFetch,
    mainCatalogFeedEndpoint: '/catalogue/v2/feed/',
});

mcPackage.renderMcGameFeedFromMainCatalogSection(container, {
    query: { lang: 'ru' },
    section: { category: 'shorts' }, // optional until backend gives a stable marker
});
```

The legacy alias `renderMcGameFeedFromMainPageBlock` forwards to the same method.

Render as a main-page block:

```ts
mcPackage.renderMcGameFeedFromMainPageBlock(container, {
    query: { lang: 'ru' },
    section: { category: 'shorts' },
}, {
    entryTitle: 'Видео лента игр',
    entrySubtitle: 'Короткие ролики и быстрый переход к игре',
    entryButtonText: 'Открыть',
});
```

`renderMcGameFeedFromMainPageBlock` sets `openInitially: false` by default. The backend request is lazy: it starts only when the user clicks the entry card and opens the feed.

## Data Integration

Arcadia reference:

- Main catalog endpoint: `GET /catalogue/v2/feed/`.
- Response shape: `feed: IFeedItem[]`, `pageInfo.nextPageId`.
- Game video: `game.media.videos[0].previewUrl`.
- Game title: `game.title`.
- Icon/cover: `game.media.icon['prefix-url']`, `game.media.cover['prefix-url']`.

Current selector picks the first feed section that has games with `media.videos[0].previewUrl`. If backend provides a stable marker, pass `section.type`, `section.category`, or `section.title` in the request and tighten `pickVideoFeedSection`.

Temporary local preview videos are resolved through `src/data/local-video-assets.ts`. When the backend is ready, keep the UI unchanged and replace only the backend mapping that fills `IGameFeedItem`: `videoSrc`, `icon`, `image`, `gameTitle`, `categories`, and play target metadata.

## Current Behavior

- Closed state renders an entry card suitable for a main-page block.
- Main-page backend loading is lazy and starts on open.
- The active video plays automatically; neighboring videos stay paused on the first frame.
- Previous/current/next pages are mounted for smooth native scroll-snap transitions.
- `VideoPreloader` preloads 4 next videos.
- When the active index is within 4 items of the end, `onNeedMoreItems` asks the runtime view to load `pageInfo.nextPageId`.
- Items are deduped by `id`; games without preview video are ignored.
- Human-readable categories are not resolved yet; raw `categoryIDs` and `tagIDs` are preserved on `IGameFeedItem`.
