import { useCallback, useEffect, useRef, useState } from "react";
import InstagramGenerationLoader from "../instagram/InstagramGenerationLoader";
import { modalTapHaptic } from "../../haptics/modalTap";
import { fireworkHaptic } from "../../haptics/firework";
import { simmerHaptic } from "../../haptics/simmer";
import loadingPhrases from "../../data/loadingPhrases.json";

interface RecipeGenerationLoadingModalProps {
  isOpen: boolean;
  type?: string;
  progress?: {
    step: string;
    currentFrame: number;
    totalFrames: number;
    percent: number;
  } | null;
}

export default function RecipeGenerationLoadingModal({ isOpen, type = "generation", progress }: RecipeGenerationLoadingModalProps) {
  const wasOpen = useRef(false);

  const getRandomPhrase = useCallback(() => {
    const phrases = loadingPhrases.filter((p) => p.type === type);
    return phrases[Math.floor(Math.random() * phrases.length)]?.phrase ?? "";
  }, [type]);

  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const currentPhrase = useRef(getRandomPhrase());
  const isTyping = useRef(true);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let initial = getRandomPhrase();
    while (initial === currentPhrase.current) initial = getRandomPhrase();
    currentPhrase.current = initial;
    setDisplayedText("");
    isTyping.current = true;

    let charIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (isTyping.current) {
        charIndex++;
        setDisplayedText(currentPhrase.current.slice(0, charIndex));
        if (charIndex >= currentPhrase.current.length) {
          timeout = setTimeout(() => {
            isTyping.current = false;
            timeout = setTimeout(tick, 800);
          }, 4000);
          return;
        }
      } else {
        charIndex--;
        setDisplayedText(currentPhrase.current.slice(0, charIndex));
        if (charIndex <= 0) {
          let next = getRandomPhrase();
          while (next === currentPhrase.current) next = getRandomPhrase();
          currentPhrase.current = next;
          isTyping.current = true;
          timeout = setTimeout(tick, 800);
          return;
        }
      }
      timeout = setTimeout(tick, isTyping.current ? 40 : 25);
    };

    timeout = setTimeout(tick, 800);
    return () => clearTimeout(timeout);
  }, [isOpen, getRandomPhrase]);

  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      simmerHaptic();
      const interval = setInterval(simmerHaptic, 2000);
      return () => clearInterval(interval);
    } else if (wasOpen.current) {
      wasOpen.current = false;
      fireworkHaptic();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-cout-purple backdrop-blur-sm flex items-center justify-center z-50"
      onClick={modalTapHaptic}
    >
      <div className="text-center w-full h-full flex flex-col items-center justify-center">
        <div className="flex-1 flex items-end justify-center w-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-[95vw] md:w-auto md:max-h-[55vh] object-contain"
          >
            <source src="/animations/cooking-loader-eevee.mov" type='video/quicktime; codecs="hvc1"' />
            <source src="/animations/cooking-loader-eevee.webm" type="video/webm" />
          </video>
        </div>
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "33vh" }}>
          <h3 className="text-2xl font-bold text-white mb-2">Création en cours...</h3>
          <p className="text-cout-yellow/90 text-lg mb-6">{displayedText}<span className={cursorVisible ? "opacity-100" : "opacity-0"}>|</span></p>

          {progress ? (
            <InstagramGenerationLoader progress={progress} />
          ) : (
            <div className="flex justify-center gap-1">
              <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
