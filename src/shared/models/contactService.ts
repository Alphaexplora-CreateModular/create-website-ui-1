import type { ContactFormValues } from "../../features/contact/viewModels/useContactFormViewModel";

export interface ContactApiResponse {
  success: boolean;
  message: string;
  data?: {
    requestId: string;
  };
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const contactService = {
  async submitConsultationRequest(
    formData: ContactFormValues
  ): Promise<ContactApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit form");
      }

      const data: ContactApiResponse = await response.json();
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred";

      return {
        success: false,
        message: "Failed to submit your request",
        error: message,
      };
    }
  },
};
