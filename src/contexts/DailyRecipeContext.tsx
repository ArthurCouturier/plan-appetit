import { createContext, useContext, useState } from "react";

interface DailyRecipeContextInterface {
    showDailyRecipeModal: boolean;
    setShowDailyRecipeModal: (show: boolean) => void;
}

const DailyRecipeContext = createContext<DailyRecipeContextInterface | undefined>(undefined);

export const DailyRecipeProvider = ({ children }: { children: React.ReactNode }) => {
    const [showDailyRecipeModal, setShowDailyRecipeModal] = useState(false);

    return (
        <DailyRecipeContext.Provider value={{ showDailyRecipeModal, setShowDailyRecipeModal }}>
            {children}
        </DailyRecipeContext.Provider>
    );
};

export const useDailyRecipeContext = () => {
    const context = useContext(DailyRecipeContext);
    if (!context) throw new Error("useDailyRecipeContext must be used within a DailyRecipeProvider");
    return context;
};
