import type RecipeSummaryInterface from "../interfaces/recipes/RecipeSummaryInterface";
import type {
    BatchCookingResponse,
    BatchCookingShoppingItem as V0ShoppingItem,
    BatchCookingExecutionStep as V0ExecutionStep,
    BatchMode,
    BudgetTarget,
    MealType,
} from "../interfaces/batchcooking/BatchCookingInterfaces";
import type {
    BatchCookingV2DTO,
    BatchCookingV2RecipeRefDTO,
    BatchCookingV2ShoppingItemDTO,
    BatchCookingV2ExecutionStepDTO,
} from "../interfaces/v2/BatchCookingV2";

/**
 * Adapte un BatchCookingV2DTO (forme native v2) vers BatchCookingResponse (forme v0
 * historique, consommée par BatchStep4Results et ses tabs).
 *
 * Pattern miroir de mapV2RecipeSummaryToV0 dans useCollectionQueries — on isole la
 * version de schéma derrière un adapter, ce qui permet de basculer la lecture en v2
 * sans toucher aux pages existantes pendant la fenêtre de coexistence.
 *
 * Recipes : on construit des RecipeSummaryInterface depuis les refs v2 (uuid, name,
 * covers, totalTimeMin, buyPrice). Les champs absents (steps, ingredients) ne sont
 * pas nécessaires pour l'affichage liste / shopping / planning du BC.
 */
export function mapV2BcToV0Response(v2: BatchCookingV2DTO): BatchCookingResponse {
    return {
        uuid: v2.uuid,
        name: v2.name,
        createdAt: v2.createdAt,
        month: v2.month,
        config: {
            mode: v2.mode as BatchMode,
            totalMeals: v2.totalMeals,
            defaultPeopleCount: v2.defaultPeopleCount,
            slots: v2.slots
                .map((s) => ({
                    index: s.slotIndex,
                    peopleCount: s.peopleCount,
                    type: s.mealType as MealType,
                }))
                .sort((a, b) => a.index - b.index),
        },
        preferences: {
            cuisineStyles: v2.preferences.cuisineStyles,
            dietaryRestrictions: v2.preferences.dietaryRestrictions,
            budgetTarget: v2.budgetTarget as BudgetTarget,
            availableEquipment: v2.preferences.availableEquipment,
            excludedIngredients: v2.preferences.excludedIngredients,
        },
        // Cast en RecipeInterface[] : on remplit les champs utilisés par les pages BC
        // (uuid, name, covers, totalTimeMin, buyPrice). Les autres restent à des defaults
        // — non consommés par les composants en aval (RecipeCard, ShoppingTab, PlanningTab).
        recipes: v2.recipes.map(mapV2RecipeRefToV0Summary) as never,
        shoppingList: v2.shoppingItems.map(mapV2ShoppingItemToV0),
        estimatedCost: {
            total: parseFloat(v2.costTotal),
            perMeal: parseFloat(v2.costPerMeal),
            perPerson: parseFloat(v2.costPerPerson),
            currency: v2.currency,
        },
        executionPlan: v2.executionSteps.map(mapV2ExecutionStepToV0),
    };
}

function mapV2RecipeRefToV0Summary(ref: BatchCookingV2RecipeRefDTO): RecipeSummaryInterface {
    return {
        uuid: ref.uuid,
        name: ref.name,
        covers: ref.covers,
        buyPrice: ref.buyPrice ? parseFloat(ref.buyPrice) : 0,
        isPublic: false,
        displayOrder: ref.displayOrder,
        creationDate: null,
        totalTimeMin: ref.totalTimeMin,
        restTimeMin: null,
    };
}

function mapV2ShoppingItemToV0(item: BatchCookingV2ShoppingItemDTO): V0ShoppingItem {
    return {
        uuid: item.uuid,
        name: item.ingredientName,
        totalQuantity: parseFloat(item.totalQuantity),
        unit: item.unitCode === "NONE" ? null : item.unitCode,
        estimatedPrice: parseFloat(item.estimatedPrice),
        category: item.ingredientCategoryCode,
        recipeUuids: item.recipeUuids,
    };
}

function mapV2ExecutionStepToV0(step: BatchCookingV2ExecutionStepDTO): V0ExecutionStep {
    return {
        uuid: step.uuid,
        executionOrder: step.displayOrder,
        description: step.instruction,
        recipeNames: [],
        stepType: step.stepType === "ACTIVE" || step.stepType === "PASSIVE" ? step.stepType : null,
        durationMinutes: step.durationMin,
        tip: step.tipFr,
    };
}
