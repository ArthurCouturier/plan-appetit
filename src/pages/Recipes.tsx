import { useEffect, useState } from "react";
import HomeMobile from "./mobile/HomeMobile";
import RecipeDesktop from "./desktop/RecipeDesktop";

export default function Recipes() {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        isMobile ? <HomeMobile /> : <RecipeDesktop />
    );
}
