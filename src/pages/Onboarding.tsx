import { useEffect, useRef, useMemo, useCallback } from "react";
import OnboardingImageCard from "../components/onboarding/OnboardingImageCard";
import LiquidGlassModal from "../components/onboarding/LiquidGlassModal";

const SPEED_LEFT = 0.5;
const SPEED_CENTER = -0.3;
const SPEED_RIGHT = 0.9;

const RESUME_DELAY = 1500;
const SPEEDS = [SPEED_LEFT, SPEED_CENTER, SPEED_RIGHT];

const imageFiles = Object.keys(
  import.meta.glob("/public/onboarding/images_webp/*.webp")
).map((path) => path.replace("/public", ""));

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Onboarding() {
  const contentRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const offsetsRef = useRef([0, 0, 0]);
  const pausedUntilRef = useRef([0, 0, 0]);
  const touchStartYRef = useRef([0, 0, 0]);

  const columnImages = useMemo(() => {
    const shuffled = shuffle(imageFiles);
    const chunkSize = Math.ceil(shuffled.length / 3);
    return [
      shuffled.slice(0, chunkSize),
      shuffled.slice(chunkSize, chunkSize * 2),
      shuffled.slice(chunkSize * 2),
    ];
  }, []);

  // Preload all images into browser cache
  useEffect(() => {
    imageFiles.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Initialize offsets + start rAF loop
  useEffect(() => {
    let rafId: number;
    let initialized = false;

    const tick = () => {
      for (let i = 0; i < 3; i++) {
        const content = contentRefs.current[i];
        if (!content) continue;

        const blockHeight = content.scrollHeight / 3;

        if (!initialized) {
          offsetsRef.current[i] = blockHeight;
        }

        if (Date.now() >= pausedUntilRef.current[i]) {
          offsetsRef.current[i] += SPEEDS[i];
        }

        // Seamless wrap around the middle block
        if (offsetsRef.current[i] >= blockHeight * 2) {
          offsetsRef.current[i] -= blockHeight;
        } else if (offsetsRef.current[i] <= 0) {
          offsetsRef.current[i] += blockHeight;
        }

        content.style.transform = `translateY(${-offsetsRef.current[i]}px)`;
      }

      initialized = true;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const pauseColumn = useCallback((index: number) => {
    pausedUntilRef.current[index] = Date.now() + RESUME_DELAY;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent, index: number) => {
    pauseColumn(index);
    offsetsRef.current[index] += e.deltaY * 0.5;
  }, [pauseColumn]);

  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    pauseColumn(index);
    touchStartYRef.current[index] = e.touches[0].clientY;
  }, [pauseColumn]);

  const handleTouchMove = useCallback((e: React.TouchEvent, index: number) => {
    const deltaY = touchStartYRef.current[index] - e.touches[0].clientY;
    touchStartYRef.current[index] = e.touches[0].clientY;
    offsetsRef.current[index] += deltaY;
    pauseColumn(index);
  }, [pauseColumn]);

  return (
    <div className="relative w-full h-screen h-dvh bg-gradient-to-br from-cout-purple via-cout-base to-cout-purple flex overflow-hidden">
      <LiquidGlassModal />
      {columnImages.map((images, colIndex) => {
        const tripled = [...images, ...images, ...images];
        return (
          <div
            key={colIndex}
            className="flex-1 overflow-hidden"
            onWheel={(e) => handleWheel(e, colIndex)}
            onTouchStart={(e) => handleTouchStart(e, colIndex)}
            onTouchMove={(e) => handleTouchMove(e, colIndex)}
          >
            <div
              ref={(el) => { contentRefs.current[colIndex] = el; }}
              className="flex flex-col gap-3 p-2 will-change-transform"
            >
              {tripled.map((src, i) => (
                <OnboardingImageCard key={`${colIndex}-${i}`} src={src} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
