export const seasonLabelsV2: Record<string, string> = {
    SPRING: "Printemps",
    SUMMER: "Été",
    FALL: "Automne",
    AUTUMN: "Automne",
    WINTER: "Hiver",
    ALL: "Toute l'année",
};

export function formatSeasonV2(code: string): string {
    return seasonLabelsV2[code.toUpperCase()] ?? code;
}

export const courseLabelsV2: Record<string, string> = {
    STARTER: "Entrée",
    MAIN: "Plat",
    DESSERT: "Dessert",
    DRINK: "Boisson",
};

export function formatCourseV2(code: string | null): string | null {
    if (!code) return null;
    return courseLabelsV2[code.toUpperCase()] ?? code;
}

// Sync avec v2.ingredient_categories (back, seed V2026.05.01.00.00.02). 14 codes.
// Toute évolution back impose la mise à jour ici. Voir shopping-lists-plan.md (flag sync long-terme).
export const ingredientCategoryLabelsV2: Record<string, string> = {
    MEAT: "Viande",
    FISH: "Poisson",
    DAIRY: "Produit laitier",
    VEGETABLE: "Légume",
    FRUIT: "Fruit",
    CEREAL: "Céréale",
    LEGUME: "Légumineuse",
    NUT_SEED: "Noix / graine",
    SPICES: "Épice",
    HERB: "Herbe aromatique",
    OIL_VINEGAR: "Huile / vinaigre",
    SUGAR_SWEETENER: "Sucre / édulcorant",
    BEVERAGE: "Boisson",
    OTHER: "Autre",
};

export function formatIngredientCategoryV2(code: string): string {
    return ingredientCategoryLabelsV2[code.toUpperCase()] ?? "Autre";
}

// Sync avec v2.units (back, seed V2026.05.01.00.00.02). 14 codes.
// Singular = symbol back ; plural géré côté UI (PIECE / PINCH / BUNCH / DROP / CUP).
export const unitLabelsV2: Record<string, { singular: string; plural?: string }> = {
    MILLIGRAM: { singular: "mg" },
    GRAM: { singular: "g" },
    KILOGRAM: { singular: "kg" },
    MILLILITER: { singular: "mL" },
    CENTILITER: { singular: "cL" },
    LITER: { singular: "L" },
    PIECE: { singular: "pièce", plural: "pièces" },
    TBSP: { singular: "c. à s." },
    TSP: { singular: "c. à c." },
    CUP: { singular: "verre", plural: "verres" },
    PINCH: { singular: "pincée", plural: "pincées" },
    BUNCH: { singular: "botte", plural: "bottes" },
    DROP: { singular: "goutte", plural: "gouttes" },
    NONE: { singular: "" },
};

export function formatQuantityV2(quantity: string | null, unitCode: string): string | null {
    if (quantity === null || quantity === undefined || quantity === "") return null;
    const value = parseFloat(quantity);
    if (Number.isNaN(value)) return null;

    const unit = unitLabelsV2[unitCode?.toUpperCase()] ?? { singular: unitCode ?? "" };
    const label = value > 1 && unit.plural ? unit.plural : unit.singular;

    const formattedValue = Number.isInteger(value) ? String(value) : value.toLocaleString("fr-FR", {
        maximumFractionDigits: 2,
    });

    return label ? `${formattedValue} ${label}` : formattedValue;
}

export function formatHeatingSurfaceV2(code: string | null): string | null {
    if (!code) return null;
    const map: Record<string, string> = {
        OVEN: "Four",
        STOVE: "Plaque",
        GRILL: "Gril",
        STEAMER: "Vapeur",
        FRYER: "Friteuse",
        MICROWAVE: "Micro-ondes",
        BBQ: "Barbecue",
    };
    return map[code.toUpperCase()] ?? code;
}

export function formatPriceV2(value: string | null, currency: string): string | null {
    if (value === null || value === undefined || value === "") return null;
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return null;
    const currencySymbol = currency === "EUR" ? "€" : currency;
    return `${parsed.toFixed(2)} ${currencySymbol}`;
}
