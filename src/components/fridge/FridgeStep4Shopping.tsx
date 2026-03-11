import { motion } from "framer-motion";
import type { FridgeShoppingResponse } from "../../api/interfaces/fridge/FridgeInterfaces";

interface FridgeStep4ShoppingProps {
    shoppingData: FridgeShoppingResponse;
    onAcceptShopping: () => void;
    onDeclineShopping: () => void;
    onBack: () => void;
}

function formatPrice(cents: number): string {
    if (cents < 100) {
        return `${cents} cts`;
    }
    return `${(cents / 100).toFixed(2).replace(".", ",")}€`;
}

export default function FridgeStep4Shopping({
    shoppingData,
    onAcceptShopping,
    onDeclineShopping,
    onBack,
}: FridgeStep4ShoppingProps) {
    const totalCents = shoppingData.items.reduce((sum, item) => sum + item.priceCents, 0);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🛒</span>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        Petite course possible ?
                    </h2>
                    <p className="text-text-secondary">
                        Pour débloquer beaucoup plus de recettes, il manquerait juste :
                    </p>
                </div>

                {/* Shopping items */}
                <div className="space-y-3 mb-6">
                    {shoppingData.items.map((item, index) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between bg-secondary rounded-xl p-4 border border-border-color"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.emoji}</span>
                                <div>
                                    <div className="font-medium text-text-primary">{item.name}</div>
                                    <div className="text-xs text-text-secondary">{item.unlockLabel}</div>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-cout-purple whitespace-nowrap">
                                ~{formatPrice(item.priceCents)}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Total */}
                <div className="text-center text-sm text-text-secondary mb-6">
                    Total estimé : <span className="font-semibold text-text-primary">~{formatPrice(totalCents)}</span>
                    <br />
                    <span className="text-xs italic">Prix approximatifs à titre indicatif</span>
                </div>

                {/* Recipe count comparison */}
                <div className="flex justify-center gap-6 mb-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-text-primary">{shoppingData.canCookNow}</div>
                        <div className="text-xs text-text-secondary">recettes sans courses</div>
                    </div>
                    <div className="text-2xl text-text-secondary self-center">→</div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-confirmation-1">
                            {shoppingData.canCookNow + shoppingData.canCookWithShopping}
                        </div>
                        <div className="text-xs text-text-secondary">recettes avec courses</div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onAcceptShopping}
                        className="w-full px-8 py-4 bg-confirmation-1 text-white font-bold rounded-xl text-lg hover:bg-confirmation-2 transform hover:scale-[1.02] transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                    >
                        <span>✅</span> OK je peux y aller
                    </button>
                    <button
                        onClick={onDeclineShopping}
                        className="w-full px-8 py-4 bg-secondary text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 border border-border-color"
                    >
                        <span>❌</span> Non, je cuisine avec ce que j'ai
                    </button>
                </div>

                <button
                    onClick={onBack}
                    className="w-full mt-4 text-text-secondary text-sm hover:text-text-primary transition-colors text-center"
                >
                    ← Revenir aux questions
                </button>
            </div>
        </motion.div>
    );
}
