export type Product = {
  id: string
  code: string
  name: string
  description?: string
  imageUrl?: string
  active: boolean
  stripeProductId?: string
  prices: {
    id: string;
    recurringInterval?: string
    stripePriceId: string;
    unitAmount: number;
    currency: string
  }[]
};
