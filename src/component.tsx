import { useEffect, useMemo, useState } from 'preact/hooks';
import defaultLogoSrc from './assets/logo-yg.svg';
import { GameFeedEntry } from './components/feed-entry';
import { FeedPlayer } from './components/feed-player';
import { FeedError, FeedSkeleton } from './components/feed-states';
import { buildDefaultItems } from './data/default-feed';
import type { IGameFeedProps } from './types';
import { CloseIcon } from './ui/icons';

export type { IGameFeedItem, IGameFeedProps } from './types';

const DEFAULT_LOGO_SRC = defaultLogoSrc;

export function GameFeed({
    title = 'Лента игр',
    logoSrc = DEFAULT_LOGO_SRC,
    items,
    initialIndex = 0,
    openInitially = true,
    entryTitle = 'Видео лента игр',
    entrySubtitle = 'Короткие ролики, подборки и быстрый переход к игре',
    entryButtonText = 'Открыть ленту',
    entryImage,
    entryBadgeText = 'Shorts',
    feedState = 'ready',
    errorMessage = 'Проверьте соединение и попробуйте ещё раз.',
    playButtonText = 'Играть',
    retryButtonText = 'Обновить',
    closeButtonText = 'Закрыть',
    onOpen,
    onPlay,
    onNeedMoreItems,
    onRetry,
    onClose,
}: IGameFeedProps) {
    const [isOpen, setIsOpen] = useState(openInitially);
    const feedItems = useMemo(() => (items ? items : buildDefaultItems()), [items]);

    useEffect(() => {
        setIsOpen(openInitially);
    }, [openInitially]);

    const openFeed = () => {
        setIsOpen(true);
        onOpen?.();
    };

    const closeFeed = () => {
        setIsOpen(false);
        onClose?.();
    };

    if (!isOpen) {
        return (
            <div class="mc-game-feed mc-game-feed--entry">
                <GameFeedEntry
                    buttonText={entryButtonText}
                    image={entryImage ?? feedItems[0]?.image}
                    logoSrc={logoSrc}
                    badgeText={entryBadgeText}
                    subtitle={entrySubtitle}
                    title={entryTitle}
                    onOpen={openFeed}
                />
            </div>
        );
    }

    return (
        <div class="mc-game-feed">
            <section class="mc-game-feed__dialog" role="dialog" aria-modal="true" aria-label={title}>
                <div class="mc-game-feed__header">
                    <div class="mc-game-feed__brand">
                        <span class="mc-game-feed__logo">
                            <img src={logoSrc} alt="" class="mc-game-feed__logo-image" />
                        </span>
                        <span class="mc-game-feed__title">{title}</span>
                    </div>
                    <button
                        type="button"
                        aria-label="Закрыть ленту"
                        class="mc-game-feed__close-button"
                        onClick={closeFeed}
                    >
                        <CloseIcon />
                    </button>
                </div>
                {feedState === 'loading' && <FeedSkeleton />}
                {feedState === 'error' && (
                    <FeedError
                        message={errorMessage}
                        retryButtonText={retryButtonText}
                        closeButtonText={closeButtonText}
                        onRetry={onRetry}
                        onClose={closeFeed}
                    />
                )}
                {feedState === 'ready' && (
                    <FeedPlayer
                        items={feedItems}
                        initialIndex={initialIndex}
                        playButtonText={playButtonText}
                        onPlay={onPlay}
                        onNeedMoreItems={onNeedMoreItems}
                    />
                )}
            </section>
        </div>
    );
}
