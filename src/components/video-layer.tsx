import { useEffect, useRef, useState } from 'preact/hooks';
import type { IGameFeedItem } from '../types';
import { VideoLoadingIcon } from '../ui/icons';

const warmedVideoSources = new Set<string>();
const VIDEO_WARMUP_TIMEOUT_MS = 4500;
const VIDEO_WARMUP_CONCURRENCY = 3;

function waitForWarmVideo(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve) => {
        let timeoutId = 0;

        const cleanup = () => {
            window.clearTimeout(timeoutId);
            video.removeEventListener('canplaythrough', cleanup);
            video.removeEventListener('loadeddata', cleanup);
            video.removeEventListener('error', cleanup);
            resolve();
        };

        timeoutId = window.setTimeout(cleanup, VIDEO_WARMUP_TIMEOUT_MS);
        video.addEventListener('canplaythrough', cleanup, { once: true });
        video.addEventListener('loadeddata', cleanup, { once: true });
        video.addEventListener('error', cleanup, { once: true });
        video.load();
    });
}

async function warmVideoSource(src: string) {
    if (warmedVideoSources.has(src)) {
        return;
    }

    warmedVideoSources.add(src);

    const preloadLink = document.createElement('link');

    preloadLink.rel = 'preload';
    preloadLink.as = 'video';
    preloadLink.href = src;
    preloadLink.type = 'video/mp4';
    document.head.appendChild(preloadLink);

    const video = document.createElement('video');

    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.style.position = 'fixed';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    video.style.transform = 'translate(-9999px, -9999px)';
    document.body.appendChild(video);

    try {
        await Promise.allSettled([
            waitForWarmVideo(video),
            fetch(src, { cache: 'force-cache' }).then(() => undefined),
        ]);
    } catch {
        // Warmup is a best-effort optimization; playback should still work without it.
    } finally {
        video.remove();
    }
}

function getUniqueVideoSources(items: IGameFeedItem[]): string[] {
    return Array.from(new Set(items.map((item) => item.videoSrc)));
}

export function FeedVideo({
    item,
    isActive,
    isPaused,
    shouldPrimeFrame,
    onProgress,
}: {
    item: IGameFeedItem;
    isActive: boolean;
    isPaused: boolean;
    shouldPrimeFrame: boolean;
    onProgress: (progress: number) => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    useEffect(() => {
        const video = videoRef.current;

        if (!isActive || !video) {
            setIsVideoLoading(false);
            return;
        }

        setIsVideoLoading(video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA);
    }, [isActive, item.videoSrc]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.muted = true;

        if (!isActive || isPaused) {
            video.pause();

            if (!isActive && shouldPrimeFrame) {
                const primeFirstFrame = () => {
                    try {
                        video.currentTime = 0;
                    } catch {
                        // Some browsers can reject seeking before metadata is ready.
                    }
                };

                if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                    primeFirstFrame();
                } else {
                    video.load();
                    video.addEventListener('loadeddata', primeFirstFrame, { once: true });

                    return () => video.removeEventListener('loadeddata', primeFirstFrame);
                }
            }

            return;
        }

        const playPromise = video.play();

        if (playPromise) {
            playPromise.catch(() => undefined);
        }
    }, [isActive, isPaused, item.videoSrc, shouldPrimeFrame]);

    useEffect(() => {
        if (!isActive) {
            return;
        }

        let frameId = 0;

        const updateProgress = () => {
            const video = videoRef.current;

            if (video && Number.isFinite(video.duration) && video.duration > 0) {
                onProgress(Math.min(1, Math.max(0, video.currentTime / video.duration)));
            }

            frameId = window.requestAnimationFrame(updateProgress);
        };

        updateProgress();

        return () => window.cancelAnimationFrame(frameId);
    }, [isActive, item.videoSrc, onProgress]);

    return (
        <>
            <video
                ref={videoRef}
                class="mc-game-feed__video"
                autoPlay={isActive && !isPaused}
                loop
                muted
                playsInline
                preload="auto"
                aria-label={item.title}
                onLoadStart={(event) => {
                    if (isActive && event.currentTarget.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
                        setIsVideoLoading(true);
                    }
                }}
                onWaiting={() => setIsVideoLoading(isActive)}
                onStalled={() => setIsVideoLoading(isActive)}
                onLoadedData={() => setIsVideoLoading(false)}
                onPlaying={() => setIsVideoLoading(false)}
                onCanPlay={(event) => {
                    setIsVideoLoading(false);

                    if (!isActive || isPaused) {
                        return;
                    }

                    const playPromise = event.currentTarget.play();

                    if (playPromise) {
                        playPromise.catch(() => undefined);
                    }
                }}
            >
                <source src={item.videoSrc} type="video/mp4" />
            </video>
            {isActive && (isVideoLoading || item.forceVideoLoadingPreview) && (
                <div class="mc-game-feed__video-loading" aria-label="Видео загружается" role="status">
                    <VideoLoadingIcon />
                </div>
            )}
        </>
    );
}

export function VideoPreloader({ items }: { items: IGameFeedItem[] }) {
    return (
        <div class="mc-game-feed__preload" aria-hidden="true">
            {items.map((item) => (
                <video
                    key={item.id}
                    src={item.videoSrc}
                    poster={item.image}
                    muted
                    playsInline
                    preload="auto"
                />
            ))}
        </div>
    );
}

export function VideoWarmup({ items }: { items: IGameFeedItem[] }) {
    useEffect(() => {
        let isCancelled = false;
        const sources = getUniqueVideoSources(items);
        let nextIndex = 0;

        const runWorker = async () => {
            while (!isCancelled && nextIndex < sources.length) {
                const src = sources[nextIndex];

                nextIndex += 1;
                await warmVideoSource(src);
            }
        };

        const startWarmup = () => {
            for (let index = 0; index < VIDEO_WARMUP_CONCURRENCY; index += 1) {
                runWorker();
            }
        };

        if ('requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(startWarmup, { timeout: 900 });

            return () => {
                isCancelled = true;
                window.cancelIdleCallback(idleId);
            };
        }

        const timeoutId = window.setTimeout(startWarmup, 300);

        return () => {
            isCancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [items]);

    return null;
}
