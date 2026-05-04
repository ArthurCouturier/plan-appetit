export interface ResizedImage {
    base64: string;
    mimeType: "image/jpeg";
    sizeBytes: number;
}

const TARGET_SIZE_PX = 256;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const PRIMARY_QUALITY = 0.8;
const FALLBACK_QUALITY = 0.7;
const MAX_OUTPUT_BYTES = 60_000;

export class ImageTooLargeError extends Error {
    constructor() {
        super("Image trop lourde (max 8 Mo).");
    }
}

export class UnsupportedImageError extends Error {
    constructor() {
        super("Format d'image non supporté.");
    }
}

export async function resizeProfileImage(file: File): Promise<ResizedImage> {
    if (file.size > MAX_INPUT_BYTES) throw new ImageTooLargeError();
    if (!file.type.startsWith("image/")) throw new UnsupportedImageError();

    const bitmap = await loadBitmap(file);
    const blobPrimary = await renderToJpeg(bitmap, PRIMARY_QUALITY);
    const chosen = blobPrimary.size <= MAX_OUTPUT_BYTES
        ? blobPrimary
        : await renderToJpeg(bitmap, FALLBACK_QUALITY);

    const base64 = await blobToBase64(chosen);
    return {
        base64,
        mimeType: "image/jpeg",
        sizeBytes: chosen.size,
    };
}

async function loadBitmap(file: File): Promise<HTMLImageElement> {
    const url = URL.createObjectURL(file);
    try {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new UnsupportedImageError());
            img.src = url;
        });
    } finally {
        URL.revokeObjectURL(url);
    }
}

async function renderToJpeg(img: HTMLImageElement, quality: number): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = TARGET_SIZE_PX;
    canvas.height = TARGET_SIZE_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new UnsupportedImageError();

    const sourceSize = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - sourceSize) / 2;
    const sy = (img.naturalHeight - sourceSize) / 2;
    ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, TARGET_SIZE_PX, TARGET_SIZE_PX);

    return await new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new UnsupportedImageError())),
            "image/jpeg",
            quality,
        );
    });
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const idx = result.indexOf("base64,");
            resolve(idx >= 0 ? result.slice(idx + "base64,".length) : result);
        };
        reader.onerror = () => reject(new UnsupportedImageError());
        reader.readAsDataURL(blob);
    });
}
