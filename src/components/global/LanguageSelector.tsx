import { useState, useRef, useEffect } from 'react';
import { useLanguage, Language, LANGUAGE_CONFIG } from '../../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-secondary rounded-lg border border-border-color transition-colors duration-200"
        aria-label="Select language"
      >
        <span className="text-2xl">{languages[language].flag}</span>
        <span className="text-sm font-medium text-text-primary hidden sm:inline">
          {languages[language].name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary border border-border-color rounded-lg shadow-xl z-50 overflow-hidden">
          {(Object.keys(languages) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors duration-150 ${
                language === lang ? 'bg-cout-purple/10' : ''
              }`}
            >
              <span className="text-2xl">{languages[lang].flag}</span>
              <span className="text-sm font-medium text-text-primary">
                {languages[lang].name}
              </span>
              {language === lang && (
                <span className="ml-auto text-cout-base">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
