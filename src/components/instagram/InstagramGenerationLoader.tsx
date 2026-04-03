import { useState, useEffect, useRef } from "react";

interface Props {
  progress: {
    step: string;
    currentFrame: number;
    totalFrames: number;
    percent: number;
  };
}

const STEP_LABELS: Record<string, string> = {
  download: "Telechargement de la video...",
  extracting_frames: "Extraction des images...",
  analyzing_frames: "Analyse des images",
  building_report: "Construction du rapport...",
  generating_recipe: "Generation de la recette...",
  complete: "Termine !",
};

export default function InstagramGenerationLoader({ progress }: Props) {
  const [displayPercent, setDisplayPercent] = useState(0);
  const fakeProgressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (progress.step === "complete") {
      setDisplayPercent(100);
      if (fakeProgressRef.current) { clearInterval(fakeProgressRef.current); fakeProgressRef.current = null; }
      return;
    }

    if (progress.percent >= 90) {
      if (!fakeProgressRef.current) {
        setDisplayPercent(prev => Math.max(prev, 90));
        fakeProgressRef.current = setInterval(() => {
          setDisplayPercent(prev => (prev < 99 ? prev + 1 : 99));
        }, 900);
      }
    } else {
      if (fakeProgressRef.current) { clearInterval(fakeProgressRef.current); fakeProgressRef.current = null; }
      setDisplayPercent(progress.percent);
    }
  }, [progress]);

  useEffect(() => {
    return () => { if (fakeProgressRef.current) clearInterval(fakeProgressRef.current); };
  }, []);

  const stepLabel = progress.step === "analyzing_frames" && progress.totalFrames > 0
    ? `Analyse image ${progress.currentFrame}/${progress.totalFrames}`
    : STEP_LABELS[progress.step] || "Demarrage...";

  return (
    <div className="w-full rounded-xl bg-white/10 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">{stepLabel}</span>
        <span className="text-sm font-bold text-white/90">{displayPercent}%</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-400 via-purple-300 to-white rounded-full transition-all duration-500 ease-out"
          style={{ width: `${displayPercent}%` }}
        />
      </div>
    </div>
  );
}
