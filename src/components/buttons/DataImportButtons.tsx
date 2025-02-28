import { ChangeEvent, useRef } from "react";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeService from "../../api/services/RecipeService";
import { ImportRecipeButtonDetail } from "./NewRecipeButton";
import { useNavigate } from "react-router-dom";

function exportData(datakey: string, uuid?: string, name?: string) {
    const storedData = localStorage.getItem(datakey);
    if (!storedData) {
        alert(`Aucune donnée trouvée dans le localStorage (clé ${datakey}).`);
        return;
    }

    let data: string = "";

    if (uuid) {
        const jsonData = JSON.parse(storedData);
        data = JSON.stringify(jsonData.find((item: { uuid: string }) => item.uuid == uuid));
        if (!data) {
            alert(`Aucune donnée trouvée avec l'uuid ${uuid}.`);
            return;
        }
    } else {
        data = storedData;
    }

    const blob = new Blob([data], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    if (name) {
        link.download = `plan-appetit_${name}.json`;
    } else {
        link.download = `plan-appetit_configuration_${Date.now()}.json`;
    }
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

function importData(datakey: string, file: File, callback: () => void) {
    const reader = new FileReader();

    reader.onload = (event) => {
        const fileText = event.target?.result as string;
        const jsonData = JSON.parse(fileText);

        localStorage.setItem(datakey, JSON.stringify(jsonData));

        alert(`Importation réussie ! Les données ont été enregistrées dans localStorage (clé '${datakey}').`);
        callback();
    };

    reader.onerror = (event) => {
        alert('Une erreur est survenue lors de la lecture du fichier.');
        console.error(event);
    };

    reader.readAsText(file);
}

export function ExportConfigurationButton() {
    const handleExport = () => {
        exportData('configurations');
    };

    return (
        <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-sm"
        >
            Export
        </button>
    );
};

export function ImportConfigurationButton({
    fetchConfigs
}: {
    fetchConfigs: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        importData('configurations', file, fetchConfigs);
    };

    return (
        <>
            <button
                onClick={handleImportClick}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-sm mr-2"
            >
                Import
            </button>

            <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </>
    );
};

export function ExportRecipeButton({ recipe }: { recipe: RecipeInterface }) {

    const handleExport = () => {
        exportData('recipes', recipe.uuid.toString(), "recette_" + recipe.name);
    };

    return (
        <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-sm"
        >
            Exporter la recette
        </button>
    );
};

export function ExportOpenAIRecipeButton() {
    const handleExport = () => {
        exportData('recipe_ai');
    };

    return (
        <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-sm"
        >
            Exporter la recette générée
        </button>
    );
};

export function ImportRecipeButton({
    setRecipes,
    disabled
}: {
    setRecipes: (recipes: RecipeInterface[]) => void;
    disabled: boolean;
}) {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        try {
            fileInputRef.current?.click();
        } catch (err) {
            console.error(err);
            navigate('/login');
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        RecipeService.importRecipe(file, setRecipes);
    };

    return (
        <>
            <ImportRecipeButtonDetail handleImportClick={handleImportClick} disabled={disabled} />

            <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </>
    );
}
