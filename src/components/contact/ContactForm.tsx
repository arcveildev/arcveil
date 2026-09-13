"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  EMPTY_CONTACT_FORM,
  isFormValid,
  NEED_OPTIONS,
  STAGE_OPTIONS,
  updateField,
  validateContactForm,
  validateField,
  type ContactFormErrors,
  type ContactFormField,
  type ContactFormValues,
} from "@/lib/contactForm";
import { FormField, INPUT_CLASS } from "./FormField";

type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; message: string };

const CONTACT_ENDPOINT = "/api/contact";
const SUCCESS_REMOTE = "Thanks — we'll be in touch shortly.";
const SUCCESS_LOCAL = "Saved locally (backend not connected yet).";

/** Returns a new errors object without the given field. */
const clearError = (errors: ContactFormErrors, field: ContactFormField): ContactFormErrors =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => key !== field)) as ContactFormErrors;

/** Posts the form; resolves true when the backend accepted it, false otherwise. Never throws. */
const submitContact = async (values: ContactFormValues): Promise<boolean> => {
  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    return res.ok;
  } catch (error) {
    console.warn("Contact form: backend unavailable", error);
    return false;
  }
};

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onChange = (field: ContactFormField) => (value: string) => {
    setValues((prev) => updateField(prev, field, value));
    setErrors((prev) => (prev[field] ? clearError(prev, field) : prev));
  };

  const onBlur = (field: ContactFormField) => () => {
    const error = validateField(field, values[field]);
    setErrors((prev) => (error ? { ...prev, [field]: error } : prev));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);
    if (!isFormValid(nextErrors)) return;

    setStatus({ kind: "submitting" });
    const accepted = await submitContact(values);
    setStatus({ kind: "success", message: accepted ? SUCCESS_REMOTE : SUCCESS_LOCAL });
    setValues(EMPTY_CONTACT_FORM);
  };

  const field = (name: ContactFormField, id: string) => ({
    id,
    name,
    value: values[name],
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${id}-error` : undefined,
    onBlur: onBlur(name),
    className: INPUT_CLASS,
  });

  if (status.kind === "success") {
    return (
      <div role="status" className="flex flex-col gap-3 border border-border p-5">
        <span className="label text-accent">Request received</span>
        <p className="text-sm text-fg-muted">{status.message}</p>
        <Button variant="secondary" onClick={() => setStatus({ kind: "idle" })}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5 border border-border p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="first-name" label="First name" error={errors.firstName}>
          <input {...field("firstName", "first-name")} type="text" autoComplete="given-name" placeholder="Ada" onChange={(e) => onChange("firstName")(e.target.value)} />
        </FormField>
        <FormField id="last-name" label="Last name" error={errors.lastName}>
          <input {...field("lastName", "last-name")} type="text" autoComplete="family-name" placeholder="Lovelace" onChange={(e) => onChange("lastName")(e.target.value)} />
        </FormField>
      </div>
      <FormField id="email" label="Work email" error={errors.email}>
        <input {...field("email", "email")} type="email" autoComplete="email" placeholder="you@company.com" onChange={(e) => onChange("email")(e.target.value)} />
      </FormField>
      <FormField id="website" label="Company website" error={errors.website}>
        <input {...field("website", "website")} type="url" autoComplete="url" placeholder="company.com" onChange={(e) => onChange("website")(e.target.value)} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="need" label="What do you need?" error={errors.need}>
          <select {...field("need", "need")} onChange={(e) => onChange("need")(e.target.value)}>
            <option value="">Select one</option>
            {NEED_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </FormField>
        <FormField id="stage" label="Where are you at?" error={errors.stage}>
          <select {...field("stage", "stage")} onChange={(e) => onChange("stage")(e.target.value)}>
            <option value="">Select one</option>
            {STAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField id="message" label="How can we help?" error={errors.message}>
        <textarea {...field("message", "message")} rows={4} placeholder="Tell us about your use case." onChange={(e) => onChange("message")(e.target.value)} />
      </FormField>
      <Button type="submit" disabled={status.kind === "submitting"} className="disabled:opacity-60">
        {status.kind === "submitting" ? "Sending…" : "Book a call"}
      </Button>
    </form>
  );
}
