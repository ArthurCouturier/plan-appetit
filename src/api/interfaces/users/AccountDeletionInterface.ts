export interface AccountDeletionResponse {
    success: boolean;
    message: string;
    scheduledDeletionDate?: string;
}

export interface AccountDeletionStatusResponse {
    isDeletionScheduled: boolean;
    scheduledDeletionDate?: string;
    canCancel: boolean;
}
