import { IAPProduct } from '../api/services/IAPService';
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
