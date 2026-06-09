import type { IGameFeedItem } from '../types';
import { getVisibleCategories } from '../utils/feed';
import { PauseIcon, PlayIcon } from '../ui/icons';
import { FeedVideo } from './video-layer';

function PlaybackIndicator({
    feedbackIcon,
    isPaused,
}: {
    feedbackIcon: 'play' | 'pause' | null;
    isPaused: boolean;
}) {
    return (
        <span
            class={`mc-game-feed__playback-indicator ${
                feedbackIcon || isPaused ? 'mc-game-feed__playback-indicator--visible' : ''
            }`}
            aria-hidden="true"
        >
            {feedbackIcon === 'play' && <PlayIcon />}
            {(feedbackIcon === 'pause' || (feedbackIcon === null && isPaused)) && <PauseIcon />}
        </span>
    );
}

export function FeedPage({
    item,
    isActive,
    isPaused,
    shouldPrimeFrame,
    feedbackIcon,
    progress,
    playButtonText,
    onPlay,
    onProgress,
    onTogglePlayback,
}: {
    item: IGameFeedItem;
    isActive: boolean;
    isPaused: boolean;
    shouldPrimeFrame: boolean;
    feedbackIcon: 'play' | 'pause' | null;
    progress: number;
    playButtonText: string;
    onPlay?: (item: IGameFeedItem) => void;
    onProgress: (progress: number) => void;
    onTogglePlayback: () => void;
}) {
    const visibleCategories = getVisibleCategories(item.categories);

    return (
        <div class="mc-game-feed__page">
            <FeedVideo
                item={item}
                isActive={isActive}
                isPaused={isPaused}
                shouldPrimeFrame={shouldPrimeFrame}
                onProgress={onProgress}
            />
            <div class="mc-game-feed__scrim" />
            <div class="mc-game-feed__bottom-fade" />
            {isActive && (
                <button
                    type="button"
                    class="mc-game-feed__playback-toggle"
                    aria-label={isPaused ? 'Продолжить видео' : 'Поставить видео на паузу'}
                    onClick={onTogglePlayback}
                >
                    <PlaybackIndicator feedbackIcon={feedbackIcon} isPaused={isPaused} />
                </button>
            )}
            <div class="mc-game-feed__meta">
                <span class="mc-game-feed__cover">
                    <img src={item.image} alt="" class="mc-game-feed__cover-image" />
                </span>
                <span class="mc-game-feed__text">
                    <span class="mc-game-feed__game-title">{item.gameTitle}</span>
                    <span class="mc-game-feed__categories">{visibleCategories}</span>
                </span>
                <button
                    type="button"
                    class="mc-game-feed__play-button"
                    onClick={() => onPlay?.(item)}
                >
                    {playButtonText}
                </button>
            </div>
            {isActive && (
                <div class="mc-game-feed__progress">
                    <div class="mc-game-feed__progress-fill" style={{ width: `${progress * 100}%` }} />
                </div>
            )}
        </div>
    );
}
