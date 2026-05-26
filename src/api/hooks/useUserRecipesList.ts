import { useInfiniteQuery } from "@tanstack/react-query";
import RecipeV2Service from "../services/RecipeV2Service";
import { RecipeV2SummaryDTO } from "../interfaces/v2/RecipeV2";
import useAuth from "./useAuth";

const RECIPES_PAGE_SIZE = 20;

/**
 * Liste paginée des recettes visibles par l'utilisateur, triées par mise à jour
 * la plus récente (ORDER BY backend). Infinite scroll : fetchNextPage() charge
 * le prochain bloc de RECIPES_PAGE_SIZE.
 */
export function useUserRecipesList() {
    const { user } = useAuth();
    const query = useInfiniteQuery({
        queryKey: ["recipes", "v2", "list", "mine", "paginated", "v3"],
        queryFn: ({ pageParam }) =>
            RecipeV2Service.listRecipes({
                limit: RECIPES_PAGE_SIZE,
                offset: pageParam,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce(
                (sum, p) => sum + (p?.items?.length ?? 0),
                0,
            );
            if (loadedCount >= (lastPage?.total ?? 0)) return undefined;
            return loadedCount;
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    const recipes: RecipeV2SummaryDTO[] =
        query.data?.pages.flatMap((p) => p?.items ?? []) ?? [];

    return {
        recipes,
        total: query.data?.pages[0]?.total ?? 0,
        isLoading: query.isLoading,
        isFetchingNextPage: query.isFetchingNextPage,
        hasNextPage: query.hasNextPage ?? false,
        fetchNextPage: query.fetchNextPage,
    };
}
