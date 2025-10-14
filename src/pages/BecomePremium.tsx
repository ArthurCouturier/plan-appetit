import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/solid";
import StripeService from "../api/services/StripeService";
import { Product } from "../api/interfaces/stripe/Product";
import { CartItem } from "../api/interfaces/stripe/CartItem";
import useAuth from "../api/hooks/useAuth";

export default function BecomePremium() {
  const navigate = useNavigate();
  const [premiumProduct, setPremiumProduct] = useState<Product | null>(null);
  const [credit20Product, setCredit20Product] = useState<Product | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const user = useAuth().user;

  useEffect(() => {
    StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_MENSUAL)
      .then(product => setPremiumProduct(product));
    StripeService.fetchProduct(StripeService.CREDIT_TWENTY_RECIPES)
      .then(product => setCredit20Product(product));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubscribe = () => {
    if (!premiumProduct) return;
    const cart: CartItem = {
      priceId: premiumProduct.prices[0].stripePriceId,
      quantity: 1
    }
    user && StripeService.checkout([cart], user)
  }

  const handleBuyCredits = () => {
    if (!credit20Product) return;
    const cart: CartItem = {
      priceId: credit20Product.prices[0].stripePriceId,
      quantity: 1
    }
    user && StripeService.checkout([cart], user)
  }

  const faqs = [
    {
      question: "Quelle est la différence entre la version gratuite et Premium ?",
      answer: "La version gratuite vous permet de générer un nombre limité de recettes par mois. Avec Premium, vous bénéficiez de générations illimitées, d'options de personnalisation avancées, et bientôt, de l'import direct depuis Instagram."
    },
    {
      question: "L'import Instagram est-il déjà disponible ?",
      answer: "Nous finalisons actuellement cette fonctionnalité révolutionnaire. Les abonnés Premium y auront accès en priorité dès son lancement dans les prochaines semaines."
    },
    {
      question: "Comment fonctionne la facturation ?",
      answer: "Nous utilisons Stripe pour des paiements 100% sécurisés. Votre abonnement se renouvelle automatiquement, mais vous pouvez annuler à tout moment depuis votre profil."
    },
    {
      question: "Puis-je annuler mon abonnement ?",
      answer: "Absolument. Vous gardez l'accès Premium jusqu'à la fin de votre période payée, sans frais cachés."
    },
    {
      question: "Les crédits de recettes expirent-ils ?",
      answer: "Non, vos crédits achetés restent valables indéfiniment et s'ajoutent à votre compte."
    },
    {
      question: "Puis-je essayer Premium avant de m'engager ?",
      answer: "Nous proposons des packs de crédits si vous souhaitez tester les fonctionnalités avancées avant de souscrire à un abonnement."
    }
  ];

  const features = [
    {
      icon: "🚀",
      title: "Générations illimitées",
      description: "Créez autant de recettes que vous le souhaitez, sans aucune restriction."
    },
    {
      icon: "📸",
      title: "Import Instagram (Bientôt)",
      description: "Importez directement vos recettes favorites depuis Instagram en un clic."
    },
    {
      icon: "🎯",
      title: "Personnalisation avancée",
      description: "Contraintes alimentaires, préférences, ingrédients disponibles : tout est personnalisable."
    },
    {
      icon: "⚡",
      title: "Génération rapide",
      description: "Recevez vos recettes en quelques secondes grâce à notre IA optimisée."
    },
    {
      icon: "💾",
      title: "Sauvegarde illimitée",
      description: "Stockez toutes vos recettes dans votre bibliothèque personnelle."
    },
    {
      icon: "🔄",
      title: "Mises à jour continues",
      description: "Accédez en priorité aux nouvelles fonctionnalités et améliorations."
    }
  ];

  return (
    <div className="min-h-screen bg-bg-color overflow-x-hidden">
      {/* Home Button - Hidden on mobile */}
      {!isMobile && (
        <button
          onClick={() => navigate("/")}
          className="fixed top-6 left-6 z-50 p-3 bg-primary hover:bg-cout-purple/20 text-cout-base rounded-lg shadow-lg border border-border-color transition-all duration-200 hover:scale-105"
          title="Retour à l'accueil"
        >
          <HomeIcon className="w-6 h-6" />
        </button>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cout-base via-cout-purple to-cout-purple py-20 px-4 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cout-yellow rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-cout-yellow/20 backdrop-blur-sm rounded-full border border-cout-yellow/30">
            <span className="text-white font-medium text-sm md:text-base">✨ Bientôt : Import direct depuis Instagram</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Libérez votre créativité
            <br />
            <span className="text-cout-yellow">culinaire sans limites</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Passez Premium et générez des recettes illimitées, personnalisées selon vos contraintes.
            Bientôt, importez vos recettes Instagram préférées en un seul clic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-lg text-lg shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 hover:shadow-cout-yellow/50"
            >
              Devenir Premium
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Découvrir les avantages
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="text-center">
              <div className="text-3xl font-bold text-cout-yellow">Illimité</div>
              <div className="text-sm">Recettes générées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cout-yellow">24/7</div>
              <div className="text-sm">Accès disponible</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cout-yellow">100%</div>
              <div className="text-sm">Personnalisable</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Des fonctionnalités pensées pour les professionnels et passionnés de cuisine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-secondary p-8 rounded-2xl border border-border-color hover:border-cout-base transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-bg-color">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-text-secondary">
              Trois étapes pour transformer votre expérience culinaire
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {[
              { step: "1", title: "Choisissez votre formule", desc: "Sélectionnez l'abonnement Premium ou un pack de crédits" },
              { step: "2", title: "Configurez vos préférences", desc: "Indiquez vos contraintes alimentaires et vos ingrédients disponibles" },
              { step: "3", title: "Générez sans limite", desc: "Créez autant de recettes que vous voulez, quand vous voulez" }
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-cout-base to-transparent"></div>
                )}
                <div className="relative bg-primary p-8 rounded-2xl border-2 border-cout-base shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-cout-base rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mt-4 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Choisissez votre formule
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Des options flexibles adaptées à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Premium Card */}
            <div className="relative bg-gradient-to-br from-cout-base to-cout-purple p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="absolute -top-4 -right-4 bg-cout-yellow text-cout-purple px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                ⭐ Recommandé
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-4">
                  {premiumProduct ? `${(premiumProduct.prices[0].unitAmount).toFixed(2)}€` : '...'}
                  <span className="text-lg font-normal">/mois</span>
                </div>
                <p className="text-white/90 mb-6">Accès illimité à toutes les fonctionnalités</p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Générations illimitées",
                    "Personnalisation avancée",
                    "Sauvegarde illimitée",
                    "Import Instagram (bientôt)",
                    "Accès prioritaire aux nouveautés",
                    "Support premium"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cout-yellow mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe()}
                  className="w-full py-4 bg-cout-yellow text-cout-purple font-bold rounded-lg text-lg hover:bg-yellow-400 transition-all duration-300 shadow-xl"
                  disabled={!premiumProduct}
                >
                  S'abonner maintenant
                </button>
              </div>
            </div>

            {/* Credits Card */}
            <div className="bg-secondary p-8 rounded-2xl border-2 border-border-color shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Pack Crédits</h3>
              <div className="text-4xl font-bold text-text-primary mb-4">
                {credit20Product ? `${(credit20Product.prices[0].unitAmount).toFixed(2)}€` : '...'}
              </div>
              <p className="text-text-secondary mb-6">20 générations de recettes</p>

              <ul className="space-y-3 mb-8">
                {[
                  "20 crédits de génération",
                  "Valables à vie",
                  "Personnalisation standard",
                  "Sauvegarde limitée",
                  "Parfait pour essayer"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary">
                    <span className="text-cout-base mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleBuyCredits}
                className="w-full py-4 bg-cout-base text-white font-bold rounded-lg text-lg hover:bg-indigo-500 transition-all duration-300"
                disabled={!credit20Product}
              >
                Acheter des crédits
              </button>
            </div>
          </div>

          <p className="text-center text-text-secondary mt-8 text-sm">
            💳 Paiement 100% sécurisé par Stripe • Annulation à tout moment
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 bg-bg-color">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-text-secondary">
              Rejoignez des centaines de professionnels et passionnés
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Marie Laurent", role: "Chef de cuisine", text: "Plan'Appétit a transformé ma façon de créer mes menus. Je gagne un temps précieux chaque semaine !" },
              { name: "Thomas Dubois", role: "Restaurateur", text: "La personnalisation avancée est un game-changer. Mes clients adorent la variété des plats proposés." },
              { name: "Sophie Martin", role: "Food blogger", text: "J'attends avec impatience la fonction Instagram. Ça va révolutionner ma création de contenu !" }
            ].map((testimonial, i) => (
              <div key={i} className="bg-primary p-6 rounded-xl border border-border-color shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-cout-yellow">⭐</span>
                  ))}
                </div>
                <p className="text-text-secondary mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-text-primary">{testimonial.name}</div>
                  <div className="text-sm text-text-secondary">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-text-secondary">
              Tout ce que vous devez savoir sur Premium
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-secondary rounded-xl border border-border-color overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-thirdary/20 transition-colors"
                >
                  <span className="font-semibold text-text-primary">{faq.question}</span>
                  <span className={`text-cout-base text-2xl transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                  <p className="px-6 pb-5 text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Prêt à libérer votre créativité culinaire ?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Rejoignez Plan'Appétit Premium aujourd'hui et transformez votre façon de créer des recettes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleSubscribe()}
              className="px-10 py-5 bg-cout-yellow text-cout-purple font-bold rounded-lg text-xl shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300"
              disabled={!premiumProduct}
            >
              Devenir Premium maintenant
            </button>
            <button
              onClick={handleBuyCredits}
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg text-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              disabled={!credit20Product}
            >
              Ou acheter des crédits
            </button>
          </div>
          <p className="mt-8 text-white/70 text-sm">
            Aucune carte bancaire requise pour l'essai • Annulation en un clic
          </p>
        </div>
      </section>
    </div>
  )
}
