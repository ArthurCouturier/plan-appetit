import { IAPProduct, IAPIntroductoryPrice } from '../api/services/IAPService';
import { Product } from '../api/interfaces/stripe/Product';

export function getPrice(iap: IAPProduct | null, stripe: Product | null): number | null {
    if (iap) return iap.price;
    if (stripe?.prices?.[0]) return stripe.prices[0].unitAmount / 100;
    return null;
}

export function formatPrice(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

export function getFormattedPrice(iap: IAPProduct | null, stripe: Product | null): string | null {
    if (iap) return iap.priceString;
    const price = getPrice(null, stripe);
    if (price !== null) return formatPrice(price);
    return null;
}

export function getCurrency(iap: IAPProduct | null, stripe: Product | null): string {
    if (iap) return iap.currencyCode;
    if (stripe?.prices?.[0]) return stripe.prices[0].currency;
    return 'EUR';
}

export function monthlyEquivalent(yearlyPrice: number): number {
    return yearlyPrice / 12;
}

export function discountPercent(fullPrice: number, discountedPrice: number): number {
    return Math.round((1 - discountedPrice / fullPrice) * 100);
}

export function pricePerRecipe(packPrice: number, recipeCount: number): number {
    return packPrice / recipeCount;
}

/** Returns true if the IAP product has a free trial introductory offer */
export function hasFreeTrial(iap: IAPProduct | null): boolean {
    return iap?.introductoryPrice?.paymentMode === 2;
}

/** Format a trial period into a French string like "7 jours", "1 mois" */
export function formatTrialPeriod(intro: IAPIntroductoryPrice): string {
    const n = intro.periodNumberOfUnits;
    switch (intro.periodUnit) {
        case 0: return `${n} jour${n > 1 ? 's' : ''}`;
        case 1: return `${n * 7} jour${n * 7 > 1 ? 's' : ''}`;
        case 2: return `${n} mois`;
        case 3: return `${n} an${n > 1 ? 's' : ''}`;
        default: return `${n} jour${n > 1 ? 's' : ''}`;
    }
}

/** Get the trial text for a product, e.g. "7 jours gratuits" or null */
export function getTrialText(iap: IAPProduct | null): string | null {
    if (!hasFreeTrial(iap) || !iap?.introductoryPrice) return null;
    return `${formatTrialPeriod(iap.introductoryPrice)} gratuit${iap.introductoryPrice.periodUnit === 1 || iap.introductoryPrice.periodUnit === 0 ? 's' : ''}`;
}
