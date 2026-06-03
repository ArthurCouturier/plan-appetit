import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/**
 * Headers `X-App-Version` / `X-App-Platform` injectés sur toutes les requêtes API.
 * Le back utilise ces headers (cf. AppVersionFilter) pour brancher entre format DTO
 * legacy (1.x.x) et nouveau format (2.0+). Le front 2.0+ doit donc toujours envoyer
 * une version >= "2.0.0" pour recevoir la nouvelle shape de réponse.
 *
 * Init asynchrone au boot via `App.getInfo()` (Capacitor) sur iOS/Android. Sur desktop/web,
 * `App.getInfo()` échoue et on garde la version issue de `package.json` (`__APP_VERSION__`,
 * injectée par Vite) — ainsi le bump de version desktop se fait uniquement dans package.json.
 */

let cachedVersion = __APP_VERSION__;
const cachedPlatform = Capacitor.getPlatform(); // "ios" | "android" | "web"

export async function initAppVersionHeaders(): Promise<void> {
    try {
        const info = await App.getInfo();
        if (info.version) cachedVersion = info.version;
    } catch {
        // App.getInfo() peut échouer en mode dev web pur — on garde le fallback "2.0.0".
    }
}

export function getAppVersionHeaders(): Record<string, string> {
    return {
        "X-App-Version": cachedVersion,
        "X-App-Platform": cachedPlatform,
    };
}
