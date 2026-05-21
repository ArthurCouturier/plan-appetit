export const STALE_TIME = 30 * 60 * 1000; // 30 minutes
export const GC_TIME = 30 * 60 * 1000; // 30 minutes

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
    referral: {
        stats: () => ['referral', 'stats'] as const,
    },
    culinaryProfile: {
        me: () => ['user', 'culinaryProfile'] as const,
    },
    ritualDaily: {
        byMealAndDate: (mealType: string, date: string) =>
            ['ritualDaily', mealType, date] as const,
    },
    ritualMealPlan: {
        week: (from: string, to: string) =>
            ['ritualMealPlan', from, to] as const,
    },
    shoppingLists: {
        all: () => ['shoppingLists'] as const,
        byId: (uuid: string) => ['shoppingLists', uuid] as const,
    },
    ingredientSearch: {
        byQuery: (q: string) => ['ingredientSearch', q] as const,
    },
} as const;
