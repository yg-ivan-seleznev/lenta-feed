export function FeedSkeleton() {
    return (
        <section class="mc-game-feed__player mc-game-feed__player--skeleton" aria-label="Загрузка ленты">
            <div class="mc-game-feed__skeleton-video" />
            <div class="mc-game-feed__meta mc-game-feed__meta--skeleton" aria-hidden="true">
                <span class="mc-game-feed__skeleton-cover mc-game-feed__skeleton-item" />
                <span class="mc-game-feed__skeleton-text">
                    <span class="mc-game-feed__skeleton-line mc-game-feed__skeleton-line--title mc-game-feed__skeleton-item" />
                    <span class="mc-game-feed__skeleton-line mc-game-feed__skeleton-line--caption mc-game-feed__skeleton-item" />
                </span>
                <span class="mc-game-feed__skeleton-button mc-game-feed__skeleton-item" />
            </div>
        </section>
    );
}

export function FeedError({
    message,
    retryButtonText,
    closeButtonText,
    onRetry,
    onClose,
}: {
    message: string;
    retryButtonText: string;
    closeButtonText: string;
    onRetry?: () => void;
    onClose: () => void;
}) {
    return (
        <section class="mc-game-feed__player mc-game-feed__player--error" aria-label="Ошибка загрузки ленты">
            <div class="mc-game-feed__error-panel">
                <span class="mc-game-feed__error-title">Не удалось загрузить ленту</span>
                <span class="mc-game-feed__error-message">{message}</span>
                <span class="mc-game-feed__error-actions">
                    <button type="button" class="mc-game-feed__retry-button" onClick={onRetry}>
                        {retryButtonText}
                    </button>
                    <button type="button" class="mc-game-feed__dismiss-button" onClick={onClose}>
                        {closeButtonText}
                    </button>
                </span>
            </div>
        </section>
    );
}
