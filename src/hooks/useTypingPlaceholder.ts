import { useState, useEffect, useRef } from 'react';

interface UseTypingPlaceholderOptions {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function useTypingPlaceholder({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: UseTypingPlaceholderOptions): string {
  const [currentText, setCurrentText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (phrases.length === 0) return;

    const currentPhrase = phrases[phraseIndex];

    const handleTyping = () => {
      if (isPaused) {
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
        return;
      }

      if (isDeleting) {
        if (currentText.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        } else {
          setCurrentText((prev) => prev.slice(0, -1));
        }
      } else {
        if (currentText === currentPhrase) {
          setIsPaused(true);
        } else {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }
      }
    };

    const speed = isPaused ? 0 : isDeleting ? deletingSpeed : typingSpeed;

    if (speed > 0) {
      timeoutRef.current = setTimeout(handleTyping, speed);
    } else {
      handleTyping();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentText, phraseIndex, isDeleting, isPaused, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return currentText;
}
