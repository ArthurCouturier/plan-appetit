import { UUIDTypes } from "uuid";

export default interface RecipeSummaryInterface {
    uuid: UUIDTypes;
    name: string;
    covers: number;
    stepsCount?: number;
    buyPrice: number;
    isPublic: boolean;
    displayOrder: number;
    creationDate?: string | null;
    totalTimeMin?: number | null;
    restTimeMin?: number | null;
}
