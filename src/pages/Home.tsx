import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { 
  SparklesIcon, 
  ClockIcon, 
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  LightBulbIcon,
  ChevronDownIcon
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

  const faqs = [
    {
      question: "Comment fonctionnent les 3 recettes gratuites ?",
      answer: "Dès votre inscription, vous recevez 3 crédits gratuits pour générer vos premières recettes personnalisées. Aucune carte bancaire requise !"
    },
    {
      question: "L'import Instagram est-il déjà disponible ?",
      answer: "Cette fonctionnalité révolutionnaire arrive très bientôt ! Les abonnés Premium y auront accès en priorité."
    },
    {
      question: "Quelle est la différence avec la version Premium ?",
      answer: "La version gratuite offre 3 générations. Premium débloque des générations illimitées, le futur import Instagram, et l'accès prioritaire aux nouveautés."
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
      title: "Inscrivez-vous gratuitement",
      description: "3 générations offertes"
    },
    {
      number: "2",
      title: "Configurez vos préférences",
      description: "Contraintes & ingrédients"
    },
    {
      number: "3",
      title: "Générez instantanément",
      description: "Recette unique par IA"
    }
  ];


  return (
    <div className="min-h-screen bg-bg-color">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-cout-purple pt-20 pb-24 px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-cout-yellow rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cout-yellow/20 backdrop-blur-sm rounded-full border border-cout-yellow/30 mb-8">
              <PhotoIcon className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Bientôt : Import Instagram ✨</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Générez des recettes
              <br />
              <span className="text-cout-yellow">
                personnalisées par IA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              <strong className="text-cout-yellow">3 recettes gratuites</strong> pour découvrir la puissance de l'IA culinaire.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/login')}
                className="group px-10 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <SparklesSolid className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Commencer gratuitement
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 bg-primary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-cout-base/30 -z-10"></div>
                )}

                <div className="bg-secondary p-6 rounded-xl border-2 border-cout-base hover:shadow-lg transition-all duration-300 h-full">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-cout-base rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-4 bg-bg-color">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Pourquoi Plan'Appétit ?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Une IA qui comprend vos besoins culinaires
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-primary p-6 rounded-xl border border-border-color hover:border-cout-base hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-cout-base mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* PREMIUM TEASER */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto">
          <div className="bg-cout-base p-8 md:p-10 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cout-yellow/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Passez Premium pour plus
              </h2>
              <p className="text-base text-white/90 mb-6 max-w-xl">
                Générations illimitées, import Instagram (bientôt), et accès prioritaire.
              </p>

              <button
                onClick={() => navigate('/premium')}
                className="px-6 py-3 bg-cout-yellow text-cout-purple font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg"
              >
                Découvrir Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 px-4 bg-bg-color">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-primary rounded-lg border border-border-color overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 hover:bg-secondary transition-colors"
                >
                  <span className="font-semibold text-text-primary text-base">{faq.question}</span>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-cout-base transition-transform duration-300 flex-shrink-0 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="px-5 pb-4 text-text-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-4 bg-cout-purple">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Commencez gratuitement
          </h2>
          <p className="text-base md:text-lg text-white/90 mb-8">
            3 recettes offertes pour découvrir Plan'Appétit
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
          >
            <SparklesSolid className="w-5 h-5" />
            S'inscrire gratuitement
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-cout-purple text-white/70 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Plan'Appétit</h3>
              <p className="text-sm">
                L'IA au service de votre cuisine
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Liens</h4>
              <ul className="space-y-1 text-sm">
                <li><button onClick={() => navigate('/premium')} className="hover:text-cout-yellow transition-colors">Premium</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-cout-yellow transition-colors">Se connecter</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Légal</h4>
              <ul className="space-y-1 text-sm">
                <li><a href="#privacy" className="hover:text-cout-yellow transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 text-center text-xs">
            <p>&copy; 2025 Plan'Appétit</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
