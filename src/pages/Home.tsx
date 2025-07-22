import { useEffect, useState } from "react";
import MenuButton from "../components/buttons/BackAndHomeButton";
import Header from "../components/global/Header";
import BusinessPlanThree from "../components/three/BusinessPlan";
import RecipesThree from "../components/three/Recipes";
import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";

export default function Home() {

    const [isMobile, setIsMobile] = useState(false);
    
      useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
        };
    
        handleResize();
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
      }, []);

    const navigateTo = useNavigate();

    return (
        isMobile ? <Button onClick={() => navigateTo("/recettes")}>Mobile Version</Button> :
        <div className="w-full h-full">
            <div className="bg-bg-color h-full min-h-fit p-6 rounded-md">
                <Header
                    back={true}
                    home={true}
                    title={true}
                    profile={true}
                />
                <MenuButton link={"/planning"}>
                    Configurer le planning
                    <BusinessPlanThree />
                </MenuButton>
                <MenuButton link={"/recettes"}>
                    Livre des recettes
                    <RecipesThree />
                </MenuButton>
            </div>
        </div>
    );
}
