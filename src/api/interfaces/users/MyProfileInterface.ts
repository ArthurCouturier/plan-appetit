export interface MyProfileInterface {
    displayName: string;
    email: string;
    profilePhoto: string | null;
    hasCustomPhoto: boolean;
}

export type ProfileErrorCode =
    | "DISPLAY_NAME_TOO_SHORT"
    | "DISPLAY_NAME_TOO_LONG"
    | "PHOTO_TOO_LARGE"
    | "INVALID_MIME_TYPE"
    | "INVALID_BASE64"
    | "UNAUTHORIZED"
    | "INTERNAL_ERROR";

export interface UpdateProfileResponse {
    success: boolean;
    errorCode?: ProfileErrorCode | null;
    message?: string | null;
    profile?: MyProfileInterface | null;
}

export interface UpdateProfileRequest {
    displayName?: string;
    profilePhotoBase64?: string;
    profilePhotoMimeType?: string;
}
