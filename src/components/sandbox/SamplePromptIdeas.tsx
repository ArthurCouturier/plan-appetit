import { useCallback, useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import SandboxService from "../../api/services/SandboxService";

interface SamplePromptIdeasProps {
    onPick: (text: string) => void;
    sampleSize?: number;
    disabled?: boolean;
}

const DEFAULT_SAMPLE_SIZE = 4;

export default function SamplePromptIdeas({
    onPick,
    sampleSize = DEFAULT_SAMPLE_SIZE,
    disabled,
}: SamplePromptIdeasProps) {
    const [pool, setPool] = useState<string[]>([]);
    const [picks, setPicks] = useState<string[]>([]);

    const refresh = useCallback(
        (source: string[]) => {
            if (source.length <= sampleSize) {
                setPicks([...source]);
                return;
            }
            const shuffled = [...source].sort(() => Math.random() - 0.5);
            setPicks(shuffled.slice(0, sampleSize));
        },
        [sampleSize]
    );

    useEffect(() => {
        let cancelled = false;
        SandboxService.getPlaceholders()
            .then((p) => {
                if (cancelled) return;
                setPool(p);
                refresh(p);
            })
            .catch(() => {
                if (cancelled) return;
                setPool([]);
                setPicks([]);
            });
        return () => {
            cancelled = true;
        };
    }, [refresh]);

    if (picks.length === 0) return null;

    return (
        <div className="w-full mt-8">
            <p className="text-center text-text-secondary text-sm mb-3">
                Quelques idées pour t'inspirer
            </p>
            <div className="flex flex-col gap-2">
                {picks.map((idea, idx) => (
                    <button
                        key={`${idea}-${idx}`}
                        type="button"
                        onClick={() => onPick(idea)}
                        disabled={disabled}
                        className="w-full px-4 py-2.5 bg-secondary text-text-primary text-sm rounded-xl border border-border-color hover:border-cout-base transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
                    >
                        {idea}
                    </button>
                ))}
            </div>
            <div className="mt-3 flex justify-center">
                <button
                    type="button"
                    onClick={() => refresh(pool)}
                    disabled={disabled}
                    aria-label="Voir d'autres idées"
                    className="p-2 rounded-full bg-secondary text-text-primary border border-border-color hover:border-cout-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
