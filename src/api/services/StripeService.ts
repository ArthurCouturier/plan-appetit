import { CartItem } from '../interfaces/stripe/CartItem';
import { Product } from '../interfaces/stripe/Product'

export default class StripeService {

  static readonly PREMIUM_SUBSCRIPTION_MENSUAL = "premium_subscription_mensual"
  static readonly CREDIT_TWENTY_RECIPES = "credit_twenty_recipes"

  static async fetchProduct(productCode: string): Promise<Product> {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}/api/products/${productCode}`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error('Cannot fetch product');
    return await res.json(); // { code, name, description, prices: [{stripePriceId, currency, recurringInterval, unitAmount}] }
  }

  static async checkout(cart: CartItem[]) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}/api/checkout/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        items: cart,
        successUrl: window.location.origin + '/recettes',
        cancelUrl: window.location.origin + '/cancel'
      })
    });
    if (!res.ok) throw new Error('Checkout failed');
    const data = await res.json();
    window.location.href = data.url;
  }

  // Après ça me renvoie sur
  // http://localhost:5173/success?session_id=cs_test_a17FLHGXipWXBDya1OEDb1EO7hrHt7TVmDwjX1cZYZr77LwtSoiR3zO3q6
}