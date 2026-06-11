import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import Modal from "../modals/Modal";

export type RecipeGenerationType =
    | "sandbox"
    | "fridge"
    | "ingredient"
    | "batch"
    | "routine"
    | "instagram"
    | "photo"
    | "website"
    | "tiktok";

interface VariantConfig {
    title: string;
    subtitle: string;
    subtitleColor: string;
    icon: string;
    gradientFrom: string;
    gradientTo: string;
    route: string | null;
    details: ReactNode;
}

function DetailLead({ children }: { children: ReactNode }) {
    return (
        <p className="text-[15px] font-semibold leading-relaxed text-text-primary">
            {children}
        </p>
    );
}

function DetailP({ children }: { children: ReactNode }) {
    return (
        <p className="text-[14px] leading-relaxed text-text-secondary text-justify">
            {children}
        </p>
    );
}

function DetailHeading({ children }: { children: ReactNode }) {
    return (
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-cout-base">
            {children}
        </h4>
    );
}

function DetailList({ items }: { items: ReactNode[] }) {
    return (
        <ul className="space-y-1.5 text-left">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-text-secondary">
                    <span className="text-cout-base flex-shrink-0 font-bold">•</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

const VARIANTS: Record<RecipeGenerationType, VariantConfig> = {
    sandbox: {
        title: "Laisse moi faire!",
        subtitle: "Mets en place ton idée",
        subtitleColor: "#edc79e",
        icon: "/icons/IconStars.svg",
        gradientFrom: "#eda391",
        gradientTo: "#f17c63",
        route: "/recettes/generer/sandbox",
        details: (
            <>
                <DetailLead>
                    Tu as une envie en tête mais pas la recette? Décris-la laisse toi guider.
                </DetailLead>
                <DetailHeading>Comment ça marche</DetailHeading>
                <DetailList
                    items={[
                        "Tu écris ton idée en quelques mots: un plat, une ambiance, une contrainte.",
                        "On te pose quelques questions pour cerner ton envie.",
                        "On te fait également des propositions d'associations de saveurs grâce à notre banque d'ingrédients qui s'arrangent bien les uns les autres.",
                    ]}
                />
                <DetailP>
                    Tu gardes la main à tout moment: ajuste les couverts, le temps ou les
                    ingrédients, et régénère jusqu'à ce que ça te plaise vraiment.
                </DetailP>
            </>
        ),
    },
    fridge: {
        title: "Vide mon frigo!",
        subtitle: "Pour cuisiner les restes",
        subtitleColor: "#d2a575",
        icon: "/icons/IconFridge.svg",
        gradientFrom: "#caf0f8",
        gradientTo: "#90e0ef",
        route: "/frigo",
        details: (
            <>
                <DetailLead>
                    L'anti-gaspi malin: cuisine ce que tu as déjà sans courir au supermarché.
                </DetailLead>
                <DetailHeading>Comment ça marche</DetailHeading>
                <DetailList
                    items={[
                        "Tu indiques ce qu'il te reste dans le frigo, tes placards etc...",
                        "Tu réponds à quelques questions rapides: temps, envie, niveau.",
                        "On te propose une recette adaptée en utilisant tes restes.",
                    ]}
                />
                <DetailP>
                    On te proposera peut être d'aller en courses rapides pour compléter avec un produit de saison. Tu n'es pas obligé de le faire.
                </DetailP>
            </>
        ),
    },
    ingredient: {
        title: "Quoi cuisiner avec?",
        subtitle: "Cuisine autour de cet aliment",
        subtitleColor: "#e5d1ba",
        icon: "/icons/IconVegetables.svg",
        gradientFrom: "#e0aaff",
        gradientTo: "#c77dff",
        route: null,
        details: (
            <>
                <DetailLead>Un produit sous la main et zéro inspiration ? On part de lui.</DetailLead>
                <DetailP>
                    Choisis un aliment et on te propose des recettes qui le mettent vraiment en
                    valeur, plutôt que de le noyer dans la masse.
                </DetailP>
                <DetailP>
                    Idéal pour écouler un produit de saison ou un reste un peu particulier sans
                    te répéter.
                </DetailP>
            </>
        ),
    },
    batch: {
        title: "Batch cookons...",
        subtitle: "Prévois ta semaine en 1 clic",
        subtitleColor: "#e2d1c0",
        icon: "/icons/IconMarmite.svg",
        gradientFrom: "#d69f7e",
        gradientTo: "#cd9777",
        route: "/batch-cooking",
        details: (
            <>
                <DetailLead>Cuisine une fois, mange toute la semaine.</DetailLead>
                <DetailHeading>Le principe</DetailHeading>
                <DetailP>
                    On planifie plusieurs repas ensemble. Ça permet d'éviter de gaspiller, d'équilibrer plus facilement, et
                    d'optimiser la préparation (un plat cuit pendant qu'on coupe d'autres légumes etc...).
                </DetailP>
                <DetailList
                    items={[
                        "On mutualise les ingrédients et les cuissons.",
                        "On varie les sources de protéines.",
                        "On équilibre nutritivement toutes les recettes.",
                        "Tu prépares tout en une seule session.",
                        "Des plats plus frais en début de semaines, des gratins qui se conservent mieux en fin de semaine.",
                    ]}
                />
                <DetailP>
                    Moins de vaisselle, moins de courses, et zéro « Qu'est-ce qu'on mange? » en
                    pleine semaine.
                </DetailP>
            </>
        ),
    },
    routine: {
        title: "Les courses du quotidien...",
        subtitle: "Va en courses sans te prendre la tête",
        subtitleColor: "#d8f3dc",
        icon: "/icons/IconBasket.svg",
        gradientFrom: "#b7e4c7",
        gradientTo: "#52b788",
        route: null,
        details: (
            <>
                <DetailLead>Mets tes repas en pilote automatique.</DetailLead>
                <DetailP>
                    On met en place une routine de repas et de courses pour que tu n'aies plus
                    jamais à te demander quoi acheter.
                </DetailP>
                <DetailP>
                    On s'occupe de la liste, tu cuisines l'esprit tranquille.
                </DetailP>
            </>
        ),
    },
    instagram: {
        title: "Import Instagram",
        subtitle: "Découvre tous les secrets d'un post ou réel",
        subtitleColor: "#f3d1e8",
        icon: "/icons/ImportInstagramWhite.svg",
        gradientFrom: "#f178a0",
        gradientTo: "#b14bbf",
        route: "/instagram",
        details: (
            <>
                <DetailLead>
                    Transforme un post ou un réel en vraie recette utilisable.
                </DetailLead>
                <DetailHeading>Ce qu'on en sort</DetailHeading>
                <DetailList
                    items={[
                        "Les ingrédients et leurs quantités.",
                        "Les étapes détaillées et ordonnées.",
                        "Une version « remasterisée » te permettant de pimper la recette avec des saveurs cohérentes.",
                    ]}
                />
                <DetailP>
                    Fini les recettes éparpillées dans les collections ou la vidéo à mettre sur pause
                    toutes les trois secondes.
                </DetailP>
            </>
        ),
    },
    photo: {
        title: "Import Photo",
        subtitle: "Reproduis une recette en photo",
        subtitleColor: "#d6def8",
        icon: "/icons/ImportPhotoWhite.svg",
        gradientFrom: "#9aa8f5",
        gradientTo: "#6366f1",
        route: "/photo-import",
        details: (
            <>
                <DetailLead>Une photo d'un plat qui te fait envie? Envie de retenir une recette papier?</DetailLead>
                <DetailHeading>Plat ou recette papier, peu importe</DetailHeading>
                <DetailP>
                    Prends ou importe une photo, et on reconstruit la recette pour que tu la refasses
                    chez toi: ingrédients et étapes compris.
                </DetailP>
                <DetailP>
                    Parfait pour un plat repéré au resto ou chez des amis dont tu n'as pas la recette ou que tu souhaites la garder de côté.
                </DetailP>
            </>
        ),
    },
    website: {
        title: "Import Site Web",
        subtitle: "Récupère une recette depuis un lien",
        subtitleColor: "#c6f1e8",
        icon: "/icons/ImportWebsiteWhite.svg",
        gradientFrom: "#5eead4",
        gradientTo: "#14b8a6",
        route: null,
        details: (
            <>
                <DetailLead>Récupère n'importe quelle recette du web, proprement.</DetailLead>
                <DetailP>
                    Colle l'URL et on extrait automatiquement les ingrédients et les étapes, sans la
                    pub ni le blabla autour.
                </DetailP>
                <DetailP>Tout devient réutilisable directement dans l'app.</DetailP>
            </>
        ),
    },
    tiktok: {
        title: "Import TikTok",
        subtitle: "Transforme une vidéo en recette",
        subtitleColor: "#bdeef0",
        icon: "/icons/ImportTikTokWhite.svg",
        gradientFrom: "#4a4a55",
        gradientTo: "#1c1c24",
        route: null,
        details: (
            <>
                <DetailLead>Une vidéo TikTok appétissante ? On en fait une fiche recette.</DetailLead>
                <DetailP>
                    On analyse la vidéo et on en sort les ingrédients et les étapes, prêts à
                    cuisiner, sans repasser la vidéo image par image.
                </DetailP>
            </>
        ),
    },
};

interface RecipeGenerationActionButtonProps {
    type: RecipeGenerationType;
}

export default function RecipeGenerationActionButton({ type }: RecipeGenerationActionButtonProps) {
    const navigate = useNavigate();
    const config = VARIANTS[type];
    const comingSoon = config.route === null;
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleClick = () => {
        if (!comingSoon && config.route) {
            navigate(config.route);
        }
    };

    return (
        <div className="relative w-full h-full">
            <button
                onClick={handleClick}
                disabled={comingSoon}
                className={`relative w-full overflow-hidden rounded-[12px] h-full flex items-center gap-[16px] px-[24px] text-left transition-all duration-200 ${comingSoon
                    ? "cursor-default"
                    : "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    }`}
                style={{
                    background: `linear-gradient(to bottom, ${config.gradientFrom}, ${config.gradientTo})`,
                }}
            >
                <div className="flex-shrink-0 w-[56px] h-[56px] bg-white/20 rounded-[12px] flex items-center justify-center">
                    <img src={config.icon} alt="" className="w-[32px] h-[32px]" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-[12px]">
                    <h3 className="text-[20px] font-extrabold text-white leading-[28px] text-sora truncate">
                        {config.title}
                    </h3>
                    <p
                        className="text-[12px] font-bold leading-[16px] text-sora truncate"
                        style={{ color: config.subtitleColor }}
                    >
                        {config.subtitle}
                    </p>
                </div>

                {comingSoon && (
                    <div className="absolute inset-0 rounded-[12px] bg-gray-900/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-[15px] italic">
                            Bientôt disponible...
                        </span>
                    </div>
                )}
            </button>

            {!comingSoon && (
                <button
                    type="button"
                    onClick={() => setDetailsOpen(true)}
                    aria-label={`En savoir plus sur ${config.title}`}
                    className="absolute top-0 right-0 z-10 p-3 flex items-center justify-center text-white/90 hover:text-white transition-colors"
                >
                    <InformationCircleIcon className="w-8 h-8" />
                </button>
            )}

            <Modal
                isOpen={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                title={config.title}
                size="sm"
            >
                <div className="space-y-3">
                    {config.details}
                </div>
            </Modal>
        </div>
    );
}
