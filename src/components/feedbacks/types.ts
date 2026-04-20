export type FeedbackComponentType =
  | "title"
  | "text"
  | "rating"
  | "text_input"
  | "choice"
  | "link"
  | "button"
  | "contact_opt_in";

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
    step?: number;
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

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface ChoiceComponentSchema extends BaseFeedbackComponent {
  type: "choice";
  props: {
    label: string;
    options: ChoiceOption[];
    required?: boolean;
  };
}

export interface LinkComponentSchema extends BaseFeedbackComponent {
  type: "link";
  props: {
    label: string;
    url: string;
    external?: boolean;
    trackEvent?: string;
  };
}

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonComponentSchema extends BaseFeedbackComponent {
  type: "button";
  props: {
    label: string;
    action: "submit" | "dismiss" | "open_url" | "open_paywall";
    url?: string;
    variant?: ButtonVariant;
    trackEvent?: string;
  };
}

export interface ContactOptInComponentSchema extends BaseFeedbackComponent {
  type: "contact_opt_in";
  props: {
    checkboxLabel: string;
    inputLabel: string;
    inputPlaceholder?: string;
  };
}

export type FeedbackComponentSchema =
  | TitleComponentSchema
  | TextComponentSchema
  | RatingComponentSchema
  | TextInputComponentSchema
  | ChoiceComponentSchema
  | LinkComponentSchema
  | ButtonComponentSchema
  | ContactOptInComponentSchema;

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
