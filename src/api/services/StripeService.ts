import { CartItem } from '../interfaces/stripe/CartItem';
import { Product } from '../interfaces/stripe/Product'
import UserInterface from '../interfaces/users/UserInterface';

export default class StripeService {

  static readonly PREMIUM_SUBSCRIPTION_MENSUAL = "premium_subscription_mensual"
  static readonly PREMIUM_SUBSCRIPTION_YEARLY = "premium_subscription_yearly"
  static readonly CREDIT_TWENTY_RECIPES = "credit_twenty_recipes"
  static readonly CREDIT_TEN_RECIPES = "credit_ten_recipes"

  private static getApiUrl(): string {
    const base = import.meta.env.VITE_API_URL;
    const port = import.meta.env.VITE_API_PORT;
    return port ? `${base}:${port}` : base;
  }

  static async fetchProduct(productCode: string): Promise<Product> {
    const res = await fetch(
      `${this.getApiUrl()}/api/products/${productCode}`
    );
    if (!res.ok) throw new Error('Cannot fetch product');
    return await res.json();
  }

  static async checkout(cart: CartItem[], user: UserInterface) {
    const res = await fetch(`${this.getApiUrl()}/api/checkout/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        email: user.email,
        token: user.token,
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