import { Button } from "@material-tailwind/react"
import { useEffect, useState } from "react"
import StripeService from "../api/services/StripeService";
import { Product } from "../api/interfaces/stripe/Product";
import { CartItem } from "../api/interfaces/stripe/CartItem";

export default function BecomePremium() {

  const [premiumProduct, setPremiumProduct] = useState<Product | null>(null);
  const [credit20Product, setCredit20Product] = useState<Product | null>(null);

  useEffect(() => {
    StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_MENSUAL)
      .then(product => setPremiumProduct(product));
    StripeService.fetchProduct(StripeService.CREDIT_TWENTY_RECIPES)
      .then(product => setCredit20Product(product));
  }, [])

  const handleClickPassPremium = () => {
    if (!premiumProduct) {
      StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_MENSUAL)
        .then(product => setPremiumProduct(product));
    }
    const cart: CartItem = {
      priceId: premiumProduct!.prices[0].stripePriceId,
      quantity: 1
    }
    StripeService.checkout([cart])
  }

  const handleClickCredit20 = () => {
    if (!premiumProduct) {
      StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_MENSUAL)
        .then(product => setPremiumProduct(product));
    }
    const cart: CartItem = {
      priceId: credit20Product!.prices[0].stripePriceId,
      quantity: 1
    }
    StripeService.checkout([cart])
  }

  return (
    <div>
      Become Premium!
      <Button className='mt-4' variant="outlined" color="yellow" onClick={handleClickPassPremium} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        Devenir Premium
      </Button>
      {premiumProduct?.code}
      <Button className='mt-4' variant="outlined" color="yellow" onClick={handleClickCredit20} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        Créditer 20 recettes
      </Button>
      {premiumProduct?.code}
    </div>
  )
}
