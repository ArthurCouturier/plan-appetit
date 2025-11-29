import { useNavigate } from "react-router-dom";
import { SparklesIcon, FolderIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import LogoButton from "../components/buttons/LogoButton";
import Footer from "../components/global/Footer";

export default function Presentation() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-color flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple pt-12 pb-24 px-4">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-cout-yellow rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex justify-center mb-8 md:mb-12 mt-4 md:mt-8 scale-[2] lg:scale-[2.5] p-4">
                        <LogoButton clickable={false} size="2xl" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Ton meilleur assistant en cuisine.<br />
                            <span className="text-cout-yellow">Maintenant. Gratuitement.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Génère des recettes uniques avec l'IA, importe celles que tu trouves sur Instagram,
                            et garde tout bien rangé dans tes collections.
                        </p>

                        <button
                            onClick={() => navigate('/sandbox')}
                            className="group px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                        >
                            <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            Générer ma première recette
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <p className="text-white/60 text-sm mt-4">
                            Gratuit, sans inscription
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature 1: Génération IA */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 bg-cout-base/10 text-cout-base px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                <SparklesIcon className="w-4 h-4" />
                                Génération IA
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                                Décris ce que tu veux manger, l'IA s'occupe du reste
                            </h2>
                            <p className="text-text-secondary text-lg mb-6">
                                Plus besoin de chercher pendant des heures. Dis-nous juste ce qui te fait envie :
                                "un plat réconfortant avec des légumes d'hiver" ou "un dessert rapide sans gluten".
                                Notre IA génère une recette complète en quelques secondes.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-cout-yellow/20 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-cout-yellow rounded-full"></span>
                                    </span>
                                    Recettes personnalisées selon tes envies
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-cout-yellow/20 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-cout-yellow rounded-full"></span>
                                    </span>
                                    Ingrédients, étapes et temps de préparation inclus
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-cout-yellow/20 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-cout-yellow rounded-full"></span>
                                    </span>
                                    Génère plusieurs recettes d'un coup
                                </li>
                            </ul>
                            <button
                                onClick={() => navigate('/sandbox')}
                                className="group px-6 py-3 bg-cout-base text-white font-semibold rounded-xl hover:bg-cout-purple transition-all duration-300 flex items-center gap-2"
                            >
                                Essayer la génération
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="order-1 md:order-2">
                            {/* Placeholder visuel */}
                            <div className="bg-gradient-to-br from-cout-base/20 to-cout-purple/20 rounded-2xl p-8 border-2 border-dashed border-cout-base/30 aspect-square flex items-center justify-center">
                                <div className="text-center">
                                    <SparklesIcon className="w-16 h-16 text-cout-base/50 mx-auto mb-4" />
                                    <p className="text-text-secondary/50 text-sm">Visuel génération IA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Import Instagram */}
            <section className="py-16 md:py-24 px-4 bg-secondary">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div>
                            {/* Placeholder visuel */}
                            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-8 border-2 border-dashed border-pink-500/30 aspect-square flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="w-16 h-16 text-pink-500/50 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                    <p className="text-text-secondary/50 text-sm">Visuel import Instagram</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                                </svg>
                                Import Instagram
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                                Cette recette sur Insta te fait envie ? Importe-la !
                            </h2>
                            <p className="text-text-secondary text-lg mb-6">
                                Tu scrolles sur Instagram et tu tombes sur une recette qui a l'air incroyable ?
                                Colle simplement le lien du post et on transforme ça en fiche recette complète.
                                Fini les screenshots qu'on ne retrouve jamais.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                    </span>
                                    Colle le lien, c'est tout
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                    </span>
                                    L'IA extrait les ingrédients et les étapes
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                    </span>
                                    Sauvegarde la recette dans tes collections
                                </li>
                            </ul>
                            <button
                                onClick={() => navigate('/instagram')}
                                className="group px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2"
                            >
                                Importer une recette
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Collections */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 bg-cout-yellow/20 text-cout-purple px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                <FolderIcon className="w-4 h-4" />
                                Collections
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                                Organise tes recettes comme tu veux
                            </h2>
                            <p className="text-text-secondary text-lg mb-6">
                                Crée des collections pour ranger tes recettes : "Repas rapides", "Meal prep du dimanche",
                                "Recettes de mamie"... Tout est à portée de main quand tu en as besoin.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-cout-yellow/30 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-cout-yellow rounded-full"></span>
                                    </span>
                                    Collections personnalisées illimitées
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-cout-yellow/30 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-cout-yellow rounded-full"></span>
                                    </span>
                                    Retrouve tes recettes en un clic
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <span className="w-6 h-6 bg-cout-yellow/30 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-cout-yellow rounded-full"></span>
                                    </span>
                                    Accessible sur tous tes appareils
                                </li>
                            </ul>
                            <button
                                onClick={() => navigate('/sandbox')}
                                className="group px-6 py-3 bg-cout-yellow text-cout-purple font-semibold rounded-xl hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2"
                            >
                                Découvrir
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="order-1 md:order-2">
                            {/* Placeholder visuel */}
                            <div className="bg-gradient-to-br from-cout-yellow/20 to-orange-500/20 rounded-2xl p-8 border-2 border-dashed border-cout-yellow/30 aspect-square flex items-center justify-center">
                                <div className="text-center">
                                    <FolderIcon className="w-16 h-16 text-cout-yellow/50 mx-auto mb-4" />
                                    <p className="text-text-secondary/50 text-sm">Visuel collections</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Prêt à cuisiner autrement ?
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-8">
                        Rejoins des centaines de passionnés qui simplifient leur quotidien en cuisine.
                        C'est gratuit pour commencer !
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/sandbox')}
                            className="group px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-2xl hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 justify-center"
                        >
                            <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            Commencer gratuitement
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                        >
                            J'ai déjà un compte
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
