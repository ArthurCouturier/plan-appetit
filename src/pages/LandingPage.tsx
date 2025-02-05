import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-bg-color flex flex-col">
            <header className="bg-cout-purple text-primary">
                <div className="container mx-auto flex justify-between items-center p-6">
                    <h1 className="text-3xl font-bold">Plan'Appétit</h1>
                    <nav className="space-x-6">
                        <Link
                            to="/recettes"
                            className="font-bold hover:text-cout-yellow transition duration-200"
                        >
                            Livre des Recettes
                        </Link>
                        <Link
                            to="/premium"
                            className="font-bold hover:text-cout-yellow transition duration-200"
                        >
                            Abonnement Premium
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto flex-1 px-4 py-16">
                <section className="text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-text-primary mb-4">
                        Créez et gérez votre restaurant avec Plan'Appétit
                    </h2>
                    <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                        Plan'Appétit vous permet de générer et personnaliser automatiquement
                        vos recettes selon la saison, la localisation et votre budget. Que vous
                        soyez restaurateur ou passionné de cuisine, découvrez une nouvelle façon
                        d'innover en cuisine.
                    </p>
                    <Link to="/recettes">
                        <button className="bg-cout-yellow text-text-primary font-bold py-4 px-8 rounded-full shadow-lg hover:opacity-90 transform hover:scale-105 transition duration-200">
                            Découvrez nos recettes
                        </button>
                    </Link>
                </section>

                <section className="mb-16">
                    <h3 className="text-4xl font-bold text-center text-text-primary mb-12">
                        Nos Fonctionnalités
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-primary rounded-lg shadow-md p-6">
                            <h4 className="text-2xl font-bold text-text-primary mb-2">
                                Génération Automatique
                            </h4>
                            <p className="text-text-secondary">
                                Profitez d'une génération de recettes adaptée à votre localisation et
                                à la saison, 100% gratuite.
                            </p>
                        </div>
                        <div className="bg-primary rounded-lg shadow-md p-6">
                            <h4 className="text-2xl font-bold text-text-primary mb-2">
                                Personnalisation Avancée
                            </h4>
                            <p className="text-text-secondary">
                                Configurez précisément vos critères : ingrédients, budget, version
                                végétarienne, et plus encore.
                            </p>
                        </div>
                        <div className="bg-primary rounded-lg shadow-md p-6">
                            <h4 className="text-2xl font-bold text-text-primary mb-2">
                                Gestion & Archivage
                            </h4>
                            <p className="text-text-secondary">
                                Sauvegardez, modifiez et consultez l'historique de vos recettes pour
                                toujours retrouver l'inspiration.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-secondary rounded-lg p-10 text-center mb-16">
                    <h3 className="text-4xl font-bold text-text-primary mb-4">
                        Passez en Premium
                    </h3>
                    <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
                        Débloquez des fonctionnalités exclusives pour aller encore plus loin :
                    </p>
                    <ul className="text-left max-w-xl mx-auto space-y-4 text-text-secondary">
                        <li className="flex items-center">
                            <span className="mr-2 text-cout-yellow text-2xl">★</span>
                            <span>
                                Génération illimitée de recettes (au-delà des 3 gratuites)
                            </span>
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2 text-cout-yellow text-2xl">★</span>
                            <span>Accès à des statistiques détaillées sur vos recettes</span>
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2 text-cout-yellow text-2xl">★</span>
                            <span>Support prioritaire et mises à jour exclusives</span>
                        </li>
                    </ul>
                    <Link to="/premium">
                        <button className="mt-8 bg-cout-purple text-gray-200 font-bold py-4 px-8 rounded-full shadow-lg hover:opacity-90 transform hover:scale-105 transition duration-200">
                            Adhérez maintenant
                        </button>
                    </Link>
                </section>

                <section className="text-center">
                    <h3 className="text-3xl font-bold text-text-primary mb-4">
                        Prêt à révolutionner votre cuisine ?
                    </h3>
                    <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                        Rejoignez dès aujourd'hui les restaurateurs et passionnés qui innovent
                        grâce à Plan'Appétit et faites passer votre expérience culinaire au niveau
                        supérieur.
                    </p>
                    <Link to="/recettes">
                        <button className="bg-cout-yellow text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg hover:opacity-90 transform hover:scale-105 transition duration-200">
                            Commencez maintenant
                        </button>
                    </Link>
                </section>
            </main>

            <footer className="bg-secondary text-text-secondary py-6">
                <div className="container mx-auto text-center">
                    <p>&copy; {new Date().getFullYear()} Plan'Appétit. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}
