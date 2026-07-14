"use client";

import { useCallback, useState } from "react";

type Project = {
  image: string;
  title: string;
  description: string;
};

const projects: Project[] = [
  {
    image: "/public/couch.png",
    title: "Sample Title",
    description:
      "We discuss your needs, style preferences, budget, and project requirements.",
  },
  {
    image: "/public/couch.png",
    title: "Modern Loft Redesign",
    description:
      "A full interior overhaul balancing warmth and minimalism for city living.",
  },
  {
    image: "/public/couch.png",
    title: "Coastal Retreat",
    description:
      "Light-filled spaces with natural textures inspired by the shoreline.",
  },
  {
    image: "/public/couch.png",
    title: "Urban Studio Refresh",
    description:
      "Compact, functional design that makes every square foot count.",
  },
  {
    image: "/public/couch.png",
    title: "Family Living Space",
    description:
      "Durable, welcoming interiors designed around everyday family life.",
  },
];

const MAX_VISIBLE_OFFSET = 2;

// Keep this in sync with the section's bg-[#3a2f2a] below. Centralizing it
// here means the fade gradients always match the background exactly.
const BG_COLOR = "#3a2f2a";

export default function ProjectsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const total = projects.length;

  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      setDirection(dir);
      setActiveIndex(((index % total) + total) % total);
    },
    [total],
  );

  const handlePrev = () => goTo(activeIndex - 1, "prev");
  const handleNext = () => goTo(activeIndex + 1, "next");

  const getOffset = (index: number) => {
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  };

  return (
    <section className="flex flex-col items-center bg-[#3a2f2a] py-20 px-4">
      <div className="flex flex-col items-center justify-center gap-2 text-center mb-14">
        <h2 className="projects-title text-4xl md:text-5xl tracking-wide text-white uppercase">
          Our Projects
        </h2>
        <p className="projects-subtitle text-white/70 text-base md:text-lg">
          Designed for Living. Built for You.
        </p>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[min(100vw-48px,1800px)]">
        <button
          onClick={handlePrev}
          aria-label="Previous project"
          className="absolute left-0 z-30 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft />
        </button>

        <div className="relative h-[420px] w-full overflow-hidden [perspective:1200px]">
          {projects.map((project, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;

            if (Math.abs(offset) > MAX_VISIBLE_OFFSET) return null;

            const translateX = offset * 260;
            const scale = isActive ? 1 : Math.abs(offset) === 1 ? 0.78 : 0.62;
            const zIndex = 10 - Math.abs(offset);

            return (
              <div
                key={index}
                className="absolute left-1/2 top-1/2 transition-all duration-500 ease-in-out"
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                  opacity: 1,
                  zIndex,
                }}
              >
                <Card
                  project={project}
                  isActive={isActive}
                  onClick={() =>
                    !isActive &&
                    goTo(index, index > activeIndex ? "next" : "prev")
                  }
                />
              </div>
            );
          })}

          {/* Edge fade overlays: same color as the section background,
              fading to transparent. Sits above the offset cards (z-20)
              so the side cards visually dissolve into the background
              instead of ending on a hard clip edge. pointer-events-none
              so it never blocks clicks on the arrows above it. */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-20 h-full w-24 md:w-40"
            style={{
              background: `linear-gradient(to right, ${BG_COLOR}, transparent)`,
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 z-20 h-full w-24 md:w-40"
            style={{
              background: `linear-gradient(to left, ${BG_COLOR}, transparent)`,
            }}
          />
        </div>

        <button
          onClick={handleNext}
          aria-label="Next project"
          className="absolute right-0 z-30 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {projects.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to project ${index + 1}`}
            onClick={() => goTo(index, index > activeIndex ? "next" : "prev")}
            className={`rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "h-2.5 w-2.5 bg-white"
                : "h-2 w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// Also provide a named export for consumers importing with braces
export { ProjectsCarousel };

function Card({
  project,
  isActive,
  onClick,
}: {
  project: Project;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative w-[340px] md:w-[420px] bg-white shadow-2xl overflow-hidden ${
        isActive ? "cursor-default" : "cursor-pointer"
      }`}
      style={{ opacity: isActive ? 1 : 0.8 }}
    >
      <div className="relative">
        <div className="relative h-[220px] w-full overflow-hidden border-[10px] border-white/80">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center text-center gap-1 px-6 py-5">
          <h3 className="font-bold text-sm text-neutral-900">
            {project.title}
          </h3>
          <p className="projects-description text-xs text-neutral-500 leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
