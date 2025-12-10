import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export interface DataExportResponse {
    success: boolean;
    message: string;
}

export default class UserDataExportService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    public static async requestDataExport(
        email: string,
        token: string,
        confirmEmail: string
    ): Promise<DataExportResponse> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/export-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
            body: JSON.stringify({ confirmEmail })
        });

        return response.json();
    }
}
