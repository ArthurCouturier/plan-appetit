/**
 * Client SSE maison basé sur fetch + ReadableStream.
 * Pourquoi pas EventSource natif : il ne supporte pas les headers customs
 * (Authorization, Email) donc on doit utiliser fetch.
 * Pourquoi pas une lib externe : besoin minimal, ~80 lignes suffisent, 0 dep.
 *
 * Features :
 * - Headers customs supportés (auth Bearer comme le reste de l'app)
 * - Auto-reconnect avec backoff exponentiel (capped à 30s)
 * - Callbacks onOpen / onMessage / onError / onClose
 * - Abort via AbortController retourné
 * - Parse SSE format basique : "event: ...", "data: ...", "\n\n" comme séparateur
 */

export interface SseMessage<T = unknown> {
    event: string;
    data: T;
    id?: string;
}

export interface SseClientOptions<T = unknown> {
    url: string;
    headers?: Record<string, string>;
    onOpen?: () => void;
    onMessage?: (msg: SseMessage<T>) => void;
    onError?: (err: unknown) => void;
    onClose?: () => void;
    /** ms entre tentatives, doublé à chaque échec (capped à maxReconnectMs). 0 = pas de reconnect. */
    initialReconnectMs?: number;
    maxReconnectMs?: number;
}

export function openSseConnection<T = unknown>(opts: SseClientOptions<T>): AbortController {
    const controller = new AbortController();
    let reconnectMs = opts.initialReconnectMs ?? 1000;
    const maxReconnect = opts.maxReconnectMs ?? 30_000;
    let stopped = false;

    const run = async (): Promise<void> => {
        try {
            const response = await fetch(opts.url, {
                method: "GET",
                headers: {
                    Accept: "text/event-stream",
                    "Cache-Control": "no-cache",
                    ...(opts.headers ?? {}),
                },
                signal: controller.signal,
            });
            if (!response.ok || !response.body) {
                throw new Error(`SSE handshake failed: HTTP ${response.status}`);
            }
            opts.onOpen?.();
            reconnectMs = opts.initialReconnectMs ?? 1000;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                // Normalise CRLF → LF pour ne pas dépendre de l'OS du back (Tomcat sur Windows émet du \r\n)
                buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
                let sepIndex: number;
                while ((sepIndex = buffer.indexOf("\n\n")) >= 0) {
                    const rawEvent = buffer.slice(0, sepIndex);
                    buffer = buffer.slice(sepIndex + 2);
                    const parsed = parseSseBlock<T>(rawEvent);
                    if (parsed) opts.onMessage?.(parsed);
                }
            }
        } catch (err) {
            if (controller.signal.aborted || stopped) return;
            opts.onError?.(err);
        }
        if (stopped || controller.signal.aborted) {
            opts.onClose?.();
            return;
        }
        // Reconnect
        if ((opts.initialReconnectMs ?? 1000) <= 0) {
            opts.onClose?.();
            return;
        }
        await sleep(reconnectMs);
        reconnectMs = Math.min(reconnectMs * 2, maxReconnect);
        if (!stopped && !controller.signal.aborted) run();
    };

    void run();

    // Wrap abort to mark stopped first (avoid race triggering reconnect)
    const originalAbort = controller.abort.bind(controller);
    controller.abort = (reason?: unknown) => {
        stopped = true;
        originalAbort(reason);
    };

    return controller;
}

function parseSseBlock<T>(block: string): SseMessage<T> | null {
    const lines = block.split("\n");
    let event = "message";
    let dataLines: string[] = [];
    let id: string | undefined;
    for (const line of lines) {
        if (line.startsWith(":")) continue; // commentaire SSE
        const colonIdx = line.indexOf(":");
        if (colonIdx < 0) continue;
        const field = line.slice(0, colonIdx);
        const value = line.slice(colonIdx + 1).replace(/^ /, "");
        if (field === "event") event = value;
        else if (field === "data") dataLines.push(value);
        else if (field === "id") id = value;
    }
    if (dataLines.length === 0) return null;
    const dataStr = dataLines.join("\n");
    let data: T;
    try {
        data = JSON.parse(dataStr) as T;
    } catch {
        // Si pas JSON, on renvoie comme string (cas du "ok" initial)
        data = dataStr as unknown as T;
    }
    return { event, data, id };
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}
