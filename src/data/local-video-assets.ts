const DEFAULT_PUBLIC_BASE = import.meta.env.BASE_URL || '/';
const LOCAL_VIDEO_ASSET_NAMES = [
    'shorts-stub-1.mp4',
    'shorts-stub-2.mp4',
    'shorts-stub-3.mp4',
    'shorts-stub-4.mp4',
    'e7b04019-4f6e-4d6b-b00e-9a27e728f8b6.mp4',
    '1b54ee16-ebd0-44cb-9964-8d82b5a21a6b.mp4',
    '869d512a-9705-4a67-8c44-dc160e1be788.mp4',
    '8e5ef2a6-34b7-4271-bd97-ee26c01ef1c4.mp4',
    '4d62bb3e-d7aa-41cf-92b8-b86f5584cf3a.mp4',
    '552f2fcd-1f29-479f-bdcd-1a738076693b.mp4',
    'b61c2293-7863-4d7c-b06c-3aaeddd82b37.mp4',
    '48b98cc2-2907-428c-8c40-d9a50cec7dd3.mp4',
    '50da270b-b5c4-4ab1-8763-cd4ec003d318.mp4',
    '83b18681-e25f-44ee-9110-64f2c52002a9.mp4',
    'fd11e5a4-b2ab-4323-ad25-d69480a50cc4.mp4',
    '06a79cfc-32b1-4d2e-880e-b6e145a8ccd0.mp4',
    'd81ba8cd-9564-4faa-a103-37e920ff1cb6.mp4',
    'f25b3a80-b4cb-4706-a0ed-6a734f5f19a4.mp4',
] as const;

export function getLocalVideoAssetUrl(index: number): string {
    const assetName = LOCAL_VIDEO_ASSET_NAMES[index % LOCAL_VIDEO_ASSET_NAMES.length];

    return `${DEFAULT_PUBLIC_BASE}_videos/${assetName}`;
}

export function getLocalVideoAssetUrls(count: number): string[] {
    return Array.from({ length: count }, (_, index) => getLocalVideoAssetUrl(index));
}

export function getLocalVideoAssetNames(): readonly string[] {
    return LOCAL_VIDEO_ASSET_NAMES;
}
