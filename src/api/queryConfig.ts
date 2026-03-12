export const STALE_TIME = 30 * 60 * 1000; // 30 minutes

export const queryKeys = {
    user: {
        connect: () => ['user', 'connect'] as const,
    },
    collections: {
        all: () => ['collections'] as const,
        default: () => ['collections', 'default'] as const,
        byId: (uuid: string) => ['collections', uuid] as const,
    },
    recipes: {
        image: (uuid: string) => ['recipes', uuid, 'image'] as const,
    },
} as const;
