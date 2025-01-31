import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import RecipeManager from "./RecipeManager";

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

export async function getRecipe(): Promise<RecipeType> {
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a creative chef and you live in Toulouse. It is winter and you are particularly gifted at creating seasonal recipes for your location." },
            { role: "user", content: "Create an innovative recipe for your restaurant, for a budget of €10 per person that we can sell for €20 per person. Answer everything in french." },
        ],
        response_format: zodResponseFormat(Recipe, "recipe"),
    });

    const recipe: RecipeType = completion.choices[0].message.parsed as RecipeType;

    localStorage.setItem("recipe_ai", JSON.stringify(recipe));

    RecipeManager.importRecipe(JSON.parse(JSON.stringify(recipe)));

    return recipe;
}
