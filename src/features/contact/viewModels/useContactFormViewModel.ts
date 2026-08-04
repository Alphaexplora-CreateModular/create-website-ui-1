import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactField = {
  name: keyof ContactFormValues;
  label: string;
  type: "text" | "email" | "tel";
  rows?: number;
};

const INITIAL_FORM: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const CONTACT_FIELDS: ContactField[] = [
  { name: "firstName", label: "First Name", type: "text" },
  { name: "lastName", label: "Last Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  {
    name: "message",
    label: "Tell us about your project",
    type: "text",
    rows: 2,
  },
];

export function useContactFormViewModel() {
  const [form, setForm] = useState<ContactFormValues>(INITIAL_FORM);

  const handleChange =
    (field: keyof ContactFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((previous) => ({ ...previous, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Consultation request:", form);
  };

  return {
    data: {
      fields: CONTACT_FIELDS,
      buttonLabel: "Request a Consultation",
    },
    state: {
      form,
    },
    actions: {
      handleChange,
      handleSubmit,
    },
  };
}

export type ContactFormViewModel = ReturnType<typeof useContactFormViewModel>;