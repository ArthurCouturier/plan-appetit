import { QuotaInfo } from "./QuotaInfo";
import { SandboxRecipe } from "./SandboxRecipe";

export interface SandboxGenerateResponse {
  recipes: SandboxRecipe[];
  quota: QuotaInfo;
  recipeUuid?: string;
}
