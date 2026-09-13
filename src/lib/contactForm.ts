export const NEED_OPTIONS = ["Buy compute", "Post-train agents", "Both", "Not sure yet"] as const;
export const STAGE_OPTIONS = ["Exploring", "Prototype", "In production", "Already spending money on RL/post-training"] as const;

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  website: string;
  need: string;
  stage: string;
  message: string;
};

export type ContactFormField = keyof ContactFormValues;
export type ContactFormErrors = Partial<Record<ContactFormField, string>>;

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  website: "",
  need: "",
  stage: "",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED_MESSAGE = "This field is required.";

export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());

/** Accepts "example.com", "www.example.com" and full http(s) URLs. */
export const isValidWebsite = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return /^https?:$/.test(url.protocol) && url.hostname.includes(".");
  } catch {
    return false;
  }
};

const validators: Readonly<Record<ContactFormField, (value: string) => string | undefined>> = {
  firstName: (v) => (v.trim() ? undefined : REQUIRED_MESSAGE),
  lastName: (v) => (v.trim() ? undefined : REQUIRED_MESSAGE),
  email: (v) => (!v.trim() ? REQUIRED_MESSAGE : isValidEmail(v) ? undefined : "Enter a valid work email."),
  website: (v) => (!v.trim() ? REQUIRED_MESSAGE : isValidWebsite(v) ? undefined : "Enter a valid website URL."),
  need: (v) => (v ? undefined : "Select an option."),
  stage: (v) => (v ? undefined : "Select an option."),
  message: (v) => (v.trim() ? undefined : REQUIRED_MESSAGE),
};

export const validateField = (field: ContactFormField, value: string): string | undefined => validators[field](value);

/** Returns a new errors object; empty when the form is valid. */
export const validateContactForm = (values: ContactFormValues): ContactFormErrors =>
  (Object.keys(validators) as ContactFormField[]).reduce<ContactFormErrors>((errors, field) => {
    const error = validateField(field, values[field]);
    return error ? { ...errors, [field]: error } : errors;
  }, {});

export const isFormValid = (errors: ContactFormErrors): boolean => Object.keys(errors).length === 0;

/** Immutable field update helper. */
export const updateField = (values: ContactFormValues, field: ContactFormField, value: string): ContactFormValues => ({
  ...values,
  [field]: value,
});
