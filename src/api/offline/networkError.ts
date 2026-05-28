export class NetworkError extends Error {
    constructor(message = "Network unreachable") {
        super(message);
        this.name = "NetworkError";
    }
}

export function isNetworkError(err: unknown): boolean {
    if (err instanceof NetworkError) return true;
    if (err instanceof TypeError) return true;
    if (err instanceof Error) {
        return /failed to fetch|network|load failed|timeout|aborted|networkerror/i.test(err.message);
    }
    return false;
}

export async function withNetworkErrorDetection<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (isNetworkError(err)) {
            throw new NetworkError(err instanceof Error ? err.message : "Network unreachable");
        }
        throw err;
    }
}
