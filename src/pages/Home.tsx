import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { 
  SparklesIcon, 
  ClockIcon, 
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolid } from "@heroicons/react/24/solid";
import useAuth from "../api/hooks/useAuth";

export default function Home() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { user } = useAuth();

  // Si l'utilisateur est connecté, rediriger vers /recettes
  if (user) {
    return <Navigate to="/recettes" replace />;
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      question: "Comment fonctionnent les 3 recettes gratuites ?",
      answer: "Dès votre inscription, vous recevez 3 crédits gratuits pour générer vos premières recettes personnalisées. Aucune carte bancaire requise !"
    },
    {
      question: "Puis-je vraiment personnaliser mes recettes ?",
      answer: "Absolument ! Indiquez vos ingrédients disponibles, vos contraintes alimentaires (vegan, sans gluten, etc.), le nombre de personnes, et notre IA génère une recette unique adaptée à vos besoins."
    },
    {
      question: "L'import Instagram est-il déjà disponible ?",
      answer: "Cette fonctionnalité révolutionnaire arrive très bientôt ! Les abonnés Premium y auront accès en priorité pour importer leurs recettes Instagram préférées en un clic."
    },
    {
      question: "Quelle est la différence avec la version Premium ?",
      answer: "La version gratuite offre 3 générations. Premium débloque des générations illimitées, des options avancées, le futur import Instagram, et l'accès prioritaire aux nouveautés."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Nous utilisons Firebase Authentication et des protocoles de sécurité bancaires (Stripe). Vos données personnelles sont chiffrées et jamais partagées."
    },
    {
      question: "Puis-je annuler mon abonnement Premium à tout moment ?",
      answer: "Oui, vous pouvez annuler quand vous voulez depuis votre profil. Vous gardez l'accès jusqu'à la fin de votre période payée."
    }
  ];

  const features = [
    {
      icon: <SparklesIcon className="w-12 h-12" />,
      title: "IA Culinaire Avancée",
      description: "Notre intelligence artificielle génère des recettes uniques adaptées à vos contraintes en quelques secondes."
    },
    {
      icon: <AdjustmentsHorizontalIcon className="w-12 h-12" />,
      title: "Personnalisation Totale",
      description: "Régimes alimentaires, allergies, ingrédients disponibles, nombre de personnes : tout est configurable."
    },
    {
      icon: <PhotoIcon className="w-12 h-12" />,
      title: "Import Instagram (Bientôt)",
      description: "Importez vos recettes Instagram favorites directement dans votre bibliothèque en un seul clic."
    },
    {
      icon: <ClockIcon className="w-12 h-12" />,
      title: "Gain de Temps Massif",
      description: "Fini les heures perdues à chercher des recettes. Obtenez des suggestions parfaites instantanément."
    },
    {
      icon: <HeartIcon className="w-12 h-12" />,
      title: "Bibliothèque Personnelle",
      description: "Sauvegardez, organisez et retrouvez facilement toutes vos recettes favorites au même endroit."
    },
    {
      icon: <LightBulbIcon className="w-12 h-12" />,
      title: "Inspiration Continue",
      description: "Ne manquez plus jamais d'idées. Générez de nouvelles recettes créatives chaque jour."
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Créez votre compte gratuit",
      description: "Inscrivez-vous en 30 secondes et recevez 3 générations gratuites"
    },
    {
      number: "2",
      title: "Configurez vos préférences",
      description: "Indiquez vos contraintes alimentaires et ingrédients disponibles"
    },
    {
      number: "3",
      title: "Générez votre recette",
      description: "Notre IA crée une recette unique et personnalisée instantanément"
    },
    {
      number: "4",
      title: "Cuisinez et savourez",
      description: "Suivez les étapes détaillées et régalez-vous !"
    }
  ];

  const testimonials = [
    {
      name: "Claire Dubois",
      role: "Chef de cuisine",
      image: "👩‍🍳",
      text: "Plan'Appétit a transformé ma façon de créer mes menus. Je génère des dizaines de variations en quelques minutes. Un outil indispensable !",
      rating: 5
    },
    {
      name: "Marc Fontaine",
      role: "Restaurateur",
      image: "👨‍💼",
      text: "La personnalisation est incroyable. Je peux adapter chaque recette aux allergies de mes clients en un clic. Magique !",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      role: "Food Blogger",
      image: "📸",
      text: "J'attends la fonction Instagram avec impatience ! L'app est déjà géniale pour organiser mes recettes. Bravo !",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-orange-50 pt-20 pb-32 px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-orange-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-amber-200 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200 shadow-sm mb-8 hover:scale-105 transition-transform duration-300">
              <PhotoIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Bientôt : Import direct depuis Instagram ✨</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Cuisinez comme un chef,
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                sans effort
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              L'IA qui génère des recettes personnalisées selon vos contraintes.
              <br />
              <strong className="text-emerald-700">3 recettes gratuites</strong> pour commencer votre aventure culinaire.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/login')}
                className="group px-8 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-lg shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <SparklesSolid className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Générer mes recettes gratuites
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-8 py-5 bg-white text-gray-700 font-semibold rounded-xl text-lg border-2 border-gray-200 hover:border-emerald-300 hover:bg-gray-50 transition-all duration-300"
              >
                Comment ça marche ?
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                <span>Gratuit pour commencer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                <span>Aucune carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                <span>3 générations offertes</span>
              </div>
            </div>
          </div>

          {/* Visual Demo Section */}
          <div className="max-w-5xl mx-auto mt-16">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 hover:shadow-emerald-200/50 transition-shadow duration-500">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-3">
                  <div className="text-5xl font-bold text-emerald-600">3</div>
                  <div className="text-gray-600 font-medium">Recettes gratuites</div>
                </div>
                <div className="space-y-3">
                  <div className="text-5xl font-bold text-emerald-600">30s</div>
                  <div className="text-gray-600 font-medium">Pour s'inscrire</div>
                </div>
                <div className="space-y-3">
                  <div className="text-5xl font-bold text-emerald-600">∞</div>
                  <div className="text-gray-600 font-medium">Possibilités culinaires</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple comme bonjour
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              4 étapes pour passer de l'inspiration à l'assiette
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Connector line (hidden on mobile, shown on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent -z-10"></div>
                )}

                <div className="bg-gradient-to-br from-white to-emerald-50 p-8 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 h-full">
                  {/* Number Badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <SparklesSolid className="w-5 h-5" />
              Commencer gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi Plan'Appétit ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une intelligence artificielle qui comprend vraiment vos besoins culinaires
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-emerald-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORYTELLING SECTION */}
      <section className="py-24 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            L'inspiration culinaire rencontre
            <br />
            l'intelligence artificielle
          </h2>
          <p className="text-xl md:text-2xl text-emerald-50 mb-8 leading-relaxed">
            Que vous soyez chef professionnel, restaurateur ou passionné de cuisine,
            <strong className="text-white"> Plan'Appétit révolutionne votre créativité</strong>.
            Plus de blocage créatif, plus de temps perdu : juste des recettes parfaites, instantanément.
          </p>
          <p className="text-lg text-emerald-100 mb-12">
            Et bientôt, importez vos recettes Instagram favorites en un clic.
            Parce que l'inspiration est partout, votre bibliothèque culinaire aussi.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-5 bg-white text-emerald-700 font-bold rounded-xl text-xl shadow-2xl hover:bg-emerald-50 transform hover:scale-105 transition-all duration-300"
          >
            Rejoindre Plan'Appétit
          </button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ils ont libéré leur créativité
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des centaines de professionnels et passionnés
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM TEASER */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm p-12 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-400/30 mb-6">
                <SparklesSolid className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">Version Premium</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Passez au niveau supérieur
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Générations illimitées, personnalisation avancée, import Instagram (bientôt),
                et accès prioritaire aux nouvelles fonctionnalités.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/premium')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-xl"
                >
                  Découvrir Premium
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Commencer gratuitement
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur Plan'Appétit
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                  <ChevronDownIcon 
                    className={`w-6 h-6 text-emerald-600 transition-transform duration-300 flex-shrink-0 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Prêt à révolutionner votre cuisine ?
          </h2>
          <p className="text-xl md:text-2xl text-emerald-50 mb-10 max-w-2xl mx-auto">
            Rejoignez Plan'Appétit aujourd'hui et générez vos 3 premières recettes gratuitement.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-12 py-6 bg-white text-emerald-700 font-bold rounded-xl text-xl shadow-2xl hover:bg-emerald-50 transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
          >
            <SparklesSolid className="w-6 h-6" />
            Générer mes recettes gratuites
          </button>
          <p className="mt-6 text-emerald-100 text-sm">
            ✓ Gratuit pour commencer • ✓ Aucune carte bancaire • ✓ 3 générations offertes
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Plan'Appétit</h3>
              <p className="text-sm leading-relaxed">
                L'intelligence artificielle au service de votre créativité culinaire.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">Comment ça marche</button></li>
                <li><button onClick={() => navigate('/premium')} className="hover:text-emerald-400 transition-colors">Premium</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-emerald-400 transition-colors">Se connecter</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#privacy" className="hover:text-emerald-400 transition-colors">Confidentialité</a></li>
                <li><a href="#terms" className="hover:text-emerald-400 transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Plan'Appétit. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
