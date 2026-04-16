import { useMemo, useState } from "react";
import Modal from "./Modal";
import { FEEDBACK_COMPONENT_REGISTRY } from "./registry";
import type {
  FeedbackAnswerValue,
  FeedbackAnswers,
  FeedbackComponentSchema,
  FeedbackPayload,
  RatingComponentSchema,
} from "./types";

interface FeedbackModalProps {
  payload: FeedbackPayload;
  isOpen: boolean;
  onSubmit: (answers: FeedbackAnswers) => void;
  onDismiss: () => void;
  onComponentInteract?: (component: FeedbackComponentSchema, value: FeedbackAnswerValue) => void;
  onRedirect?: (url: string, component: FeedbackComponentSchema, value: number) => void;
}

function getInitialValue(component: FeedbackComponentSchema): FeedbackAnswerValue {
  switch (component.type) {
    case "rating":
      return 0;
    case "text_input":
      return "";
    default:
      return null;
  }
}

function isComponentValid(component: FeedbackComponentSchema, value: FeedbackAnswerValue): boolean {
  if (component.type === "rating") {
    if (!component.props.required) return true;
    return typeof value === "number" && value >= component.props.min;
  }
  if (component.type === "text_input") {
    if (!component.props.required) return true;
    return typeof value === "string" && value.trim().length > 0;
  }
  return true;
}

export default function FeedbackModal({
  payload,
  isOpen,
  onSubmit,
  onDismiss,
  onComponentInteract,
  onRedirect,
}: FeedbackModalProps) {
  const initialAnswers = useMemo<FeedbackAnswers>(() => {
    const init: FeedbackAnswers = {};
    payload.form.components.forEach((c) => {
      init[c.id] = getInitialValue(c);
    });
    return init;
  }, [payload]);

  const [answers, setAnswers] = useState<FeedbackAnswers>(initialAnswers);

  const canSubmit = useMemo(
    () => payload.form.components.every((c) => isComponentValid(c, answers[c.id])),
    [payload, answers]
  );

  const handleChange = (id: string, value: FeedbackAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleInteract = (component: FeedbackComponentSchema, value: FeedbackAnswerValue) => {
    onComponentInteract?.(component, value);
    if (component.type === "rating" && typeof value === "number") {
      const redirect = (component as RatingComponentSchema).props.redirectOnValue;
      if (redirect && value === redirect.value) {
        onRedirect?.(redirect.url, component, value);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      title={payload.form.meta.title}
      size="md"
      showCloseButton={payload.dismissable}
    >
      <div className="flex flex-col gap-4">
        {payload.form.components.map((component) => {
          const Renderer = FEEDBACK_COMPONENT_REGISTRY[component.type];
          if (!Renderer) {
            return null;
          }
          return (
            <Renderer
              key={component.id}
              schema={component}
              value={answers[component.id]}
              onChange={(v) => handleChange(component.id, v)}
              onInteract={(v) => handleInteract(component, v)}
            />
          );
        })}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(answers)}
          className="mt-2 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </div>
    </Modal>
  );
}
