import { getLocalVideoAssetUrl } from '../src/data/local-video-assets';

type IMcApiFetch = <TResponse = unknown, TBody = unknown>(
    url: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    options?: {
        body?: TBody;
        params?: Record<string, string | number | boolean>;
        directlyToBackend?: boolean;
        isSdkUrl?: boolean;
        parseJSON?: boolean;
        csrfSupport?: boolean;
        additionalHeaders?: HeadersInit;
    }
) => Promise<TResponse>;

interface IMcUserData {
    uid?: string;
    login?: string;
    displayName?: string;
    avatar?: string;
    isChild?: boolean;
    isAuth: boolean;
}

export const mockUserData: IMcUserData = {
    uid: 'mock-uid-12345',
    login: 'testuser',
    displayName: 'Тестовый Пользователь',
    avatar: 'https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-200',
    isChild: false,
    isAuth: true,
};

export const mockApiFetch: IMcApiFetch = async (url, method, options) => {
    console.log('[MockAPI]', method.toUpperCase(), url, options);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (url.includes('/catalogue/v2/feed')) {
        const pageId = options?.params?.page_id;
        const startIndex = pageId ? 9 : 1;

        return {
            feed: [
                {
                    category: 'common',
                    title: 'Обычная секция без видео',
                    type: 'suggested',
                    items: [
                        {
                            appID: 1000 + startIndex,
                            title: 'Game without preview video',
                            categoryIDs: [1],
                            media: {
                                icon: {
                                    'prefix-url': 'https://avatars.mds.yandex.net/get-games/3000000/mock-icon/',
                                },
                            },
                            tagIDs: [],
                        },
                    ],
                },
                {
                    category: 'shorts',
                    title: 'Видео игры',
                    type: 'suggested',
                    items: Array.from({ length: 8 }, (_, index) => {
                        const appID = startIndex + index;

                        return {
                            appID,
                            title: `Preview Game ${appID}`,
                            categoryIDs: [10 + (index % 3)],
                            media: {
                                cover: {
                                    'prefix-url': 'https://avatars.mds.yandex.net/get-games/3000000/mock-cover/',
                                },
                                icon: {
                                    'prefix-url': 'https://avatars.mds.yandex.net/get-games/3000000/mock-icon/',
                                },
                                videos: [
                                    {
                                        previewUrl: getLocalVideoAssetUrl(index + startIndex - 1),
                                    },
                                ],
                            },
                            tagIDs: [100 + index],
                        };
                    }),
                },
            ],
            pageInfo: {
                hasNextPage: !pageId,
                nextPageId: pageId ? undefined : 'mock-next-page',
            },
        } as never;
    }

    if (url.includes('balance')) {
        return { yans: 100, plus: 50 } as never;
    }

    if (url.includes('user')) {
        return mockUserData as never;
    }

    return { success: true, data: null } as never;
};
