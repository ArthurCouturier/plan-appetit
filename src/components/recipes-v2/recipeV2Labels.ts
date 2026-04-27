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

export const ingredientCategoryLabelsV2: Record<string, string> = {
    MEAT: "Viande",
    FISH: "Poisson",
    SEAFOOD: "Produits de la mer",
    VEGETABLE: "Légumes",
    FRUIT: "Fruits",
    DAIRY: "Produits laitiers",
    CEREAL: "Céréales",
    GRAIN: "Céréales",
    SPECIES: "Épices",
    SPICE: "Épices",
    HERB: "Herbes",
    CONDIMENT: "Condiments",
    OIL: "Huiles",
    PANTRY: "Placard",
    SWEETENER: "Sucres",
    OTHER: "Autre",
};

export function formatIngredientCategoryV2(code: string): string {
    return ingredientCategoryLabelsV2[code.toUpperCase()] ?? "Autre";
}

export const unitLabelsV2: Record<string, { singular: string; plural?: string }> = {
    GRAM: { singular: "g" },
    KILOGRAM: { singular: "kg" },
    MILLIGRAM: { singular: "mg" },
    MILLILITER: { singular: "ml" },
    CENTILITER: { singular: "cl" },
    DECILITER: { singular: "dl" },
    LITER: { singular: "l" },
    PIECE: { singular: "pièce", plural: "pièces" },
    TEASPOON: { singular: "c.à.c" },
    TSP: { singular: "c.à.c" },
    TABLESPOON: { singular: "c.à.s" },
    TBSP: { singular: "c.à.s" },
    CUP: { singular: "tasse", plural: "tasses" },
    PINCH: { singular: "pincée", plural: "pincées" },
    DROP: { singular: "goutte", plural: "gouttes" },
    BUNCH: { singular: "botte", plural: "bottes" },
    CLOVE: { singular: "gousse", plural: "gousses" },
    SLICE: { singular: "tranche", plural: "tranches" },
    SPRIG: { singular: "brin", plural: "brins" },
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
