import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import type { FeedbackComponentProps, RatingComponentSchema } from "./types";

export default function RatingComponent({
  schema,
  value,
  onChange,
  onInteract,
}: FeedbackComponentProps<RatingComponentSchema>) {
  const { label, min, max, required } = schema.props;
  const currentValue = typeof value === "number" ? value : 0;
  const stars = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handleClick = (star: number) => {
    onChange(star);
    onInteract?.(star);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-1">
        {stars.map((star) => {
          const filled = star <= currentValue;
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
              aria-label={`${star} sur ${max}`}
            >
              {filled ? (
                <StarSolid className="w-8 h-8 text-amber-400" />
              ) : (
                <StarOutline className="w-8 h-8 text-text-secondary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
