export interface GuidedSandboxQuestionOption {
    value: string;
    label: string;
}

export interface GuidedSandboxQuestion {
    id: string;
    prompt: string;
    type: "choice";
    options: GuidedSandboxQuestionOption[];
    allowFreeText: boolean;
}

export interface GuidedSandboxTurn {
    questionId: string;
    choice: string;
}

export interface GuidedSandboxStepRequest {
    seed: string;
    turns: GuidedSandboxTurn[];
    surpriseMe: boolean;
    sourceRecipeUuid?: string | null;
}

export interface GuidedSandboxStep1Request {
    seed: string;
    surpriseMe: boolean;
    sourceRecipeUuid?: string | null;
}

export interface GuidedSandboxStepResponse {
    nextQuestion: GuidedSandboxQuestion | null;
    ready: boolean;
    turnIndex: number;
}

export interface GuidedSandboxGenerateRequest {
    seed: string;
    turns: GuidedSandboxTurn[];
    surpriseMe: boolean;
    sourceRecipeUuid?: string | null;
}

export interface GuidedSandboxGenerateResponse {
    recipeUuid: string;
}

export interface GuidedSandboxRecipeSummary {
    uuid: string;
    name: string;
}
