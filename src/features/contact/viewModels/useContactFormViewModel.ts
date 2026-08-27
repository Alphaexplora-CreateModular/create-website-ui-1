import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { contactService } from "../../../shared/models/contactService";

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

type SubmissionState = "idle" | "loading" | "success" | "error";

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
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleChange =
    (field: keyof ContactFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((previous) => ({ ...previous, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionState("loading");
    setErrorMessage("");
    setSuccessMessage("");

    const response = await contactService.submitConsultationRequest(form);

    if (response.success) {
      setSubmissionState("success");
      setSuccessMessage(response.message);
      setForm(INITIAL_FORM);
      // Reset success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setSubmissionState("error");
      setErrorMessage(response.error || response.message);
    }
  };

  return {
    data: {
      fields: CONTACT_FIELDS,
      buttonLabel: "Request a Consultation",
    },
    state: {
      form,
      submissionState,
      errorMessage,
      successMessage,
    },
    actions: {
      handleChange,
      handleSubmit,
    },
  };
}

export type ContactFormViewModel = ReturnType<typeof useContactFormViewModel>;