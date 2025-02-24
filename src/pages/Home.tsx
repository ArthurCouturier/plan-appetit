import MenuButton from "../components/buttons/BackAndHomeButton";
import Header from "../components/global/Header";
import BusinessPlanThree from "../components/three/BusinessPlan";
import RecipesThree from "../components/three/Recipes";

export default function Home() {
    return (
        <div className="w-full">
            <div className="bg-bg-color p-6 rounded-md">
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
