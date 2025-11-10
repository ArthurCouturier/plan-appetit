import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface LogoButtonProps {
    clickable?: boolean;
    size?: LogoSize;
}

export default function LogoButton({ clickable = true, size = 'md' }: LogoButtonProps) {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'theme1');

    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(localStorage.getItem('theme') || 'theme1');
        };

        window.addEventListener('storage', handleThemeChange);

        const observer = new MutationObserver(() => {
            const currentTheme = document.documentElement.classList.contains('theme2') ? 'theme2' : 'theme1';
            if (currentTheme !== theme) {
                setTheme(currentTheme);
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            window.removeEventListener('storage', handleThemeChange);
            observer.disconnect();
        };
    }, [theme]);

    const logoSrc = theme === 'theme1' ? '/logo-light-2.svg' : '/logo-dark-2.svg';

    const sizeConfig = {
        xs: {
            imageSize: "w-6 h-3",
        },
        sm: {
            imageSize: "w-8 h-4",
        },
        md: {
            imageSize: "w-10 h-5 md:w-12 md:h-6",
        },
        lg: {
            imageSize: "w-14 h-7 md:w-16 md:h-8",
        },
        xl: {
            imageSize: "w-20 h-10 md:w-24 md:h-12",
        },
        '2xl': {
            imageSize: "w-28 h-14 md:w-32 md:h-16",
        },
    };

    const config = sizeConfig[size];
    const baseClasses = `rounded-lg inline-flex items-center justify-center`;
    const clickableClasses = clickable
        ? `cursor-pointer`
        : "cursor-default";

    return (
        <button
            onClick={clickable ? () => navigate('/') : undefined}
            className={`${baseClasses} ${clickableClasses}`}
            aria-label={clickable ? "Retour à l'accueil" : "Logo Plan Appetit"}
            disabled={!clickable}
        >
            <img
                src={logoSrc}
                alt="Plan Appetit Logo"
                className={config.imageSize}
            />
        </button>
    );
}
