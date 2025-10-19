export interface SandboxRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  timeMinutes: number;
  servings: number;
  diet: string;
  imageUrl?: string | null;
  uuid?: string | null;
}
