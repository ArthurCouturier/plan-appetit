import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import FeedbackService from "../api/services/FeedbackService";
import FeedbackModal from "../components/modals/FeedbackModal";
import CreditPaywallModal from "../components/modals/CreditPaywallModal";
import type {
    FeedbackAnswers,
    FeedbackComponentSchema,
    FeedbackPayload,
} from "../components/feedbacks/types";
import useAuth from "../api/hooks/useAuth";
import { usePostHog } from "./PostHogContext";

interface FeedbackContextValue {
    triggerFeedbackCheck: (event?: string) => void;
    requestFeedback: (templateId: string) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export const FeedbackProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { trackEvent } = usePostHog();
    const [current, setCurrent] = useState<FeedbackPayload | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const shownAtRef = useRef<number | null>(null);
    const checkingRef = useRef(false);
    const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const closeFeedback = useCallback(() => {
        setIsOpen(false);
        setCurrent(null);
        shownAtRef.current = null;
        if (delayTimeoutRef.current) {
            clearTimeout(delayTimeoutRef.current);
            delayTimeoutRef.current = null;
        }
    }, []);

    const showFeedback = useCallback((payload: FeedbackPayload) => {
        setCurrent(payload);
        setIsOpen(true);
        shownAtRef.current = Date.now();
        trackEvent("feedback_shown", {
            feedbackUuid: payload.id,
            templateId: payload.templateId,
            triggerEvent: payload.triggerEvent ?? null,
        });
    }, [trackEvent]);

    const triggerFeedbackCheck = useCallback(async (event?: string) => {
        if (!user) return;
        if (checkingRef.current) return;
        if (isOpen || current) return;
        checkingRef.current = true;
        try {
            const payload = await FeedbackService.getPending(event);
            trackEvent("feedback_fetched", {
                event: event ?? null,
                hasFeedback: !!payload,
                templateId: payload?.templateId ?? null,
            });
            if (!payload) return;
            const delayMs = Math.max(0, payload.showAfterSeconds * 1000);
            if (delayTimeoutRef.current) {
                clearTimeout(delayTimeoutRef.current);
            }
            delayTimeoutRef.current = setTimeout(() => {
                showFeedback(payload);
            }, delayMs);
        } catch {
            // silently fail
        } finally {
            checkingRef.current = false;
        }
    }, [user, isOpen, current, trackEvent, showFeedback]);

    const requestFeedback = useCallback(async (templateId: string) => {
        if (!user) return;
        if (isOpen || current) return;
        try {
            const result = await FeedbackService.requestByTemplate(templateId);
            if (result) {
                const payload: FeedbackPayload = {
                    id: "",
                    templateId: result.templateId,
                    form: result.form,
                    triggerEvent: null,
                    priority: 0,
                    showAfterSeconds: 0,
                    dismissable: result.dismissable,
                    createdAt: new Date().toISOString(),
                };
                showFeedback(payload);
            }
        } catch {
            // silently fail
        }
    }, [user, isOpen, current, showFeedback]);

    useEffect(() => {
        if (!user) {
            closeFeedback();
        }
    }, [user, closeFeedback]);

    useEffect(() => {
        return () => {
            if (delayTimeoutRef.current) {
                clearTimeout(delayTimeoutRef.current);
            }
        };
    }, []);

    const isRequestMode = current?.id === "";

    const handleSubmit = useCallback(async (answers: FeedbackAnswers) => {
        if (!current) return;
        const durationMs = shownAtRef.current ? Date.now() - shownAtRef.current : 0;
        const answerCount = Object.values(answers).filter((v) => v !== null && v !== "" && v !== 0).length;
        trackEvent("feedback_submitted", {
            feedbackUuid: current.id || current.templateId,
            templateId: current.templateId,
            answerCount,
            durationMs,
        });
        try {
            if (isRequestMode) {
                await FeedbackService.submitNew(current.templateId, answers);
            } else {
                await FeedbackService.answer(current.id, answers);
            }
        } catch {
            // silently fail, still close to avoid blocking user
        }
        closeFeedback();
    }, [current, isRequestMode, trackEvent, closeFeedback]);

    const handleDismiss = useCallback(async () => {
        if (!current) return;
        trackEvent("feedback_dismissed", {
            feedbackUuid: current.id || current.templateId,
            templateId: current.templateId,
        });
        if (!isRequestMode && current.id) {
            try {
                await FeedbackService.dismiss(current.id);
            } catch {
                // silently fail
            }
        }
        closeFeedback();
    }, [current, isRequestMode, trackEvent, closeFeedback]);

    const handleComponentInteract = useCallback((component: FeedbackComponentSchema, value: unknown) => {
        if (!current) return;
        trackEvent("feedback_component_interacted", {
            feedbackUuid: current.id,
            templateId: current.templateId,
            componentId: component.id,
            componentType: component.type,
            value,
        });
        if (component.type === "button" && value === "open_paywall") {
            setShowPaywall(true);
        }
    }, [current, trackEvent]);

    const handleRedirect = useCallback((url: string, component: FeedbackComponentSchema, value: number) => {
        if (!current) return;
        trackEvent("feedback_redirect_triggered", {
            feedbackUuid: current.id,
            templateId: current.templateId,
            componentId: component.id,
            redirectUrl: url,
            triggerValue: value,
        });
        window.open(url, "_blank", "noopener,noreferrer");
    }, [current, trackEvent]);

    const value = useMemo<FeedbackContextValue>(() => ({
        triggerFeedbackCheck,
        requestFeedback,
    }), [triggerFeedbackCheck, requestFeedback]);

    return (
        <FeedbackContext.Provider value={value}>
            {children}
            {current && (
                <FeedbackModal
                    payload={current}
                    isOpen={isOpen}
                    onSubmit={handleSubmit}
                    onDismiss={handleDismiss}
                    onComponentInteract={handleComponentInteract}
                    onRedirect={handleRedirect}
                />
            )}
            {showPaywall && (
                <CreditPaywallModal onClose={() => setShowPaywall(false)} />
            )}
        </FeedbackContext.Provider>
    );
};

export function useFeedbackContext(): FeedbackContextValue {
    const ctx = useContext(FeedbackContext);
    if (!ctx) throw new Error("useFeedbackContext must be used within a FeedbackProvider");
    return ctx;
}
