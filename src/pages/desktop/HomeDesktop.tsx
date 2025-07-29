import { useNavigate } from "react-router-dom";
import Header from "../../components/global/Header";
import BusinessPlanThree from "../../components/three/BusinessPlan";
import RecipesThree from "../../components/three/Recipes";
import { Button } from "../../components/buttons/BackAndHomeButton";

export default function HomeDesktop() {

  const navigate = useNavigate();
  return (
    <div className="w-full h-full">
      <div className="bg-bg-color h-full min-h-fit p-6 rounded-md">
        <Header
          back={true}
          home={true}
          title={true}
          profile={true}
        />
        <Button onClick={() => navigate("/planning")}>
          Configurer le planning
          <BusinessPlanThree />
        </Button>
        <Button onClick={() => navigate("/recettes")}>
          Livre des recettes
          <RecipesThree />
        </Button>
      </div>
    </div>
  )
}