import { useState, useEffect, useRef } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import UserStatsService from '../../api/services/UserStatsService';
import StatisticsInterface from '../../api/interfaces/users/StatisticsInterface';
import SuccessInterface, { SuccessType } from '../../api/interfaces/users/SuccessInterface';
import CreditIcon from '../icons/CreditIcon';
import confetti from 'canvas-confetti';

interface AchievementItem {
    id: SuccessType;
    title: string;
    credits: number;
    isCompleted: (stats: StatisticsInterface) => boolean;
    isClaimed: (success: SuccessInterface) => boolean;
}

const ONBOARDING_ACHIEVEMENTS: AchievementItem[] = [
    {
        id: SuccessType.GENERATE_ONE_RECIPE,
        title: 'Générer 1 recette',
        credits: 1,
        isCompleted: (stats) => stats.totalGeneratedRecipes >= 1,
        isClaimed: (success) => success.generateOneRecipe
    },
    {
        id: SuccessType.GENERATE_ONE_LOCATION_RECIPE,
        title: 'Générer 1 recette par localisation',
        credits: 1,
        isCompleted: (stats) => stats.localisationRecipes >= 1,
        isClaimed: (success) => success.generateOneLocationRecipe
    },
    {
        id: SuccessType.GENERATE_ONE_MULTI_RECIPE,
        title: 'Générer plusieurs recettes d\'un coup',
        credits: 3,
        isCompleted: (stats) => stats.multiRecipes >= 1,
        isClaimed: (success) => success.generateOneMultiRecipe
    },
    {
        id: SuccessType.EXPORT_ONE_RECIPE,
        title: 'Exporter 1 recette',
        credits: 1,
        isCompleted: (stats) => stats.exportedRecipes >= 1,
        isClaimed: (success) => success.exportOneRecipe
    }
];

export default function OnboardingChecklist() {
    const [statistics, setStatistics] = useState<StatisticsInterface | null>(null);
    const [success, setSuccess] = useState<SuccessInterface | null>(null);
    const [claimingStates, setClaimingStates] = useState<Record<string, boolean>>({});
    const [strikingStates, setStrikingStates] = useState<Record<string, boolean>>({});
    const [isImploding, setIsImploding] = useState(false);
    const [shouldHide, setShouldHide] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, successData] = await Promise.all([
                UserStatsService.fetchStatistics(),
                UserStatsService.fetchSuccess()
            ]);
            setStatistics(statsData);
            setSuccess(successData);
        } catch (error) {
            console.error('Error loading onboarding data:', error);
        }
    };

    const launchConfetti = () => {
        // Attendre 1 seconde (moment où le composant est le plus rétréci)
        setTimeout(() => {
            if (!containerRef.current) return;

            // Calculer la position du centre du composant
            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Convertir en coordonnées relatives à la fenêtre (0-1)
            const x = centerX / window.innerWidth;
            const y = centerY / window.innerHeight;

            const duration = 2000;
            const animationEnd = Date.now() + duration;
            const defaults = {
                startVelocity: 40,
                spread: 360,
                ticks: 60,
                zIndex: 0,
                colors: ['#F4B63C', '#8B5CF6', '#EC4899']
            };

            const interval: NodeJS.Timeout = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // Confettis partent du centre du composant
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x, y }
                });
            }, 100);
        }, 1000);
    };

    const handleClaimReward = async (achievement: AchievementItem) => {
        if (claimingStates[achievement.id] || strikingStates[achievement.id]) {
            return;
        }

        setClaimingStates(prev => ({ ...prev, [achievement.id]: true }));

        try {
            const response = await UserStatsService.claimSuccessReward(achievement.id);

            if (response.success) {
                setStrikingStates(prev => ({ ...prev, [achievement.id]: true }));

                setTimeout(async () => {
                    await loadData();
                    setStrikingStates(prev => ({ ...prev, [achievement.id]: false }));

                    // Vérifier si c'était le dernier succès
                    const updatedSuccess = await UserStatsService.fetchSuccess();
                    const allCompleted = ONBOARDING_ACHIEVEMENTS.every(
                        ach => ach.isClaimed(updatedSuccess)
                    );

                    if (allCompleted) {
                        // Lancer l'animation d'implosion et confettis
                        setIsImploding(true);
                        launchConfetti();

                        // Masquer complètement après 3 secondes
                        setTimeout(() => {
                            setShouldHide(true);
                        }, 3000);
                    }
                }, 400);
            } else {
                console.error('Failed to claim reward:', response.message);
                await loadData();
            }
        } catch (error) {
            console.error('Error claiming reward:', error);
        } finally {
            setClaimingStates(prev => ({ ...prev, [achievement.id]: false }));
        }
    };

    if (!statistics || !success) {
        return null;
    }

    if (shouldHide) {
        return null;
    }

    // Si tout est complété ET qu'on n'est pas en train d'imploder, ne pas afficher
    const allCompleted = ONBOARDING_ACHIEVEMENTS.every(
        achievement => achievement.isClaimed(success)
    );

    if (allCompleted && !isImploding) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className={`bg-primary rounded-xl p-6 shadow-md border border-border-color mb-6 relative overflow-hidden ${isImploding ? 'imploding' : ''
                }`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cout-base via-cout-purple to-cout-yellow"></div>

            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cout-base to-cout-purple rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎯</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Premiers Pas</h3>
                    <p className="text-sm text-text-secondary">
                        Débloquez des crédits gratuitement en complétant ces actions
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {ONBOARDING_ACHIEVEMENTS.map((achievement) => {
                    const completed = achievement.isCompleted(statistics);
                    const claimed = achievement.isClaimed(success);
                    const isStriking = strikingStates[achievement.id];
                    const isClaiming = claimingStates[achievement.id];

                    return (
                        <div
                            key={achievement.id}
                            className="relative flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border-color transition-all duration-200 overflow-hidden"
                        >
                            {isStriking && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent"
                                    style={{
                                        animation: 'strikethrough 0.4s ease-out forwards'
                                    }}
                                />
                            )}

                            {!claimed && !completed && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-thirdary/30 flex items-center justify-center">
                                    <LockClosedIcon className="w-4 h-4 text-text-secondary" />
                                </div>
                            )}

                            {completed && !claimed && (
                                <button
                                    onClick={() => handleClaimReward(achievement)}
                                    disabled={isClaiming}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--cout-yellow)] text-[var(--cout-purple)] rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ${isClaiming ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <CreditIcon className="w-4 h-4" />
                                    <span>+{achievement.credits}</span>
                                </button>
                            )}

                            {claimed && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            )}

                            <span
                                className={`flex-1 text-sm font-medium transition-all duration-300 ${claimed
                                    ? 'text-green-600 line-through'
                                    : completed
                                        ? 'text-text-primary'
                                        : 'text-text-secondary'
                                    }`}
                            >
                                {achievement.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes strikethrough {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                @keyframes implode {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    10% {
                        transform: scale(1.1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0);
                        opacity: 0;
                    }
                }

                .imploding {
                    animation: implode 1s ease-in-out forwards;
                    transform-origin: center center;
                }
            `}</style>
        </div>
    );
}
