/**
 * Coordinateur de l'animation "indice de retournement" des RecipeCard.
 *
 * Objectif UX : tant que l'utilisateur n'a pas découvert qu'une carte se retourne,
 * on fait trembler (léger aller-retour en rotateY) UNE carte visible toutes les 30s.
 * Dès qu'il retourne complètement une carte, on mémorise la date et on arrête de
 * "nagger" pendant 15 jours.
 *
 * Le hint est calculé une seule fois au démarrage de session (chargement du module).
 */

const STORAGE_KEY = "recipeCardFlipHint:lastFullFlipAt";
const HINT_DISMISS_DAYS = 15;
const SHAKE_INTERVAL_MS = 3_000;
const DAY_MS = 24 * 60 * 60 * 1000;

function computeHintActive(): boolean {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return true;
        const ts = Number(raw);
        if (!Number.isFinite(ts)) return true;
        return Date.now() - ts > HINT_DISMISS_DAYS * DAY_MS;
    } catch {
        return false;
    }
}

let hintActive = computeHintActive();
const visibleCards = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function stopTicker() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function tick() {
    if (!hintActive || visibleCards.size === 0) {
        stopTicker();
        return;
    }
    const cards = Array.from(visibleCards);
    const pick = cards[Math.floor(Math.random() * cards.length)];
    pick();
}

function ensureTicker() {
    if (!hintActive || intervalId !== null || visibleCards.size === 0) return;
    intervalId = setInterval(tick, SHAKE_INTERVAL_MS);
}

export function isFlipHintActive(): boolean {
    return hintActive;
}

/** Mémorise un retournement complet et désactive le hint pour les 15 prochains jours. */
export function recordFullFlip(): void {
    try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
        // localStorage indisponible : on désactive quand même pour la session.
    }
    hintActive = false;
    stopTicker();
}

/**
 * Enregistre une carte actuellement visible et sa callback de tremblement.
 * Retourne une fonction de désinscription.
 */
export function registerVisibleCard(shake: () => void): () => void {
    visibleCards.add(shake);
    ensureTicker();
    return () => {
        visibleCards.delete(shake);
        if (visibleCards.size === 0) stopTicker();
    };
}
