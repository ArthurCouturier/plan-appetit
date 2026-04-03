// @vitest-environment node
import { describe, it, expect } from 'vitest';
import RecipeCollectionInterface from '../api/interfaces/collections/RecipeCollectionInterface';
import RecipeSummaryInterface from '../api/interfaces/recipes/RecipeSummaryInterface';

// Extract the onDragEnd logic to test it in isolation
// We test the decision logic, not the React hook itself

const mockRecipe1: RecipeSummaryInterface = {
    uuid: 'recipe-1', name: 'Recipe 1', covers: 4, stepsCount: 3, buyPrice: 10, isPublic: false, displayOrder: 0,
};
const mockRecipe2: RecipeSummaryInterface = {
    uuid: 'recipe-2', name: 'Recipe 2', covers: 2, stepsCount: 5, buyPrice: 15, isPublic: false, displayOrder: 1,
};
const mockRecipe3: RecipeSummaryInterface = {
    uuid: 'recipe-3', name: 'Recipe 3', covers: 6, stepsCount: 2, buyPrice: 8, isPublic: false, displayOrder: 2,
};

const mockSubCollection: RecipeCollectionInterface = {
    uuid: 'sub-1', name: 'Sub Collection', level: 2, isPublic: false, isDefault: false,
    displayOrder: 0, createdAt: '2025-01-01', lastUpdated: '2025-01-01',
    recipes: [], subCollections: [],
};

const mockCollection: RecipeCollectionInterface = {
    uuid: 'collection-main', name: 'Main Collection', level: 1, isPublic: false, isDefault: true,
    displayOrder: 0, createdAt: '2025-01-01', lastUpdated: '2025-01-01',
    recipes: [mockRecipe1, mockRecipe2, mockRecipe3],
    subCollections: [mockSubCollection],
};

type DragEndParams = {
    activeId: string;
    overId: string;
    activeData: { type: string; recipe?: RecipeSummaryInterface; collection?: RecipeCollectionInterface };
};

function classifyDragEnd(params: DragEndParams): string {
    const { activeId, overId, activeData } = params;

    if (overId.startsWith('droppable-collection-') && activeData.type === 'collection') {
        return 'move-collection-to-collection';
    }

    if (overId.startsWith('droppable-collection-') && activeData.type === 'recipe') {
        return 'move-recipe-to-collection';
    }

    if (activeId === overId) return 'no-op';

    const isActiveRecipe = activeId.startsWith('recipe-');
    const isOverRecipe = overId.startsWith('recipe-');
    const isActiveCollection = activeId.startsWith('collection-');
    const isOverCollection = overId.startsWith('collection-');

    if (isActiveRecipe && isOverRecipe) return 'reorder-recipes';
    if (isActiveCollection && isOverCollection) return 'reorder-collections';

    return 'unknown';
}

describe('DnD drag end classification', () => {
    it('classifies recipe dropped on droppable-collection as move-recipe-to-collection', () => {
        const result = classifyDragEnd({
            activeId: 'recipe-recipe-1',
            overId: 'droppable-collection-sub-1',
            activeData: { type: 'recipe', recipe: mockRecipe1 },
        });
        expect(result).toBe('move-recipe-to-collection');
    });

    it('classifies collection dropped on droppable-collection as move-collection-to-collection', () => {
        const result = classifyDragEnd({
            activeId: 'collection-sub-1',
            overId: 'droppable-collection-sub-2',
            activeData: { type: 'collection', collection: mockSubCollection },
        });
        expect(result).toBe('move-collection-to-collection');
    });

    it('classifies recipe dropped on recipe as reorder-recipes', () => {
        const result = classifyDragEnd({
            activeId: 'recipe-recipe-1',
            overId: 'recipe-recipe-2',
            activeData: { type: 'recipe', recipe: mockRecipe1 },
        });
        expect(result).toBe('reorder-recipes');
    });

    it('classifies collection dropped on collection as reorder-collections', () => {
        const result = classifyDragEnd({
            activeId: 'collection-sub-1',
            overId: 'collection-sub-2',
            activeData: { type: 'collection', collection: mockSubCollection },
        });
        expect(result).toBe('reorder-collections');
    });

    it('classifies same id drop as no-op', () => {
        const result = classifyDragEnd({
            activeId: 'recipe-recipe-1',
            overId: 'recipe-recipe-1',
            activeData: { type: 'recipe', recipe: mockRecipe1 },
        });
        expect(result).toBe('no-op');
    });
});

describe('Recipe move to collection - cache update', () => {
    it('removes recipe from source collection recipes list', () => {
        const recipes = [...mockCollection.recipes];
        const recipeUuid = 'recipe-2';
        const updatedRecipes = recipes.filter(r => String(r.uuid) !== recipeUuid);

        expect(updatedRecipes).toHaveLength(2);
        expect(updatedRecipes.find(r => r.uuid === 'recipe-2')).toBeUndefined();
        expect(updatedRecipes.find(r => r.uuid === 'recipe-1')).toBeDefined();
        expect(updatedRecipes.find(r => r.uuid === 'recipe-3')).toBeDefined();
    });

    it('extracts target collection uuid from droppable id', () => {
        const overId = 'droppable-collection-sub-1';
        const targetUuid = overId.replace('droppable-collection-', '');
        expect(targetUuid).toBe('sub-1');
    });

    it('extracts recipe uuid from active data', () => {
        const activeData = { type: 'recipe', recipe: mockRecipe1 };
        const recipeUuid = String(activeData.recipe!.uuid);
        expect(recipeUuid).toBe('recipe-1');
    });
});

describe('Recipe reorder - index calculation', () => {
    it('correctly swaps recipe positions', () => {
        const recipes = [mockRecipe1, mockRecipe2, mockRecipe3];
        const activeIndex = 0; // recipe-1
        const overIndex = 2; // recipe-3

        const [movedRecipe] = recipes.splice(activeIndex, 1);
        recipes.splice(overIndex, 0, movedRecipe);

        expect(recipes[0].uuid).toBe('recipe-2');
        expect(recipes[1].uuid).toBe('recipe-3');
        expect(recipes[2].uuid).toBe('recipe-1');
    });

    it('updates displayOrder after reorder', () => {
        const recipes = [mockRecipe3, mockRecipe1, mockRecipe2];
        const updatedRecipes = recipes.map((recipe, index) => ({ ...recipe, displayOrder: index }));

        expect(updatedRecipes[0].displayOrder).toBe(0);
        expect(updatedRecipes[1].displayOrder).toBe(1);
        expect(updatedRecipes[2].displayOrder).toBe(2);
    });
});
