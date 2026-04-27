import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import type {
    GuidedSandboxStep1Request,
    GuidedSandboxStepRequest,
    GuidedSandboxStepResponse,
    GuidedSandboxGenerateRequest,
    GuidedSandboxGenerateResponse,
    GuidedSandboxRecipeSummary,
} from "../interfaces/guided-sandbox/GuidedSandboxTypes";

export default class GuidedSandboxService {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (this.port) {
            return `${this.baseUrl}:${this.port}`;
        }
        return this.baseUrl;
    }

    private static buildHeaders(email: string, token: string): HeadersInit {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Email: email,
        };
    }

    private static async postJson<T>(path: string, body: unknown, email: string, token: string): Promise<T> {
        const response = await fetchWithTokenRefresh(`${this.getApiUrl()}${path}`, {
            method: "POST",
            headers: this.buildHeaders(email, token),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Requête ${path} a échoué (${response.status})`);
        }

        return response.json() as Promise<T>;
    }

    public static step1(
        request: GuidedSandboxStep1Request,
        email: string,
        token: string
    ): Promise<GuidedSandboxStepResponse> {
        return this.postJson<GuidedSandboxStepResponse>(
            "/api/v1/sandbox/guided/step1",
            request,
            email,
            token
        );
    }

    public static step2(
        request: GuidedSandboxStepRequest,
        email: string,
        token: string
    ): Promise<GuidedSandboxStepResponse> {
        return this.postJson<GuidedSandboxStepResponse>(
            "/api/v1/sandbox/guided/step2",
            request,
            email,
            token
        );
    }

    public static step3(
        request: GuidedSandboxStepRequest,
        email: string,
        token: string
    ): Promise<GuidedSandboxStepResponse> {
        return this.postJson<GuidedSandboxStepResponse>(
            "/api/v1/sandbox/guided/step3",
            request,
            email,
            token
        );
    }

    public static step4(
        request: GuidedSandboxStepRequest,
        email: string,
        token: string
    ): Promise<GuidedSandboxStepResponse> {
        return this.postJson<GuidedSandboxStepResponse>(
            "/api/v1/sandbox/guided/step4",
            request,
            email,
            token
        );
    }

    public static step5(
        request: GuidedSandboxStepRequest,
        email: string,
        token: string
    ): Promise<GuidedSandboxStepResponse> {
        return this.postJson<GuidedSandboxStepResponse>(
            "/api/v1/sandbox/guided/step5",
            request,
            email,
            token
        );
    }

    /**
     * Appelle le bon endpoint stepN selon le nombre de tours déjà enregistrés.
     * turns.length = 0 → step1, 1 → step2, 2 → step3, 3 → step4, 4 → step5.
     * Au-delà, le backend force ready=true.
     */
    public static submitTurn(
        request: GuidedSandboxStepRequest,
        email: string,
        token: string
    ): Promise<GuidedSandboxStepResponse> {
        const turnsDone = request.turns.length;
        switch (turnsDone) {
            case 0:
                return this.step1(request, email, token);
            case 1:
                return this.step2(request, email, token);
            case 2:
                return this.step3(request, email, token);
            case 3:
                return this.step4(request, email, token);
            default:
                return this.step5(request, email, token);
        }
    }

    public static generate(
        request: GuidedSandboxGenerateRequest,
        email: string,
        token: string
    ): Promise<GuidedSandboxGenerateResponse> {
        return this.postJson<GuidedSandboxGenerateResponse>(
            "/api/v1/sandbox/guided/generate",
            request,
            email,
            token
        );
    }

    public static async fetchRecipeV2Summary(
        uuid: string,
        email: string,
        token: string
    ): Promise<GuidedSandboxRecipeSummary> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v2/recipes/${uuid}`,
            {
                method: "GET",
                headers: this.buildHeaders(email, token),
            }
        );

        if (!response.ok) {
            throw new Error(`Impossible de récupérer la recette (${response.status})`);
        }

        return response.json() as Promise<GuidedSandboxRecipeSummary>;
    }
}
