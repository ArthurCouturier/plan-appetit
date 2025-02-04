import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import RecipeManager from "./RecipeManager";
import RecipeGenerationParametersInterface from "../interfaces/recipes/RecipeGenerationParametersInterface";

const IngredientCategoryEnum = z.enum(["Viande", "Poisson", "Légume", "Fruit", "Produit laitier", "Céréale", "Epice", "Autre"]);

const SeasonEnum = z.enum(["Hiver", "Printemps", "Été", "Automne"]);

const UnitEnum = z.enum(["gramme", "kilogramme", "millilitre", "centilitre", "litre", "pièce", "aucune"]);

const QuantityInterface = z.object({
    value: z.number(),
    unit: UnitEnum,
});

const Ingredient = z.object({
    uuid: z.string(),
    name: z.string(),
    category: IngredientCategoryEnum,
    season: z.array(SeasonEnum),
    quantity: QuantityInterface,
});

const CourseEnum = z.enum(["Entrée", "Plat", "Dessert", "Boisson"]);

const Step = z.object({
    key: z.number(),
    value: z.string(),
});

const Recipe = z.object({
    uuid: z.string(),
    name: z.string(),
    ingredients: z.array(Ingredient),
    covers: z.number(),
    buyPrice: z.number(),
    sellPrice: z.number(),
    promotion: z.number(),
    course: CourseEnum,
    steps: z.array(Step),
    season: z.array(SeasonEnum),
});

export type RecipeType = z.infer<typeof Recipe>;

function createPrompt(generationInterface: RecipeGenerationParametersInterface): string {

    const { localisation, seasons, ingredients, book, vegan, allergens, buyingPrice, sellingPrice } = generationInterface;

    const basePrompt = `Vous êtes un chef créatif et vous vivez à ${localisation}. La saison est ${seasons.join(" et ")} et vous êtes particulièrement doué pour créer des recettes de saison pour votre emplacement.`;
    const prompt = `Créez une recette innovante ${ingredients ? " basée autour des ingrédients suivants: " + ingredients : ""} ${allergens ? " mais excluant pour causes d'allergies les ingrédients suivants: " + allergens : ""} pour votre restaurant, pour un budget de ${buyingPrice ? buyingPrice : 10}€ par personne que nous vendrons pour ${sellingPrice ? sellingPrice : "20"}€ par personne. ${vegan && "Cette recette doit absolument respecter le fait d'être vegan."} Répondez à tout en français.`;
    const bookPrompt = book ? "Les recettes suivantes seront une base d'inspiration pour votre création: " + String(RecipeManager.fetchRecipes()) : "";
    const moderationPrompt = "Veuillez ne pas inclure de contenu inapproprié ou offensant dans votre réponse. Veuillez également ne pas inclure de contenu protégé par des droits d'auteur ou vous semblant étrange, sensible ou offensant.";

    return `${basePrompt} ${prompt} ${bookPrompt} ${moderationPrompt}`;
}

export async function generateRecipe(generationInterface: RecipeGenerationParametersInterface): Promise<RecipeType> {
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
            { role: "user", content: createPrompt(generationInterface) },
        ],
        response_format: zodResponseFormat(Recipe, "recipe"),
    });

    const recipe: RecipeType = completion.choices[0].message.parsed as RecipeType;

    localStorage.setItem("recipe_ai", JSON.stringify(recipe));

    RecipeManager.importRecipe(JSON.parse(JSON.stringify(recipe)));

    return recipe;
}
