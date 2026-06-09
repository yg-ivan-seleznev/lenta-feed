export function GameFeedEntry({
    badgeText,
    buttonText,
    image,
    logoSrc,
    subtitle,
    title,
    onOpen,
}: {
    badgeText: string;
    buttonText: string;
    image?: string;
    logoSrc: string;
    subtitle: string;
    title: string;
    onOpen: () => void;
}) {
    return (
        <button type="button" class="mc-game-feed-entry" onClick={onOpen}>
            <span class="mc-game-feed-entry__media">
                {image && <img src={image} alt="" class="mc-game-feed-entry__image" />}
                <span class="mc-game-feed-entry__shade" />
                <span class="mc-game-feed-entry__badge">{badgeText}</span>
                <span class="mc-game-feed-entry__logo">
                    <img src={logoSrc} alt="" class="mc-game-feed__logo-image" />
                </span>
            </span>
            <span class="mc-game-feed-entry__body">
                <span class="mc-game-feed-entry__text">
                    <span class="mc-game-feed-entry__title">{title}</span>
                    <span class="mc-game-feed-entry__subtitle">{subtitle}</span>
                </span>
                <span class="mc-game-feed-entry__button">{buttonText}</span>
            </span>
        </button>
    );
}
