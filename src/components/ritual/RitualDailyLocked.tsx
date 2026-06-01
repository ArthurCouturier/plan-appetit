import { Link } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { lightHaptic } from "../../haptics/light";

const BENEFITS: { emoji: string; title: string; text: string }[] = [
    {
        emoji: "🍽️",
        title: "Tes recettes du jour, midi et soir",
        text: "Plus jamais la question « Qu'est-ce qu'on mange? ». On analyse ton profil, on crée une recette équilibrée et de saison en fonction de tes habitudes.",
    },
    {
        emoji: "💤",
        title: "Mode flemme",
        text: "Flemme de cuisiner ce soir? Une recette -10 mins calée sur tes habitudes, quand même équilibrée, en un clic.",
    },
    {
        emoji: "📈",
        title: "Toujours plus sur mesure",
        text: "Plus tu remplis ton journal, plus on affine tes repas selon ce que tu aimes et ton rythme. Remplis-le le plus souvent possible pour le booster",
    },
];

export default function RitualDailyLocked() {
    return (
        <div className="rounded-3xl bg-secondary border border-cout-yellow/40 p-5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cout-yellow/20 mb-3">
                <SparklesIcon className="w-6 h-6 text-cout-purple" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2.5">
                Débloque tes recettes du jour
            </h2>

            <ul className="space-y-3 text-left mb-6">
                {BENEFITS.map((b) => (
                    <li
                        key={b.title}
                        className="flex gap-3 items-start bg-bg-color/60 rounded-2xl p-3"
                    >
                        <span className="text-2xl leading-none">{b.emoji}</span>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">{b.title}</p>
                            <p className="text-xs text-text-secondary mt-0.5">{b.text}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <Link
                to="/premium"
                onClick={() => lightHaptic()}
                className="w-full px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold text-sm flex items-center justify-center gap-2"
            >
                <SparklesIcon className="w-4 h-4" />
                Essayer gratuitement 7 jours
            </Link>
            <p className="text-[11px] text-text-secondary mt-2">
                Sans engagement. Annulable en 1 clic avant la fin de l'essai.
            </p>
        </div>
    );
}
