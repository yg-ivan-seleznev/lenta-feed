import { McWrapper } from './mc-wrapper';
import type { IGameFeedProps } from '../src/mc-entry';
import { buildDefaultItems } from '../src/data/default-feed';

export function App() {
    const previewItems = buildDefaultItems();

    return (
        <McWrapper<IGameFeedProps>
            componentName="GameFeed"
            props={{
                title: 'Лента игр',
                openInitially: true,
                feedState: 'ready',
                playButtonText: 'Играть',
                items: previewItems,
            }}
        />
    );
}
