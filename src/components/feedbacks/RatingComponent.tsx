import { useCallback, useRef } from "react";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { lightHaptic } from "../../haptics/light";
import type { FeedbackComponentProps, RatingComponentSchema } from "./types";

function HalfStar({ className }: { className: string }) {
  return (
    <span className="relative inline-block w-8 h-8">
      <StarOutline className={`absolute inset-0 w-8 h-8 ${className}`} />
      <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
        <StarSolid className="w-8 h-8 text-amber-400" />
      </span>
    </span>
  );
}

export default function RatingComponent({
  schema,
  value,
  onChange,
  onInteract,
}: FeedbackComponentProps<RatingComponentSchema>) {
  const { label, min, max, step: stepProp, required } = schema.props;
  const step = stepProp ?? 1;
  const allowHalf = step <= 0.5;
  const currentValue = typeof value === "number" ? value : 0;
  const stars = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastSnapRef = useRef<number>(0);

  const setValueWithHaptic = useCallback(
    (val: number) => {
      if (val !== lastSnapRef.current) {
        lastSnapRef.current = val;
        lightHaptic();
        onChange(val);
      }
    },
    [onChange]
  );

  const snapValue = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return currentValue;
      const children = Array.from(container.children) as HTMLElement[];

      for (let i = children.length - 1; i >= 0; i--) {
        const rect = children[i].getBoundingClientRect();
        if (clientX >= rect.left) {
          if (allowHalf) {
            const mid = rect.left + rect.width / 2;
            const val = clientX < mid ? min + i - 0.5 : min + i;
            return Math.max(0.5, Math.min(val, max));
          }
          return Math.max(min, Math.min(min + i, max));
        }
      }

      return allowHalf ? 0.5 : min;
    },
    [min, max, currentValue, allowHalf]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setValueWithHaptic(snapValue(e.clientX));
    },
    [snapValue, setValueWithHaptic]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      setValueWithHaptic(snapValue(e.clientX));
    },
    [snapValue, setValueWithHaptic]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const val = snapValue(e.clientX);
      setValueWithHaptic(val);
      onInteract?.(val);
    },
    [snapValue, setValueWithHaptic, onInteract]
  );

  const renderStar = (star: number) => {
    if (allowHalf) {
      const diff = currentValue - star + 1;
      if (diff >= 1) {
        return <StarSolid className="w-8 h-8 text-amber-400" />;
      }
      if (diff >= 0.5) {
        return <HalfStar className="text-text-secondary" />;
      }
      return <StarOutline className="w-8 h-8 text-text-secondary" />;
    }
    return star <= currentValue ? (
      <StarSolid className="w-8 h-8 text-amber-400" />
    ) : (
      <StarOutline className="w-8 h-8 text-text-secondary" />
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        ref={containerRef}
        className="flex gap-1 select-none touch-none mx-auto"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {stars.map((star) => (
          <div
            key={star}
            className="p-1 cursor-pointer w-10 h-10 flex items-center justify-center"
            aria-label={`${star} sur ${max}`}
          >
            {renderStar(star)}
          </div>
        ))}
      </div>
      {currentValue > 0 && (
        <span className="text-xs text-text-secondary text-center">
          {Number.isInteger(currentValue) ? currentValue : currentValue.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
}
