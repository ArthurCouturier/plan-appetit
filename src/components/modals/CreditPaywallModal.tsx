import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import usePaywallProducts from "../../api/hooks/usePaywallProducts";
import { TrackingService } from "../../api/tracking/TrackingService";
import { SKAdNetworkService } from "../../api/tracking/skadnetwork/SKAdNetworkService";
import { SKAdNetworkConversionValue } from "../../api/tracking/skadnetwork/SKAdNetworkConversionValue";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import PaywallContent, { PaywallTrigger } from "../paywall/PaywallContent";
import useIsMobile from "../../hooks/useIsMobile";
import { usePostHog } from "../../contexts/PostHogContext";

interface CreditPaywallModalProps {
    onClose: () => void;
    trigger?: PaywallTrigger;
    remainingCredits?: number;
}

const HAS_SEEN_KEY = 'paywall_has_seen_before';

export default function CreditPaywallModal({
    onClose,
    trigger = 'quota_exceeded',
    remainingCredits,
}: CreditPaywallModalProps) {
    const products = usePaywallProducts();
    const isMobile = useIsMobile();
    const { trackEvent } = usePostHog();
    const [creditsSheetOpen, setCreditsSheetOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!isMobile) return;
        const node = modalRef.current;
        if (!node) return;
        const parentEl = node.parentElement;
        if (!parentEl) return;

        const update = () => {
            (node.style as CSSStyleDeclaration & { zoom: string }).zoom = '1';
            const naturalH = node.scrollHeight;
            const availableH = parentEl.clientHeight;
            const newZoom = naturalH > 0 ? Math.min(1, availableH / naturalH) : 1;
            (node.style as CSSStyleDeclaration & { zoom: string }).zoom =
                newZoom < 1 ? String(newZoom) : '';
        };

        const rafId = requestAnimationFrame(update);
        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', update);
            window.removeEventListener('orientationchange', update);
        };
    }, [
        isMobile,
        creditsSheetOpen,
        products.isLoading,
        products.isPurchasing,
        products.purchaseError,
    ]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const COOLDOWN_KEY = 'paywall_last_tracked';
        const COOLDOWN_MS = 10 * 60 * 1000;
        const lastTracked = Number(sessionStorage.getItem(COOLDOWN_KEY) || '0');
        if (Date.now() - lastTracked > COOLDOWN_MS) {
            sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
            TrackingService.logCreditPackViewed('paywall');
            TrackingService.logViewContent('paywall');
            SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.QUOTA_REACHED);
        }

        const hasSeenBefore = localStorage.getItem(HAS_SEEN_KEY) === 'true';
        localStorage.setItem(HAS_SEEN_KEY, 'true');

        trackEvent('paywall_viewed', {
            source: 'modal',
            trigger,
            remaining_credits: remainingCredits ?? null,
            has_seen_paywall_before: hasSeenBefore,
        });

        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleClose = () => {
        trackEvent('paywall_dismissed', {
            reason: 'modal_close',
            trigger,
        });
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
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
                ref={modalRef}
                className="w-full max-w-[440px] rounded-xl shadow-2xl relative"
                style={{
                    background: 'linear-gradient(165deg, #f17c63 0%, #e8694f 25%, #f2a96f 55%, #eda391 80%, #edc79e 100%)',
                    maxHeight: '100%',
                    overflowY: isMobile ? 'hidden' : 'auto',
                    WebkitOverflowScrolling: 'touch',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex justify-between items-center p-4 pb-0">
                    {creditsSheetOpen ? (
                        <button
                            onClick={() => setCreditsSheetOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-white/90 shadow-md transition-colors duration-200"
                            aria-label="Revenir à l'essai gratuit"
                        >
                            <ChevronLeftIcon className="w-5 h-5 -translate-x-[1px] text-black" />
                        </button>
                    ) : (
                        <span className="w-8 h-8" aria-hidden="true" />
                    )}
                    <button
                        onClick={handleClose}
                        className={`flex items-center justify-center rounded-full transition-colors duration-200 ${isMobile
                            ? "w-8 h-8 bg-red-500 hover:bg-red-600 shadow-lg"
                            : "w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                            }`}
                        aria-label="Fermer"
                    >
                        <XMarkIcon className="w-5 h-5 text-white" />
                    </button>
                </div>

                <PaywallContent
                    products={products}
                    variant="modal"
                    trigger={trigger}
                    creditsSheetOpen={creditsSheetOpen}
                    onCreditsSheetOpenChange={setCreditsSheetOpen}
                />
            </div>
        </div>,
        document.body
    );
}
