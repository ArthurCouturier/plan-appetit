import { useState, useEffect, useRef } from "react";
import Configurator from "../api/Configurator";
import ConfigurationInterface from "../api/interfaces/ConfigurationInterface";
import ConfirmationPopUp from "./ConfirmationPopUp";

export default function ConfigurationSelector({
    configurations,
    setConfigurations,
    actualConfig,
    onSelect
}: {
    configurations: ConfigurationInterface[];
    setConfigurations: (configs: ConfigurationInterface[]) => void;
    actualConfig: ConfigurationInterface;
    onSelect: (selectedConfig: ConfigurationInterface) => void;
}) {
    const [selectedConfig, setSelectedConfig] = useState<ConfigurationInterface>(actualConfig);
    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (config: ConfigurationInterface) => {
        setSelectedConfig(config);
        onSelect(config);
        setIsOpen(false);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [configToDelete, setConfigToDelete] = useState<ConfigurationInterface | null>(null);

    const handleDeleteClick = (config: ConfigurationInterface) => {
        setConfigToDelete(config);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (configToDelete) {
            Configurator.deleteConfiguration(configToDelete);
            if (actualConfig.uuid === configToDelete.uuid) {
                setSelectedConfig(configurations[0]);
                onSelect(configurations[0]);
            }
            setConfigurations(Configurator.fetchConfigurations());
        }
        setIsModalOpen(false);
        setConfigToDelete(null);
    };

    return (
        <div className="relative w-full max-w-xs" ref={dropdownRef}>
            <button
                className="w-full bg-secondary border border-borderColor rounded px-4 py-2 text-left text-textSecondary hover:scale-[1.03] transition duration-200 shadow"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedConfig.name}
            </button>
            {isOpen && (
                <ul className="absolute bg-primary border border-borderColor rounded shadow mt-2 w-full z-10">
                    {configurations.map((config, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 cursor-pointer text-textSecondary flex"
                        >
                            <div
                                className="hover:bg-bgColor w-full pr-3"
                                onClick={() => handleSelect(config)}
                            >
                                {config.name}
                                <button
                                    className="bg-borderColor w-6 h-6 rounded-full float-right rotate-90"
                                    onClick={(e) => {
                                        const newConfig = Configurator.changeConfigName(config)
                                        if (newConfig) {
                                            e.stopPropagation();
                                            setConfigurations(Configurator.fetchConfigurations());
                                            handleSelect(newConfig);
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    ✏️
                                </button>
                            </div>
                            <button
                                className="bg-borderColor float-right ml-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(config);
                                    e.preventDefault();
                                }}
                            >
                                ❌
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            className="px-4 py-2 hover:bg-bgColor cursor-pointer text-textSecondary w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                const newConfig = Configurator.getEmptyConfiguration();
                                const configs = Configurator.fetchConfigurations();
                                Configurator.saveConfigurations([...configs, newConfig]);
                                handleSelect(newConfig);
                                setConfigurations(Configurator.fetchConfigurations());
                                e.preventDefault();
                            }}
                        >
                            + New
                        </button>
                    </li>
                </ul>
            )}
            <ConfirmationPopUp
                isOpen={isModalOpen}
                title="Confirmer la suppression"
                message={`Etes-vous sûrs de supprimer la configuration "${configToDelete?.name}"? Cette action est définitive.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setIsModalOpen(false);
                    setConfigToDelete(null);
                }}
            />
        </div>
    );
}
