import { redirect } from "react-router-dom";
import RecipeGenerationParametersInterface from "../interfaces/recipes/RecipeGenerationParametersInterface";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";
import UserInterface from "../interfaces/users/UserInterface";

export default class BackendService {
  private baseUrl: string;
  private port: string;
  static baseUrl: string = import.meta.env.VITE_API_URL;
  static port: string = import.meta.env.VITE_API_PORT;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL as string;
    this.port = import.meta.env.VITE_API_PORT as string;
  }

  public static async registerNewUser(
    user: UserInterface,
    token: string
  ): Promise<UserInterface> {
    console.log("token", token);
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/users/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du profil");
    }

    return response.json();
  }

  public async updateSomething(
    data: unknown,
    email: string,
    token: string
  ): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}:${this.port}/api/something`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Email: email,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    return response.json();
  }

  public async updateRecipe(
    recipe: RecipeInterface,
    email: string,
    token: string
  ): Promise<RecipeInterface[]> {
    return this.updateSomething(recipe, email, token) as Promise<
      RecipeInterface[]
    >;
  }

  public static async getPersonalRecipes(
    email: string,
    token: string
  ): Promise<RecipeInterface[]> {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/recipes/all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Email: email,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    return response.json();
  }

  public static async createNewEmptyRecipe(
    email: string,
    token: string
  ): Promise<RecipeInterface> {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/recipes/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Email: email,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    const newRecipe: Promise<RecipeInterface> = response
      .json()
      .then((recipe) => {
        const allRecipes: RecipeInterface[] = localStorage.getItem("recipes")
          ? JSON.parse(localStorage.getItem("recipes") as string)
          : [];
        allRecipes.push(recipe);
        localStorage.setItem("recipes", JSON.stringify(allRecipes));
        return recipe;
      });

    return newRecipe;
  }

  public static async importRecipeFromLocalFile(
    recipe: RecipeInterface,
    email: string,
    token: string
  ): Promise<RecipeInterface> {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/recipes/import`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Email: email,
        },
        body: JSON.stringify(recipe),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    const newRecipe: Promise<RecipeInterface> = response
      .json()
      .then((recipe) => {
        const allRecipes: RecipeInterface[] = localStorage.getItem("recipes")
          ? JSON.parse(localStorage.getItem("recipes") as string)
          : [];
        allRecipes.push(recipe);
        localStorage.setItem("recipes", JSON.stringify(allRecipes));
        return recipe;
      });

    return newRecipe;
  }

  public async generateRepiceWithOpenAI(
    generationParameters: RecipeGenerationParametersInterface,
    email: string,
    token: string
  ): Promise<RecipeInterface | null> {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/recipes/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Email: email,
        },
        body: JSON.stringify(generationParameters),
      }
    );

    if (response.status == 403) {
      console.log("mince");
      redirect("/premium");
      return null;
    }

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    const recipe: Promise<RecipeInterface> = response.json();

    const allRecipes: RecipeInterface[] = localStorage.getItem("recipes")
      ? JSON.parse(localStorage.getItem("recipes") as string)
      : [];
    recipe.then((recipe) => {
      allRecipes.push(recipe);
      localStorage.setItem("recipes", JSON.stringify(allRecipes));
    });

    return recipe;
  }

  public static async deleteRecipe(
    email: string,
    token: string,
    recipeUuid: string
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/recipes/delete/${recipeUuid}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Email: email,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    this.getPersonalRecipes(email, token).then((recipes) => {
      localStorage.setItem("recipes", JSON.stringify(recipes));
    });
  }

  public static async updateRecipe(
    email: string,
    token: string,
    recipe: RecipeInterface
  ): Promise<RecipeInterface> {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/recipes/update`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Email: email,
        },
        body: JSON.stringify(recipe),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    const updatedRecipe: Promise<RecipeInterface> = response.json();

    const allRecipes: RecipeInterface[] = localStorage.getItem("recipes")
      ? JSON.parse(localStorage.getItem("recipes") as string)
      : [];
    updatedRecipe.then((recipe) => {
      const index = allRecipes.findIndex((r) => r.uuid === recipe.uuid);
      allRecipes[index] = recipe;
      localStorage.setItem("recipes", JSON.stringify(allRecipes));
    });

    return updatedRecipe;
  }

  public static async upgradeUser(token: string | null) {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_1RvDoULO5WTDaXvxI6UAGW6g",
          quantity: 1,
          successUrl: window.location.origin + "/complete",
          cancelUrl: window.location.origin + "/Cancel",
          token: token,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la création de la session checkout");
    }
    return response;
  }

  public static async isPremium(token: string, email: string) {
    const response = await fetch(
      `${this.baseUrl}:${this.port}/api/v1/users/isPremium`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Email: email,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la vérification premium");
    }

    const isPremium: boolean = await response.json();
    return isPremium;
  }
}
