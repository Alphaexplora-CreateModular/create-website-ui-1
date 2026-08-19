export type ProjectItem = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  year: string;
  image: string;
  fallbackImage: string;
  description: string;
};

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "01",
    title: "FAMILY KITCHEN",
    subtitle: "Modern Warm Minimalism & Craftsmanship",
    category: "Residential Interior",
    location: "Los Angeles, CA",
    year: "2024",
    image: "/images/project_1.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85",
    description:
      "Custom oak cabinetry featuring integrated state-of-the-art appliances, Calacatta marble island, and tailored ergonomic seating.",
  },
  {
    id: "02",
    title: "LUXURY PENTHOUSE",
    subtitle: "Contemporary Architectural Living",
    category: "Architecture & Design",
    location: "New York, NY",
    year: "2024",
    image: "/images/project_2.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    description:
      "Panoramic city views complemented by rich natural textures, smoked glass accents, and understated monolithic furniture.",
  },
  {
    id: "03",
    title: "OAKWOOD VILLA",
    subtitle: "Organic Textures & Clean Lines",
    category: "Residential Architecture",
    location: "San Francisco, CA",
    year: "2023",
    image: "/images/project_3.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=85",
    description:
      "Seamless indoor-outdoor transitions highlighted by custom timber louvers, exposed concrete walls, and serene courtyard garden views.",
  },
  {
    id: "04",
    title: "MODERN SUITE",
    subtitle: "Sophisticated Interior Detailing",
    category: "Bespoke Interiors",
    location: "Chicago, IL",
    year: "2023",
    image: "/images/project_4.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85",
    description:
      "A masterclass in shadow and light—sculptural brass light fixtures paired with Venetian plaster finishes and plush custom velvet upholstery.",
  },
  {
    id: "05",
    title: "MINIMALIST STUDIO",
    subtitle: "Functional Elegance & Natural Light",
    category: "Commercial & Creative Space",
    location: "Seattle, WA",
    year: "2023",
    image: "/images/project_5.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
    description:
      "Optimized open studio space designed for creative collaboration, utilizing bleached ash wood flooring and raw aluminum hardware.",
  },
];

export const MODEL_SHOWCASE = {
  eyebrow: "Interactive 3D Preview",
  title: "See It Before It's Built",
  description:
    "Experience your modular interior through a realistic 3D model. Explore every detail, from cabinetry to finishes, and confidently visualize your space before installation.",
  bullets: [
    "360° interactive viewing",
    "Accurate real-world dimensions",
    "Browser-based, no downloads required",
  ],
};