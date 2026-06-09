import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { IGameFeedItem } from '../types';
import { getPreloadItems, getSafeIndex } from '../utils/feed';
import { FeedPage } from './feed-page';
import { VideoPreloader, VideoWarmup } from './video-layer';

const SCROLL_SETTLE_MS = 120;
const PRELOAD_AHEAD = 12;
const NEED_MORE_THRESHOLD = 4;
const PAGE_STACK_GAP_PX = 12;
const SNAP_ACTIVATION_RATIO = 0.5;
const supportsScrollEnd = typeof window !== 'undefined' && 'onscrollend' in window;

export function FeedPlayer({
    items,
    initialIndex,
    playButtonText,
    onPlay,
    onNeedMoreItems,
}: {
    items: IGameFeedItem[];
    initialIndex: number;
    playButtonText: string;
    onPlay?: (item: IGameFeedItem) => void;
    onNeedMoreItems?: () => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(() => getSafeIndex(initialIndex, items.length));
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [feedbackIcon, setFeedbackIcon] = useState<'play' | 'pause' | null>(null);
    const [playbackOffset, setPlaybackOffset] = useState<-1 | 0 | 1>(0);
    const playerRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const scrollSettleTimeout = useRef<number | null>(null);
    const recenterFrame = useRef<number | null>(null);
    const isRecentering = useRef(false);
    const playbackOffsetRef = useRef<-1 | 0 | 1>(0);
    const current = items[getSafeIndex(currentIndex, items.length)];

    useEffect(() => {
        setCurrentIndex(getSafeIndex(initialIndex, items.length));
        setProgress(0);
        setIsPaused(false);
        setFeedbackIcon(null);
        setPlaybackOffsetValue(0);
    }, [initialIndex, items.length]);

    useEffect(() => {
        if (isPaused || feedbackIcon === null) {
            return;
        }

        const timeoutId = window.setTimeout(() => setFeedbackIcon(null), 700);

        return () => window.clearTimeout(timeoutId);
    }, [feedbackIcon, isPaused]);

    useEffect(() => {
        return () => {
            if (scrollSettleTimeout.current !== null) {
                window.clearTimeout(scrollSettleTimeout.current);
            }

            if (recenterFrame.current !== null) {
                window.cancelAnimationFrame(recenterFrame.current);
            }
        };
    }, []);

    useLayoutEffect(() => {
        recenterToCurrentPage();
    }, [currentIndex, items.length]);

    useEffect(() => {
        const track = trackRef.current;

        if (!track || !supportsScrollEnd) {
            return;
        }

        const handleScrollEnd = () => commitSettledScroll();

        track.addEventListener('scrollend', handleScrollEnd);

        return () => track.removeEventListener('scrollend', handleScrollEnd);
    });

    useEffect(() => {
        if (!onNeedMoreItems || items.length === 0) {
            return;
        }

        if (items.length - currentIndex - 1 <= NEED_MORE_THRESHOLD) {
            onNeedMoreItems();
        }
    }, [currentIndex, items.length, onNeedMoreItems]);

    const resetPlaybackForNextPage = () => {
        setProgress(0);
        setIsPaused(false);
        setFeedbackIcon(null);
    };

    const setPlaybackOffsetValue = (nextOffset: -1 | 0 | 1) => {
        if (playbackOffsetRef.current === nextOffset) {
            return;
        }

        playbackOffsetRef.current = nextOffset;
        setPlaybackOffset(nextOffset);

        if (nextOffset !== 0) {
            resetPlaybackForNextPage();
        }
    };

    const getMiddleScrollTop = () => {
        const track = trackRef.current;
        const middleSlot = track?.children[1] as HTMLElement | undefined;

        return middleSlot ? middleSlot.offsetTop : 0;
    };

    const releaseRecentering = () => {
        if (recenterFrame.current !== null) {
            window.cancelAnimationFrame(recenterFrame.current);
        }

        recenterFrame.current = window.requestAnimationFrame(() => {
            recenterFrame.current = window.requestAnimationFrame(() => {
                recenterFrame.current = null;
                isRecentering.current = false;
            });
        });
    };

    const recenterToCurrentPage = () => {
        const track = trackRef.current;
        const middleScrollTop = getMiddleScrollTop();

        if (!track || middleScrollTop <= 0) {
            return;
        }

        isRecentering.current = true;
        setPlaybackOffsetValue(0);
        track.scrollTop = middleScrollTop;
        releaseRecentering();
    };

    const updatePlaybackOffsetFromScroll = () => {
        const track = trackRef.current;
        const slots = track ? Array.from(track.children).slice(0, 3) as HTMLElement[] : [];

        if (!track || slots.length < 3) {
            return;
        }

        const previousSnap = slots[0].offsetTop;
        const currentSnap = slots[1].offsetTop;
        const nextSnap = slots[2].offsetTop;
        const previousThreshold = currentSnap - (currentSnap - previousSnap) * SNAP_ACTIVATION_RATIO;
        const nextThreshold = currentSnap + (nextSnap - currentSnap) * SNAP_ACTIVATION_RATIO;

        if (track.scrollTop <= previousThreshold) {
            setPlaybackOffsetValue(-1);
            return;
        }

        if (track.scrollTop >= nextThreshold) {
            setPlaybackOffsetValue(1);
            return;
        }

        setPlaybackOffsetValue(0);
    };

    const commitSettledScroll = () => {
        if (isRecentering.current) {
            return;
        }

        const track = trackRef.current;
        const slots = track ? Array.from(track.children).slice(0, 3) as HTMLElement[] : [];
        const snapPositions = slots.map((slot) => slot.offsetTop);

        if (!track || snapPositions.length < 3) {
            return;
        }

        const nearestSlot = snapPositions.reduce((nearestIndex, snapPosition, index) => {
            const nearestDistance = Math.abs(track.scrollTop - snapPositions[nearestIndex]);
            const distance = Math.abs(track.scrollTop - snapPosition);

            return distance < nearestDistance ? index : nearestIndex;
        }, 1);
        const direction = nearestSlot - 1;

        if (direction === 0) {
            setPlaybackOffsetValue(0);
            return;
        }

        if (items.length < 2) {
            return;
        }

        resetPlaybackForNextPage();
        setPlaybackOffsetValue(0);
        setCurrentIndex((index) => getSafeIndex(index + direction, items.length));
    };

    const scheduleSettledScrollCommit = () => {
        if (scrollSettleTimeout.current !== null) {
            window.clearTimeout(scrollSettleTimeout.current);
        }

        if (supportsScrollEnd) {
            return;
        }

        scrollSettleTimeout.current = window.setTimeout(() => {
            scrollSettleTimeout.current = null;
            commitSettledScroll();
        }, SCROLL_SETTLE_MS);
    };

    if (!current) {
        return (
            <div class="mc-game-feed__empty">
                <span class="mc-game-feed__empty-title">Лента пока пуста</span>
            </div>
        );
    }

    const preloadItems = getPreloadItems(items, currentIndex, PRELOAD_AHEAD);

    const togglePlayback = () => {
        setIsPaused((paused) => {
            const nextPaused = !paused;

            setFeedbackIcon(nextPaused ? 'pause' : 'play');

            return nextPaused;
        });
    };

    return (
        <section
            ref={playerRef}
            class="mc-game-feed__player"
            aria-label="Видео ленты"
        >
            <VideoWarmup items={items} />
            <VideoPreloader items={preloadItems} />
            <div
                ref={trackRef}
                class="mc-game-feed__page-track"
                onScroll={() => {
                    if (isRecentering.current) {
                        return;
                    }

                    updatePlaybackOffsetFromScroll();
                    scheduleSettledScrollCommit();
                }}
            >
                {([-1, 0, 1] as const).map((offset) => {
                    const item = items[getSafeIndex(currentIndex + offset, items.length)];
                    const isActive = offset === playbackOffset;

                    return (
                        <div
                            key={item.id}
                            class="mc-game-feed__page-slot"
                        >
                            <FeedPage
                                item={item}
                                isActive={isActive}
                                isPaused={isPaused}
                                shouldPrimeFrame={!isActive}
                                feedbackIcon={feedbackIcon}
                                progress={isActive ? progress : 0}
                                playButtonText={playButtonText}
                                onPlay={onPlay}
                                onProgress={setProgress}
                                onTogglePlayback={togglePlayback}
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
