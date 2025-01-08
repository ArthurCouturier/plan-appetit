import { ChangeEvent, useRef } from "react";

function exportData(datakey: string) {
    const storedData = localStorage.getItem(datakey);
    if (!storedData) {
        alert(`Aucune donnée trouvée dans le localStorage (clé ${datakey}).`);
        return;
    }

    const blob = new Blob([storedData], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `plan-appetit_configuration_${Date.now()}.json`;
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

export function ExportButton() {
    const handleExport = () => {
        exportData('configurations');
    };

    return (
        <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
            Export
        </button>
    );
};

export function ImportButton({
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
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
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
