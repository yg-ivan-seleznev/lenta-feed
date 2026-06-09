export function CloseIcon() {
    return (
        <svg
            class="mc-game-feed__close-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M6 6L18 18" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M18 6L6 18" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
}

export function PlayIcon() {
    return (
        <svg class="mc-game-feed__playback-icon" viewBox="0 0 24 24" fill="none">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.18416 19.7655C11.9756 18.6407 15.6497 16.2818 17.6796 14.4433C19.5318 12.8166 19.5318 11.189 17.6796 9.56139C15.6497 7.72384 11.9756 5.36491 9.18416 4.24012C6.91212 3.50295 5.60377 4.47152 5.19174 7.02964C5.01209 8.6309 4.92714 10.2927 4.93398 12.0023C4.92714 13.712 5.01209 15.3748 5.19174 16.976C5.5901 19.5429 6.91407 20.4861 9.18416 19.7655Z"
                fill="white"
            />
        </svg>
    );
}

export function PauseIcon() {
    return (
        <svg class="mc-game-feed__playback-icon" viewBox="0 0 24 24" fill="none">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.43263 3.5C5.96763 3.5 4.77563 4.692 4.77563 6.157V17.843C4.77563 19.308 5.96763 20.5 7.43263 20.5C8.89763 20.5 10.0896 19.308 10.0896 17.843V6.157C10.0896 4.692 8.89763 3.5 7.43263 3.5Z"
                fill="white"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.5674 3.5C15.1024 3.5 13.9104 4.692 13.9104 6.157V17.843C13.9104 19.308 15.1024 20.5 16.5674 20.5C18.0324 20.5 19.2244 19.308 19.2244 17.843V6.157C19.2244 4.692 18.0324 3.5 16.5674 3.5Z"
                fill="white"
            />
        </svg>
    );
}

export function VideoLoadingIcon() {
    return (
        <svg
            class="mc-game-feed__video-loading-icon"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle
                class="mc-game-feed__video-loading-track"
                cx="40"
                cy="40"
                r="28"
                pathLength="100"
            />
            <circle
                class="mc-game-feed__video-loading-arc"
                cx="40"
                cy="40"
                r="28"
                pathLength="100"
            />
        </svg>
    );
}
