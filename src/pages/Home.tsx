import MenuButton from "../components/buttons/BackAndHomeButton";
import Header from "../components/global/Header";

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
                <MenuButton link={"/planning"}>Configurer le planning</MenuButton>
                <MenuButton link={"/recettes"}>Livre des recettes</MenuButton>
            </div>
        </div>
    );
}
