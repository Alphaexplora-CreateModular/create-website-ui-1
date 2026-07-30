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
        className="w-full h-full flex flex-row items-center justify-center gap-4 px-[100px] py-[100px] shadow-[0_-3px_25.9px_0_rgba(0,0,0,0.25)]"
      >
        {/* COLUMN 1: Vertical Sidebar */}
        <div className="flex flex-col items-center w-[10%] h-full justify-between py-10">
          <div className="[writing-mode:vertical-rl] rotate-180 text-center text-[#4C3E39] font-montserrat text-lg font-normal tracking-widest uppercase">
            Our Projects
          </div>
          <span className="text-[#4C3E39] font-poppins text-lg font-normal">
            {project.num}
          </span>
        </div>

        {/* COLUMN 2: Details */}
        <div className="flex flex-col gap-6 items-start w-[40%] h-full justify-center pr-10">
          <span className="text-[#4C3E39] font-['THE_BOLD_FONT'] text-[65.17px] font-bold leading-none">
            {project.title}
          </span>
          <span className="text-[#4C3E39] font-poppins text-lg font-normal">
            {project.desc}
          </span>
          <span className="text-[#4C3E39] font-poppins text-md font-semibold cursor-pointer hover:underline">
            View more →
          </span>
        </div>

        {/* COLUMN 3: Image Container */}
        <div className="w-auto h-full overflow-hidden relative">
          <motion.img
            src={project.image}
            alt={project.title}
            style={{
              scale: imageScale,
              borderRadius: imageRadius,
            }}
            className="w-[400px] h-full object-cover transition-all ease-out duration-300"
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
