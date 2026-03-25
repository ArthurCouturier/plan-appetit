import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import usePaywallProducts from "../../api/hooks/usePaywallProducts";
import { TrackingService } from "../../api/tracking/TrackingService";
import { SKAdNetworkService } from "../../api/tracking/skadnetwork/SKAdNetworkService";
import { SKAdNetworkConversionValue } from "../../api/tracking/skadnetwork/SKAdNetworkConversionValue";
import { useEffect, useState } from "react";
import PaywallContent from "../paywall/PaywallContent";

interface CreditPaywallModalProps {
    onClose: () => void;
}

export default function CreditPaywallModal({ onClose }: CreditPaywallModalProps) {
    const products = usePaywallProducts();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const COOLDOWN_KEY = 'paywall_last_tracked';
        const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
        const lastTracked = Number(sessionStorage.getItem(COOLDOWN_KEY) || '0');
        if (Date.now() - lastTracked > COOLDOWN_MS) {
            sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
            TrackingService.logCreditPackViewed('paywall');
            TrackingService.logViewContent('paywall');
            SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.QUOTA_REACHED);
        }

        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            style={{
                padding: `calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 16px)`,
            }}
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-[440px] rounded-xl shadow-2xl relative"
                style={{
                    background: 'linear-gradient(165deg, #f17c63 0%, #e8694f 25%, #f2a96f 55%, #eda391 80%, #edc79e 100%)',
                    maxHeight: '100%',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <div className="sticky top-0 z-10 flex justify-end p-4 pb-0">
                    <button
                        onClick={onClose}
                        className={`flex items-center justify-center rounded-full transition-colors duration-200 ${
                            isMobile
                                ? "w-8 h-8 bg-red-500 hover:bg-red-600 shadow-lg"
                                : "w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        }`}
                        aria-label="Fermer"
                    >
                        <XMarkIcon className="w-5 h-5 text-white" />
                    </button>
                </div>

                <PaywallContent products={products} onClose={onClose} variant="modal" />
            </div>
        </div>,
        document.body
    );
}
