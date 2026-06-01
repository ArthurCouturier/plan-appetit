import { useEffect, useState } from "react"
import IAPService from "../api/services/IAPService";
import usePaywallProducts from "../api/hooks/usePaywallProducts";
import { TrackingService } from "../api/tracking/TrackingService";
import PaywallContent from "../components/paywall/PaywallContent";
import { usePostHog } from "../contexts/PostHogContext";

const HAS_SEEN_KEY = 'paywall_has_seen_before';

const FAQS = [
  {
    question: "Et si je veux annuler ?",
    answer: "En quelques secondes depuis ton compte, ou via l'App Store sur iPhone. Tant que tu annules avant la fin des 7 jours, rien n'est débité.",
  },
  {
    question: "Ça coûte combien, et à partir de quand ?",
    answer: "Le prix exact est affiché juste au-dessus, avant toute confirmation. Pendant 7 jours : 0 €. Tu n'es débité qu'ensuite, et seulement si tu continues.",
  },
  {
    question: "Je m'engage sur la durée ?",
    answer: "Aucun engagement. Tu arrêtes quand tu veux et tu gardes l'accès jusqu'à la fin de la période déjà entamée.",
  },
  {
    question: "Si j'arrête, je perds mes recettes ?",
    answer: "Jamais. Tes recettes, ton historique et tes listes restent à toi, accessibles même sans premium.",
  },
  {
    question: "Pourquoi pas juste ChatGPT ou Marmiton ?",
    answer: "Plan Appétit connaît ton frigo, ton budget, ton équipement et tes derniers repas, et associe les saveurs entre elles pour des recettes vraiment qualitatives. Plus sur mesure et plus innovant que Marmiton ou ChatGPT : une recette pensée pour toi, pas une recette générique à adapter.",
  },
];

export default function BecomePremium() {
  const products = usePaywallProducts();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { trackEvent } = usePostHog();

  useEffect(() => {
    TrackingService.logCreditPackViewed('premium_page');
    TrackingService.logViewContent('premium_page');

    const hasSeenBefore = localStorage.getItem(HAS_SEEN_KEY) === 'true';
    localStorage.setItem(HAS_SEEN_KEY, 'true');

    trackEvent('paywall_viewed', {
      source: 'premium_page',
      trigger: 'premium_page',
      plan_default: 'yearly_trial',
      has_seen_paywall_before: hasSeenBefore,
    });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{
      background: 'linear-gradient(165deg, #f17c63 0%, #e8694f 25%, #f2a96f 55%, #eda391 80%, #edc79e 100%)',
    }}>
      <section
        className="relative px-4 pb-12"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}
      >
        <div className="max-w-md mx-auto text-center">
          <h1 style={{
            color: 'white',
            fontSize: 32,
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
          }}>
            7 jours offerts. 0 € aujourd'hui.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 16,
            margin: '8px 0 0',
            fontWeight: 400,
            lineHeight: 1.4,
          }}>
            Tu décides après. Pas de mauvaise surprise.
          </p>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          <PaywallContent products={products} variant="page" trigger="premium_page" />

          {products.isIAPAvailable && IAPService.isIOS() && (
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 10,
              lineHeight: 1.5,
              textAlign: 'center',
              marginTop: 16,
            }}>
              Abonnement à renouvellement automatique. Le paiement sera débité de votre compte
              Apple ID lors de la confirmation de l'achat. L'abonnement se renouvelle automatiquement
              sauf annulation au moins 24 heures avant la fin de la période en cours. Vous pouvez
              gérer et annuler vos abonnements dans les réglages de votre compte App Store.
            </p>
          )}

          {products.isIAPAvailable && (
            <div className="text-center mt-4">
              <button
                onClick={async () => {
                  const restored = await IAPService.restorePurchases();
                  if (restored) window.location.reload();
                }}
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Restaurer mes achats
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-12 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
            Questions fréquentes
          </h2>
          <p className="text-sm text-text-secondary text-center mb-8">
            Tout ce que tu dois savoir avant d'activer
          </p>

          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-secondary rounded-xl border border-border-color overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center gap-3 hover:bg-thirdary/20 transition-colors"
                >
                  <span className="font-semibold text-text-primary text-sm">{faq.question}</span>
                  <span className={`text-cout-base text-lg transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                  <p className="px-5 pb-4 text-text-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
