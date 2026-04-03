export interface NotificationInterface {
    id: string;
    title: string;
    body: string;
    actionUrl: string | null;
    iconType: string;
    metadata: Record<string, unknown> | null;
    read: boolean;
    createdAt: string;
}

export interface NotificationPageInterface {
    content: NotificationInterface[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    unreadCount: number;
}
