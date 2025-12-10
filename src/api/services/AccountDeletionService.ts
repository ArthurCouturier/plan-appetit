import { AccountDeletionResponse, AccountDeletionStatusResponse } from "../interfaces/users/AccountDeletionInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class AccountDeletionService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    public static async requestAccountDeletion(
        email: string,
        token: string
    ): Promise<AccountDeletionResponse> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        return response.json();
    }

    public static async cancelAccountDeletion(
        email: string,
        token: string
    ): Promise<AccountDeletionResponse> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/account/cancel-deletion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        return response.json();
    }

    public static async getAccountDeletionStatus(
        email: string,
        token: string
    ): Promise<AccountDeletionStatusResponse> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/account/deletion-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        return response.json();
    }
}
