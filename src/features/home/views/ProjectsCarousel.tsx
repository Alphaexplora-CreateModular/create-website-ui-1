"use client";

import { motion } from "framer-motion";
import {
  type Project,
  useProjectCardViewModel,
  useProjectsCarouselViewModel,
} from "../viewModels/useProjectsCarouselViewModel";

type ProjectCardProps = {
  project: Project;
  index: number;
};

function ProjectCard({ project, index }: ProjectCardProps) {
  const { cardRef, opacity, imageScale, imageRadius } =
    useProjectCardViewModel();

  return (
    <div
      ref={cardRef}
      className="sticky top-0 w-full h-screen flex items-center justify-center bg-[#DFD6C9]"
      style={{ zIndex: index + 1 }}
    >
      <motion.div
        style={{ opacity }}
        className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-6 px-6 py-12 lg:gap-4 lg:px-25 lg:py-25 shadow-[0_-3px_25.9px_0_rgba(0,0,0,0.25)]"
      >
        {/* COLUMN 1: Vertical Sidebar (desktop only) */}
        <div className="hidden lg:flex lg:order-1 flex-col items-center w-[10%] h-full justify-between py-10">
          <div className="[writing-mode:vertical-rl] rotate-180 text-center text-[#4C3E39] font-montserrat text-lg font-normal tracking-widest uppercase">
            Our Projects
          </div>
          <span className="text-[#4C3E39] font-poppins text-lg font-normal">
            {project.num}
          </span>
        </div>

        {/* COLUMN 2: Details */}
        <div className="order-2 lg:order-2 flex flex-col gap-3 sm:gap-4 lg:gap-6 items-center lg:items-start w-full lg:w-[40%] lg:h-full justify-center text-center lg:text-left lg:pr-10">
          <div className="flex lg:hidden items-center gap-2 text-[#4C3E39]/70 font-poppins text-xs font-medium tracking-widest uppercase">
            <span>Our Projects</span>
            <span>{project.num}</span>
          </div>
          <span className="text-[#4C3E39] font-['THE_BOLD_FONT'] text-3xl sm:text-4xl lg:text-[65.17px] font-bold leading-none">
            {project.title}
          </span>
          <span className="text-[#4C3E39] font-poppins text-sm sm:text-base lg:text-lg font-normal">
            {project.desc}
          </span>
          <span className="text-[#4C3E39] font-poppins text-sm lg:text-md font-semibold cursor-pointer hover:underline">
            View more →
          </span>
        </div>

        {/* COLUMN 3: Image Container */}
        <div className="order-1 lg:order-3 w-full h-[38vh] sm:h-[42vh] lg:w-auto lg:h-full overflow-hidden relative rounded-2xl lg:rounded-none">
          <motion.img
            src={project.image}
            alt={project.title}
            style={{
              scale: imageScale,
              borderRadius: imageRadius,
            }}
            className="w-full h-full lg:w-100 object-cover transition-all ease-out duration-300"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsCarousel() {
  const { projects } = useProjectsCarouselViewModel();

  return (
    <div className="relative w-full bg-[#DFD6C9]">
      {projects.map((project, index) => (
        <ProjectCard key={project.num} project={project} index={index} />
      ))}
    </div>
  );
}
