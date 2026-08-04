export type AboutUsStep = {
  number: string;
  category: string;
  title: string;
  description: string;
  side: "left" | "right";
  to: number;
};

export type AboutUsGalleryItem = {
  number: string;
  title: string;
  description: string;
  image: string;
};

export const ABOUT_US_STEPS: AboutUsStep[] = [
  {
    number: "01",
    category: "What we do",
    title: "Modular Kitchen Cabinets",
    description:
      "Functional and elegant kitchen solutions designed around your lifestyle.",
    side: "left",
    to: 1,
  },
  {
    number: "02",
    category: "What we do",
    title: "Reception Counters",
    description:
      "Professionally designed reception areas that make a lasting impression.",
    side: "right",
    to: 2.7,
  },
  {
    number: "03",
    category: "What we do",
    title: "Office Furniture",
    description:
      "Workstations, executive tables, filing cabinets, and full office interiors.",
    side: "left",
    to: 6,
  },
];

export const ABOUT_US_GALLERY_ITEMS: AboutUsGalleryItem[] = [
  {
    number: "[04]",
    title: "Cabinets",
    description:
      "Functional and elegant kitchen solutions designed around your lifestyle. Crafted with high-grade architectural finishes.",
    image: "public/images/project_1_portrait.jpg",
  },
  {
    number: "[05]",
    title: "Workstations",
    description:
      "Ergonomic workstations, executive desks, and tailored office configurations engineered for optimal productivity.",
    image: "public/images/project_2_portrait.jpg",
  },
  {
    number: "[06]",
    title: "Reception Counters",
    description:
      "Professionally designed reception areas that establish an immediate mark of sophistication and craft.",
    image: "public/images/project_3_portrait.jpg",
  },
  {
    number: "[07]",
    title: "Storage Systems",
    description:
      "Custom-built storage solutions that maximize space while maintaining a clean, cohesive architectural language.",
    image: "public/images/project_4_portrait.jpg",
  },
  {
    number: "[08]",
    title: "Interior Fit-Outs",
    description:
      "End-to-end interior fit-outs that bring together material, form, and function into a single unified space.",
    image: "public/images/project_5_portrait.jpg",
  },
];