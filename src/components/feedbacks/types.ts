export type FeedbackComponentType =
  | "title"
  | "text"
  | "rating"
  | "text_input";

export interface BaseFeedbackComponent {
  type: FeedbackComponentType;
  id: string;
}

export interface TitleComponentSchema extends BaseFeedbackComponent {
  type: "title";
  props: { text: string };
}

export type TextVariant = "default" | "muted" | "warning";

export interface TextComponentSchema extends BaseFeedbackComponent {
  type: "text";
  props: { text: string; variant?: TextVariant };
}

export interface RatingRedirect {
  value: number;
  url: string;
  trackEvent?: string;
}

export interface RatingComponentSchema extends BaseFeedbackComponent {
  type: "rating";
  props: {
    label: string;
    min: number;
    max: number;
    required?: boolean;
    redirectOnValue?: RatingRedirect;
  };
}

export interface TextInputComponentSchema extends BaseFeedbackComponent {
  type: "text_input";
  props: {
    label: string;
    placeholder?: string;
    multiline?: boolean;
    maxLength?: number;
    required?: boolean;
  };
}

export type FeedbackComponentSchema =
  | TitleComponentSchema
  | TextComponentSchema
  | RatingComponentSchema
  | TextInputComponentSchema;

export interface FeedbackFormMeta {
  templateId?: string;
  version?: number;
  title: string;
}

export interface FeedbackForm {
  meta: FeedbackFormMeta;
  components: FeedbackComponentSchema[];
}

export interface FeedbackPayload {
  id: string;
  templateId: string;
  form: FeedbackForm;
  triggerEvent: string | null;
  priority: number;
  showAfterSeconds: number;
  dismissable: boolean;
  createdAt: string;
}

export type FeedbackAnswerValue = string | number | boolean | null;

export type FeedbackAnswers = Record<string, FeedbackAnswerValue>;

export interface FeedbackComponentProps<T extends FeedbackComponentSchema = FeedbackComponentSchema> {
  schema: T;
  value: FeedbackAnswerValue;
  onChange: (value: FeedbackAnswerValue) => void;
  onInteract?: (value: FeedbackAnswerValue) => void;
}
