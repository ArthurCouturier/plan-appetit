import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../api/interfaces/users/UserInterface";
import AdminService, { TrackingTestResponse } from "../api/services/AdminService";
import { FacebookPixelService } from "../api/tracking/providers/meta/FacebookPixelService";
import { TikTokPixelService } from "../api/tracking/providers/tiktok/TikTokPixelService";

type Provider = "meta" | "tiktok";

interface ButtonResult {
    success: boolean;
    message: string;
}

export default function AdminTrackingTest() {
    const { user } = useAuth();
    const [testEventCode, setTestEventCode] = useState("");

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

            <div className="bg-primary rounded-xl p-5 shadow-md border border-border-color">
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Test Event Code (optionnel, server-side uniquement)
                </label>
                <input
                    type="text"
                    value={testEventCode}
                    onChange={(e) => setTestEventCode(e.target.value)}
                    placeholder="Ex: TEST31156"
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-text-secondary mt-1">
                    S'applique aux appels server-side Meta et TikTok. Laisse vide pour envoyer sans code de test.
                </p>
            </div>

            <ProviderSection
                provider="meta"
                label="Meta (Facebook)"
                color="blue"
                testEventCode={testEventCode}
            />

            <ProviderSection
                provider="tiktok"
                label="TikTok"
                color="pink"
                testEventCode={testEventCode}
            />
        </div>
    );
}

function ProviderSection({ provider, label, color, testEventCode }: {
    provider: Provider;
    label: string;
    color: "blue" | "pink";
    testEventCode: string;
}) {
    const [pixelLoading, setPixelLoading] = useState(false);
    const [pixelResult, setPixelResult] = useState<ButtonResult | null>(null);
    const [serverLoading, setServerLoading] = useState(false);
    const [serverResult, setServerResult] = useState<TrackingTestResponse | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const colorClasses = color === "blue"
        ? "border-blue-200 dark:border-blue-800"
        : "border-pink-200 dark:border-pink-800";

    const buttonColor = color === "blue"
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-pink-600 hover:bg-pink-700";

    const handlePixel = async () => {
        setPixelLoading(true);
        setPixelResult(null);

        try {
            const eventId = crypto.randomUUID();
            const params = { content_type: "test", content_ids: ["admin_test"] };

            if (provider === "meta") {
                await FacebookPixelService.forceInitialize();
                FacebookPixelService.trackEvent("ViewContent", params, eventId);
            } else {
                await TikTokPixelService.forceInitialize();
                TikTokPixelService.trackEvent("ViewContent", params, eventId);
            }

            setPixelResult({
                success: true,
                message: `Event ViewContent envoyé via pixel (eventId: ${eventId.slice(0, 8)}...)`,
            });
        } catch (e) {
            setPixelResult({
                success: false,
                message: e instanceof Error ? e.message : "Erreur inconnue",
            });
        } finally {
            setPixelLoading(false);
        }
    };

    const handleServer = async () => {
        setServerLoading(true);
        setServerResult(null);
        setServerError(null);

        try {
            const result = await AdminService.sendTrackingTestEvent(
                provider,
                testEventCode || undefined,
            );
            setServerResult(result);
        } catch (e) {
            setServerError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setServerLoading(false);
        }
    };

    return (
        <div className={`bg-primary rounded-xl p-5 shadow-md border ${colorClasses}`}>
            <h2 className="text-lg font-bold text-text-primary mb-4">{label}</h2>

            <div className="space-y-3">
                <TrackingButton
                    label="Pixel (client-side)"
                    loading={pixelLoading}
                    onClick={handlePixel}
                    colorClass={buttonColor}
                />

                {pixelResult && (
                    <ResultBanner success={pixelResult.success} message={pixelResult.message} />
                )}

                <TrackingButton
                    label="Server-side (CAPI)"
                    loading={serverLoading}
                    onClick={handleServer}
                    colorClass={buttonColor}
                />

                {serverResult && (
                    <div className={`p-3 rounded-lg border ${serverResult.success
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-semibold ${serverResult.success
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            }`}>
                                {serverResult.success ? "Succès" : "Erreur"} — HTTP {serverResult.statusCode}
                            </span>
                        </div>
                        <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                            {formatJson(serverResult.responseBody)}
                        </pre>
                    </div>
                )}

                {serverError && (
                    <ResultBanner success={false} message={serverError} />
                )}
            </div>
        </div>
    );
}

function TrackingButton({ label, loading, onClick, colorClass }: {
    label: string;
    loading: boolean;
    onClick: () => void;
    colorClass: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`w-full px-4 py-3 ${colorClass} text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                </span>
            ) : (
                label
            )}
        </button>
    );
}

function ResultBanner({ success, message }: { success: boolean; message: string }) {
    return (
        <div className={`p-3 rounded-lg border ${success
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        }`}>
            <p className={`text-sm ${success
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}>
                {message}
            </p>
        </div>
    );
}

function formatJson(str: string): string {
    try {
        return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
        return str;
    }
}
