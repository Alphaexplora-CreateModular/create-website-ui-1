"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useProjectsCarouselViewModel } from "../viewModels/useProjectsCarouselViewModel";
import type { Project } from "../viewModels/useProjectsCarouselViewModel";

export default function ProjectsCarousel() {
  const {
    projects,
    activeIndex,
    handlePrev,
    handleNext,
    goTo,
    getOffset,
    BG_COLOR,
    MAX_VISIBLE_OFFSET,
  } = useProjectsCarouselViewModel();

  // 1. Mouse-following Blob Physics
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 120, mass: 0.8 };
  const blobX = useSpring(mouseX, springConfig);
  const blobY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Centers the interactive blob on the cursor
    mouseX.set(e.clientX - rect.left - 150);
    mouseY.set(e.clientY - rect.top - 150);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center bg-[#3a2f2a] py-20 px-4 overflow-hidden"
    >
      {/* 🔮 1. Interactive Mouse-Following Blob (Moved to z-25 to sit on top of the gradients) */}
      <motion.div
        className="pointer-events-none absolute top-0 left-0 w-[300px] h-[300px] rounded-full filter blur-[60px] opacity-35 mix-blend-screen z-25"
        style={{
          x: blobX,
          y: blobY,
          background:
            "radial-gradient(circle, rgba(234,179,8,1) 0%, rgba(249,115,22,0.4) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* 🌊 2. Autonomous Floating Blob (Moved to z-25 to sit on top of the gradients) */}
      <motion.div
        className="pointer-events-none absolute w-[350px] h-[350px] rounded-full filter blur-[80px] opacity-25 mix-blend-screen z-25"
        style={{
          background:
            "radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(120,53,4,0.3) 60%, rgba(0,0,0,0) 100%)",
        }}
        animate={{
          x: ["10vw", "70vw", "40vw", "80vw", "20vw", "10vw"],
          y: ["10vh", "50vh", "80vh", "30vh", "70vh", "10vh"],
          scale: [1, 1.2, 0.9, 1.1, 0.8, 1],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />

      {/* Header section (z-10) */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-1 text-center ">
        <motion.h2
          className="projects-title text-4xl md:text-5xl tracking-wide text-white uppercase "
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Our Projects
        </motion.h2>
        <motion.p
          className="projects-subtitle text-white/70 text-base md:text-lg"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
        >
          Quality workmanship, thoughtful design
        </motion.p>
      </div>

      {/* Carousel container (z-10 contains the carousel system) */}
      <motion.div
        className="relative z-10 flex items-center justify-center w-full max-w-[min(100vw-48px,1800px)]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
      >
        <button
          onClick={handlePrev}
          aria-label="Previous project"
          className="absolute left-0 z-30 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft />
        </button>

        <div className="relative h-105 w-full overflow-hidden perspective-distant">
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
                  index={index}
                  isActive={isActive}
                  onClick={() =>
                    !isActive &&
                    goTo(index, index > activeIndex ? "next" : "prev")
                  }
                />
              </div>
            );
          })}

          {/* Left Side Gradient Overlay (z-20) */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-20 h-full w-24 md:w-40"
            style={{
              background: `linear-gradient(to right, ${BG_COLOR}, transparent)`,
            }}
          />
          {/* Right Side Gradient Overlay (z-20) */}
          <div
            className="pointer-events-none absolute right-0 top-0 z-20 h-full w-24 md:w-40"
            style={{
              background: `linear-gradient(to left, ${BG_COLOR}, transparent)`,
            }}
          />
        </div>

        {/* Arrow Buttons (z-30 - sits safely on top of the blobs) */}
        <button
          onClick={handleNext}
          aria-label="Next project"
          className="absolute right-0 z-30 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight />
        </button>
      </motion.div>

      {/* Navigation dots (z-10) */}
      <motion.div
        className="relative z-10 flex items-center justify-center gap-2 mt-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
      >
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
      </motion.div>
    </section>
  );
}

export { ProjectsCarousel };

function Card({
  project,
  index,
  isActive,
  onClick,
}: {
  project: Project;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  // Dynamically points to public/images/project_1.jpg through project_5.jpg
  // The modulo operator (%) maps indices (0 to N) down to 1-5
  const imageNumber = (index % 5) + 1;
  const imageSrc = `/images/project_${imageNumber}.jpg`;

  return (
    <div
      onClick={onClick}
      className={`relative w-85 md:w-105 bg-white shadow-2xl overflow-hidden ${
        isActive ? "cursor-default" : "cursor-pointer"
      }`}
      style={{ opacity: isActive ? 1 : 0.8 }}
    >
      <div className="relative">
        <div className="relative h-55 w-full overflow-hidden border-10 border-white/80">
          <img
            src={imageSrc}
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
