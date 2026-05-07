import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    ArrowsRightLeftIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    FireIcon,
    LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
    RecipeV2IngredientDTO,
    RecipeV2StepDTO,
    RecipeV2StepIngredientUsedDTO,
} from "../../api/interfaces/v2/RecipeV2";
import { formatHeatingSurfaceV2, formatQuantityV2 } from "./recipeV2Labels";
import { isMeaningfulText } from "./isMeaningfulText";
import { mediumHaptic } from "../../haptics/medium";

interface RecipeStepsListV2Props {
    steps: RecipeV2StepDTO[];
    ingredients?: RecipeV2IngredientDTO[];
}

export default function RecipeStepsListV2({ steps, ingredients = [] }: RecipeStepsListV2Props) {
    const [highlightedUuid, setHighlightedUuid] = useState<string | null>(null);

    const sorted = useMemo(() => {
        return [...steps].sort((a, b) => {
            if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
            return a.stepKey - b.stepKey;
        });
    }, [steps]);

    const ingredientsByName = useMemo(() => {
        const map = new Map<string, RecipeV2IngredientDTO>();
        for (const ing of ingredients) {
            map.set(normalizeIngredientName(ing.name), ing);
        }
        return map;
    }, [ingredients]);

    if (sorted.length === 0) {
        return (
            <p className="text-sm text-text-secondary italic">
                Aucune étape renseignée.
            </p>
        );
    }

    return (
        <ol className="space-y-4">
            {sorted.map((step, index) => (
                <StepRow
                    key={step.uuid}
                    step={step}
                    index={index + 1}
                    ingredientsByName={ingredientsByName}
                    highlighted={highlightedUuid === step.uuid}
                    onToggleHighlight={() =>
                        setHighlightedUuid((current) => (current === step.uuid ? null : step.uuid))
                    }
                />
            ))}
        </ol>
    );
}

function StepRow({
    step,
    index,
    ingredientsByName,
    highlighted,
    onToggleHighlight,
}: {
    step: RecipeV2StepDTO;
    index: number;
    ingredientsByName: Map<string, RecipeV2IngredientDTO>;
    highlighted: boolean;
    onToggleHighlight: () => void;
}) {
    const handleClick = () => {
        onToggleHighlight();
        mediumHaptic();
    };

    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const isPassive = step.stepType === "PASSIVE";
    const heatingLabel = formatHeatingSurfaceV2(step.heatingSurface);
    const temperatureLabel = step.temperatureC ? `${step.temperatureC}°C` : null;
    const hasHeatingInfo = heatingLabel || temperatureLabel || step.heatingIntensityLabel;
    const durationLabel = step.durationMin && step.durationMin > 0 ? `${step.durationMin} min` : null;
    const restLabel = step.restMin && step.restMin > 0 ? `Repos ${step.restMin} min` : null;

    const hasTitle = isMeaningfulText(step.title);
    const hasEquipments = !!(step.equipments && step.equipments.length > 0);
    const hasMeta =
        durationLabel !== null ||
        restLabel !== null ||
        !!hasHeatingInfo ||
        step.isParallelizable ||
        hasEquipments;

    const renderMetaTags = () => (
        <>
            {hasEquipments && step.equipments!.map((equipment) => (
                <span
                    key={equipment}
                    className="text-[11px] px-2 py-0.5 rounded-md border border-border-color bg-primary text-text-secondary"
                >
                    {equipment}
                </span>
            ))}
            {hasHeatingInfo && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                    <FireIcon className="w-3.5 h-3.5" />
                    {[heatingLabel, temperatureLabel, step.heatingIntensityLabel]
                        .filter(Boolean)
                        .join(" · ")}
                </span>
            )}
            {step.isParallelizable && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cout-purple/10 text-cout-purple">
                    <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                    En parallèle
                </span>
            )}
            {restLabel && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-text-secondary">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {restLabel}
                </span>
            )}
            {durationLabel && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-text-secondary">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {durationLabel}
                </span>
            )}
        </>
    );

    const { segments, matchedNames } = useMemo(
        () => buildInstructionSegments(step.instruction, step.ingredientsUsed ?? []),
        [step.instruction, step.ingredientsUsed],
    );
    const remainingUsedIngredients = (step.ingredientsUsed ?? []).filter(
        (i) => !matchedNames.has(i.name),
    );

    return (
        <li
            onClick={handleClick}
            className="flex gap-3 cursor-pointer rounded-xl px-3 py-2 transition-all duration-300 ease-out origin-center md:hover:bg-secondary/50 md:hover:shadow-md"
            style={{
                transform: highlighted ? "scale(1)" : "scale(0.97)",
                background: highlighted ? "var(--color-secondary)" : undefined,
                boxShadow: highlighted ? "0 4px 12px rgba(0,0,0,0.08)" : undefined,
            }}
        >
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isPassive
                        ? "bg-secondary text-text-secondary"
                        : "bg-cout-base text-white"
                }`}
                aria-label={isPassive ? "Étape passive" : "Étape active"}
            >
                {index}
            </div>
            <div className="flex-1 min-w-0 text-left">
                {hasTitle && (
                    <>
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                            <h3 className="font-semibold text-text-primary">
                                {step.title}
                            </h3>
                            {hasMeta && (
                                <div className="hidden md:flex flex-wrap gap-1.5 flex-shrink-0 justify-end">
                                    {renderMetaTags()}
                                </div>
                            )}
                        </div>
                        {hasMeta && (
                            <div className="flex md:hidden flex-wrap gap-1.5 mb-2">
                                {renderMetaTags()}
                            </div>
                        )}
                    </>
                )}
                <p className="text-text-primary whitespace-pre-line break-words">
                    {segments.map((segment, idx) => {
                        if (segment.type === "text") {
                            return <span key={`t-${idx}`}>{segment.text}</span>;
                        }
                        return (
                            <IngredientUsedChip
                                key={`c-${idx}`}
                                ingredientUsed={segment.ingredient!}
                                ingredientsByName={ingredientsByName}
                                inline
                            />
                        );
                    })}
                </p>

                {remainingUsedIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {remainingUsedIngredients.map((ingredientUsed, idx) => (
                            <IngredientUsedChip
                                key={`${step.uuid}-${idx}-${ingredientUsed.name}`}
                                ingredientUsed={ingredientUsed}
                                ingredientsByName={ingredientsByName}
                            />
                        ))}
                    </div>
                )}

                {!hasTitle && hasMeta && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {renderMetaTags()}
                    </div>
                )}

                {step.photoUrl && (
                    <img
                        src={step.photoUrl}
                        alt={step.title ?? `Étape ${index}`}
                        className="mt-3 rounded-lg max-h-64 object-cover w-full"
                    />
                )}

                {isMeaningfulText(step.tipFr) && (
                    <TipExpander tip={step.tipFr} stopPropagation={stopPropagation} />
                )}
            </div>
        </li>
    );
}

/**
 * Tip pill that expands into a full-width card on click. Inline pixel-valued
 * width/maxHeight/padding so the browser interpolates between two numeric values
 * (the `auto`/keyword case can't be transitioned natively).
 */
function TipExpander({
    tip,
    stopPropagation,
}: {
    tip: string;
    stopPropagation: (e: React.MouseEvent) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLSpanElement>(null);
    const tipRef = useRef<HTMLParagraphElement>(null);
    const [open, setOpen] = useState(false);
    const [closedWidth, setClosedWidth] = useState<number | null>(null);
    const [closedHeight, setClosedHeight] = useState<number | null>(null);
    const [openWidth, setOpenWidth] = useState<number | null>(null);
    const [openHeight, setOpenHeight] = useState<number | null>(null);

    const CLOSED_PADDING_X = 12; // 0.75rem
    const CLOSED_PADDING_Y = 6; // 0.375rem
    const OPEN_PADDING_X = 16; // 1rem
    const OPEN_PADDING_Y = 12; // 0.75rem
    const TIP_MARGIN_TOP = 8; // mt-2

    const measure = () => {
        const header = headerRef.current;
        const container = containerRef.current;
        const tipEl = tipRef.current;
        if (header) {
            setClosedWidth(header.offsetWidth + CLOSED_PADDING_X * 2);
            setClosedHeight(header.offsetHeight + CLOSED_PADDING_Y * 2);
        }
        if (container) {
            setOpenWidth(container.offsetWidth);
        }
        if (header && tipEl) {
            // Hauteur cible exacte du bouton ouvert : header + marge + tip + paddings.
            const headerH = header.offsetHeight;
            const tipH = tipEl.offsetHeight;
            setOpenHeight(headerH + TIP_MARGIN_TOP + tipH + OPEN_PADDING_Y * 2);
        }
    };

    useLayoutEffect(() => {
        measure();
    }, [tip]);

    useEffect(() => {
        const onResize = () => measure();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const buttonStyle: React.CSSProperties = {
        width: open ? (openWidth ?? "100%") : (closedWidth ?? "auto"),
        maxHeight: open ? (openHeight ?? 600) : (closedHeight ?? 40),
        borderRadius: 16,
        paddingLeft: open ? OPEN_PADDING_X : CLOSED_PADDING_X,
        paddingRight: open ? OPEN_PADDING_X : CLOSED_PADDING_X,
        paddingTop: open ? OPEN_PADDING_Y : CLOSED_PADDING_Y,
        paddingBottom: open ? OPEN_PADDING_Y : CLOSED_PADDING_Y,
        transition: "all 400ms ease-in-out",
        overflow: "hidden",
    };

    return (
        <div ref={containerRef} className="mt-3 w-full" onClick={stopPropagation}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                style={buttonStyle}
                className="block text-left text-sm font-semibold text-cout-base bg-cout-yellow/20 border border-cout-yellow/50 hover:bg-cout-yellow/30"
            >
                <span ref={headerRef} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <LightBulbIcon className="w-4 h-4 flex-shrink-0" />
                    <span>L'astuce</span>
                    {open ? (
                        <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                    )}
                </span>
                <p
                    ref={tipRef}
                    style={{
                        width: openWidth ? openWidth - OPEN_PADDING_X * 2 : undefined,
                        marginTop: TIP_MARGIN_TOP,
                    }}
                    className="font-normal text-text-primary leading-relaxed"
                >
                    {tip}
                </p>
            </button>
        </div>
    );
}

function findIngredientMatch(
    rawName: string,
    ingredientsByName: Map<string, RecipeV2IngredientDTO>,
): RecipeV2IngredientDTO | null {
    const normalized = normalizeIngredientName(rawName);
    if (!normalized) return null;
    const exact = ingredientsByName.get(normalized);
    if (exact) return exact;
    for (const [key, ingredient] of ingredientsByName.entries()) {
        if (!key) continue;
        if (normalized.includes(key) || key.includes(normalized)) {
            return ingredient;
        }
    }
    return null;
}

function normalizeIngredientName(s: string): string {
    return s
        .toLowerCase()
        .trim()
        .replace(/[‘’ʼ]/g, "'")
        .replace(/œ/g, "oe")
        .replace(/æ/g, "ae")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/s$/, "");
}

const ACCENT_CLASSES: Record<string, string> = {
    a: "[aàâäáã]",
    e: "[eéèêë]",
    i: "[iîïíì]",
    o: "[oôöóò]",
    u: "[uùûüúì]",
    c: "[cç]",
    n: "[nñ]",
};

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTokenPattern(token: string): string {
    const stripped = token.replace(/s$/, "");
    let pattern = "";
    for (let i = 0; i < stripped.length; i++) {
        const ch = stripped[i];
        const next = stripped[i + 1];
        if (ch === "o" && next === "e") {
            pattern += "(?:o[eéèêë]|œ)";
            i++;
            continue;
        }
        if (ch === "a" && next === "e") {
            pattern += "(?:a[eéèêë]|æ)";
            i++;
            continue;
        }
        if (ch === "'") {
            pattern += "[''ʼ']";
            continue;
        }
        pattern += ACCENT_CLASSES[ch] ?? escapeRegex(ch);
    }
    pattern += "s?";
    return pattern;
}

/**
 * Builds a tolerant regex matching an ingredient name in a free-text instruction.
 * Tolerates: case, accent variants, œ↔oe / æ↔ae, curly/straight apostrophes,
 * per-word optional trailing `s` (so "olives vertes" matches "olive verte" too),
 * and Unicode word boundaries (`\b` doesn't work on é/œ/etc.).
 */
function buildIngredientRegex(name: string): RegExp | null {
    const normalized = normalizeIngredientName(name);
    if (!normalized) return null;
    const tokens = normalized.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return null;
    const fullPattern = tokens.map(buildTokenPattern).join("\\s+");
    return new RegExp(`(?<![\\p{L}])${fullPattern}(?![\\p{L}])`, "giu");
}

const STOP_TRAILING_TOKENS = new Set([
    "de", "du", "des", "le", "la", "les", "au", "aux", "en", "et", "ou", "à", "a",
    "d'", "l'", "d", "l",
]);

function isStopTrailingToken(token: string): boolean {
    return STOP_TRAILING_TOKENS.has(
        token.toLowerCase().replace(/[‘’ʼ]/g, "'"),
    );
}

/**
 * Generates progressively shorter prefixes of an ingredient name so we can match
 * the "head" form when the instruction text uses a less specific phrasing —
 * e.g. "Huile d'olive extra vierge" → ["...extra vierge", "...extra", "huile d'olive", "huile"].
 * Variants ending in connector words ("de", "d'", ...) are skipped since they'd
 * cut mid-phrase. Variants are returned longest-first.
 */
function generateNameVariants(name: string): string[] {
    const trimmed = name.trim();
    if (!trimmed) return [];
    const tokens = trimmed.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return [];
    const variants: string[] = [];
    for (let i = tokens.length; i >= 1; i--) {
        if (isStopTrailingToken(tokens[i - 1])) continue;
        const candidate = tokens.slice(0, i).join(" ");
        if (normalizeIngredientName(candidate).length >= 3) {
            variants.push(candidate);
        }
    }
    return variants;
}

interface InstructionSegment {
    type: "text" | "chip";
    text?: string;
    ingredient?: RecipeV2StepIngredientUsedDTO;
}

/**
 * Splits an instruction string into segments — plain text or matched ingredient chips.
 * For each ingredient, we collect hits from every prefix variant of its name (longest
 * to shortest, with connector words trimmed off the tail). All hits then go through
 * a single non-overlap pass that keeps the longest span at each position; ties are
 * broken in favour of the ingredient whose full name is more specific. This way
 * "huile d'olive extra vierge" and a later bare "huile" both get chipped to the
 * same ingredient, while a competing "huile de tournesol" doesn't steal the bare
 * "huile" if a more specific oil is the rightful owner of that span.
 */
function buildInstructionSegments(
    instruction: string,
    ingredientsUsed: RecipeV2StepIngredientUsedDTO[],
): { segments: InstructionSegment[]; matchedNames: Set<string> } {
    const matchedNames = new Set<string>();
    if (!ingredientsUsed.length) {
        return {
            segments: [{ type: "text", text: instruction }],
            matchedNames,
        };
    }

    type Hit = { start: number; end: number; ingredient: RecipeV2StepIngredientUsedDTO };
    const hits: Hit[] = [];

    for (const used of ingredientsUsed) {
        const variants = generateNameVariants(used.name);
        const seenSpans = new Set<string>();
        for (const variant of variants) {
            const regex = buildIngredientRegex(variant);
            if (!regex) continue;
            let m: RegExpExecArray | null;
            while ((m = regex.exec(instruction)) !== null) {
                const start = m.index;
                const end = start + m[0].length;
                const key = `${start}:${end}`;
                if (seenSpans.has(key)) continue;
                seenSpans.add(key);
                hits.push({ start, end, ingredient: used });
            }
        }
    }

    hits.sort((a, b) =>
        a.start - b.start ||
        b.end - a.end ||
        b.ingredient.name.length - a.ingredient.name.length,
    );
    const accepted: Hit[] = [];
    let cursor = 0;
    for (const hit of hits) {
        if (hit.start < cursor) continue;
        accepted.push(hit);
        cursor = hit.end;
        matchedNames.add(hit.ingredient.name);
    }

    if (accepted.length === 0) {
        return {
            segments: [{ type: "text", text: instruction }],
            matchedNames,
        };
    }

    const segments: InstructionSegment[] = [];
    let pos = 0;
    for (const hit of accepted) {
        if (hit.start > pos) {
            segments.push({ type: "text", text: instruction.slice(pos, hit.start) });
        }
        segments.push({ type: "chip", ingredient: hit.ingredient });
        pos = hit.end;
    }
    if (pos < instruction.length) {
        segments.push({ type: "text", text: instruction.slice(pos) });
    }
    return { segments, matchedNames };
}

function IngredientUsedChip({
    ingredientUsed,
    ingredientsByName,
    inline = false,
}: {
    ingredientUsed: RecipeV2StepIngredientUsedDTO;
    ingredientsByName: Map<string, RecipeV2IngredientDTO>;
    inline?: boolean;
}) {
    const match = findIngredientMatch(ingredientUsed.name, ingredientsByName);
    const emoji = match?.emoji ?? null;
    const quantityLabel = formatQuantityV2(ingredientUsed.quantity, ingredientUsed.unitCode);
    const parts = [
        emoji,
        ingredientUsed.name,
        quantityLabel ? `· ${quantityLabel}` : null,
    ].filter(Boolean);

    const baseClasses = "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-border-color bg-secondary text-text-primary";
    const inlineClasses = inline ? "align-middle mx-0.5 whitespace-nowrap" : "";

    return (
        <span className={`${baseClasses} ${inlineClasses}`}>
            {parts.join(" ")}
        </span>
    );
}
