import {
    MyProfileInterface,
    UpdateProfileRequest,
    UpdateProfileResponse,
} from "../interfaces/users/MyProfileInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class UserProfileService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    public static async getMyProfile(email: string, token: string): Promise<MyProfileInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/users/me/profile`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            },
        );
        if (!response.ok) throw new Error("Erreur lors de la récupération du profil.");
        return response.json();
    }

    public static async updateProfile(
        email: string,
        token: string,
        body: UpdateProfileRequest,
    ): Promise<UpdateProfileResponse> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/users/me/profile`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify(body),
            },
        );
        return response.json();
    }

    public static async deleteProfilePhoto(email: string, token: string): Promise<MyProfileInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/users/me/profile-photo`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            },
        );
        if (!response.ok) throw new Error("Erreur lors de la suppression de la photo.");
        return response.json();
    }
}
