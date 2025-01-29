import MenuButton from "../components/buttons/BackAndHomeButton";

export default function Home() {
    return (
        <div className="w-full">
            <div className="bg-bg-color p-6 rounded-md">
                <MenuButton link={"/planning"}>Configurer le planning</MenuButton>
                <MenuButton link={"/recettes"}>Livre des recettes</MenuButton>
            </div>
        </div>
    );
}
