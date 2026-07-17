"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  DoorClosed,
  Tv,
  BedDouble,
  Briefcase,
  ConciergeBell,
  Grid,
  PenTool,
  type LucideIcon,
} from "lucide-react";

interface OfferItem {
  title: string;
  description: string;
  Icon: LucideIcon;
}

const offers: OfferItem[] = [
  {
    title: "Modular Kitchen Cabinets",
    description:
      "Functional and elegant kitchen solutions designed around your lifestyle.",
    Icon: ChefHat,
  },
  {
    title: "Wardrobes & Closets",
    description:
      "Custom-built wardrobes with smart storage and premium finishes.",
    Icon: DoorClosed,
  },
  {
    title: "TV Consoles & Units",
    description:
      "Modern entertainment centers designed to complement your living space.",
    Icon: Tv,
  },
  {
    title: "Bedroom Cabinets",
    description:
      "Built-in storage that maximizes space while staying beautifully clean.",
    Icon: BedDouble,
  },
  {
    title: "Office Furniture",
    description:
      "Workstations, executive tables, filing cabinets, and full office interiors.",
    Icon: Briefcase,
  },
  {
    title: "Reception Counters",
    description:
      "Professionally designed reception areas that make a lasting impression.",
    Icon: ConciergeBell,
  },
  {
    title: "Display Cabinets & Shelving",
    description:
      "Organized, stylish storage for retail, offices, and residential spaces.",
    Icon: Grid,
  },
  {
    title: "Customized Furniture",
    description:
      "Unique furniture pieces designed specifically for your space and needs.",
    Icon: PenTool,
  },
];

export default function Offers() {
  return (
    <section className="bg-white text-neutral-900 py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.span
            className="text-[#3a2f2a] text-sm md:text-base tracking-widest uppercase font-semibold mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            What we build
          </motion.span>

          <motion.h2
            className="text-4xl md:text-6xl tracking-wide uppercase leading-tight text-[#3a2f2a]"
            style={{ fontFamily: "'The Bold Font', sans-serif" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          >
            Custom solutions for every space
          </motion.h2>
        </div>

        {/* Grid Container */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {offers.map((offer, index) => {
            const IconComponent = offer.Icon;
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut" },
                  },
                }}
                whileHover={{
                  y: -8,
                  backgroundColor: "#ffffff",
                  borderColor: "rgba(58, 47, 42, 0.6)", // Hover state highlights using your brown color
                  boxShadow:
                    "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
                }}
                className="group flex flex-col p-8 bg-neutral-50 border border-neutral-200/80 transition-all duration-300 rounded-sm"
              >
                {/* Lucide Icon Wrapper */}
                <div className="text-[#3a2f2a] mb-6 transform group-hover:scale-110 transition-all duration-300">
                  <IconComponent size={32} strokeWidth={1.5} />
                </div>

                {/* Offer Title */}
                <h3
                  className="text-lg md:text-xl tracking-wider uppercase mb-3 text-neutral-800 group-hover:text-[#3a2f2a] transition-colors duration-300"
                  style={{ fontFamily: "'The Bold Font', sans-serif" }}
                >
                  {offer.title}
                </h3>

                {/* Offer Description */}
                <p
                  className="text-neutral-500 text-sm leading-relaxed mt-auto group-hover:text-neutral-600 transition-colors duration-300"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {offer.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export { Offers };
