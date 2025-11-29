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

    const logoSrc = theme === 'theme1' ?
        clickable ? '/logo/actual/logo-light-color.svg' : '/logo/actual/logo-light-white.svg'
        :
        clickable ? '/logo/actual/logo-dark-white.svg' : '/logo/actual/logo-dark-white.svg';

    const sizeConfig = {
        xs: {
            imageSize: "w-6",
        },
        sm: {
            imageSize: "w-8",
        },
        md: {
            imageSize: "w-10 md:w-12",
        },
        lg: {
            imageSize: "w-14 md:w-16",
        },
        xl: {
            imageSize: "w-20 md:w-24",
        },
        '2xl': {
            imageSize: "w-28 md:w-32",
        },
    };

    const config = sizeConfig[size];
    const baseClasses = `rounded-lg inline-flex items-center justify-center p-3`;
    const clickableClasses = clickable
        ? `cursor-pointer`
        : "cursor-default";

    return (
        <button
            onClick={clickable ? () => navigate('/recettes') : undefined}
            className={`${baseClasses} ${clickableClasses}`}
            aria-label={clickable ? "Retour à l'accueil" : "Logo Plan Appetit"}
            disabled={!clickable}
        >
            <img
                src={logoSrc}
                alt="Plan Appetit Logo"
                className={`${config.imageSize}`}
            />
        </button>
    );
}
