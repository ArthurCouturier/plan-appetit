import StatisticsInterface from "../interfaces/users/StatisticsInterface";
import SuccessInterface, { SuccessClaimResponse, SuccessType } from "../interfaces/users/SuccessInterface";
import BackendService from "./BackendService";

export default class UserStatsService {

    static async fetchStatistics(): Promise<StatisticsInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not authenticated');
        }

        const statistics: StatisticsInterface = await BackendService.getUserStatistics(email, token);
        return statistics;
    }

    static async fetchSuccess(): Promise<SuccessInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not authenticated');
        }

        const success: SuccessInterface = await BackendService.getUserSuccess(email, token);
        return success;
    }

    static async claimSuccessReward(successType: SuccessType): Promise<SuccessClaimResponse> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not authenticated');
        }

        const response: SuccessClaimResponse = await BackendService.claimSuccessReward(
            email,
            token,
            successType
        );
        return response;
    }
}
