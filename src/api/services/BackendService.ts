export default class BackendService {
    private baseUrl: string;
    private port: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL as string;
        this.port = import.meta.env.VITE_API_PORT as string;
    }

    public async checkProfile(token: string): Promise<unknown> {
        const response = await fetch(`${this.baseUrl}:${this.port}/api/v1/users/checkProfile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du profil');
        }

        return response.json();
    }

    public async updateSomething(token: string, data: unknown): Promise<unknown> {
        const response = await fetch(`${this.baseUrl}:${this.port}/api/something`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        return response.json();
    }

}
