import { ArrowDownTrayIcon, FolderPlusIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";

export function ImportRecipeButtonDetail({
    handleImportClick,
    disabled
}: {
    handleImportClick: () => void;
    disabled: boolean;
}) {
    return (
        <button
            onClick={handleImportClick}
            disabled={disabled}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Importer</span>
        </button>
    )
}

export function CreateCollectionButton({
    disabled,
    onClick
}: {
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            <FolderPlusIcon className="w-5 h-5" />
            <span>Collection</span>
        </button>
    );
}

export function DailyRecipeButton({
    onClick
}: {
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        >
            <CalendarDaysIcon className="w-5 h-5" />
            <span>Recettes du jour</span>
        </button>
    );
}
