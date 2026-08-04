export type ContactDetail = {
  label: string;
  value: string;
};

const CONTACT_DETAILS: ContactDetail[] = [
  { label: "Phone", value: "(555) 012-3456" },
  { label: "Email", value: "hello@oakhaus.com" },
  { label: "Address", value: "18 Maple Works, Design District" },
  { label: "Hours", value: "Mon - Sat: 8:00 AM - 5:00 PM" },
];

export function useContactHeroViewModel() {
  return {
    data: {
      title: ["LET'S", "TALK"] as const,
      details: CONTACT_DETAILS,
    },
  };
}

export type ContactHeroViewModel = ReturnType<typeof useContactHeroViewModel>;