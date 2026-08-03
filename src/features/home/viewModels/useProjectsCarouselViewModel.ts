import { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "framer-motion";

export type Project = {
  num: string;
  title: string;
  desc: string;
  image: string;
};

const projects: Project[] = [
  {
    num: "[ 01 ]",
    title: "Modern Loft Redesign",
    desc: "Whether you're building a new home, renovating a space, or upgrading your business",
    image: "/images/project_1_portrait.jpg",
  },
  {
    num: "[ 02 ]",
    title: "Minimalist Villa",
    desc: "Seamlessly blending contemporary architecture with natural landscapes.",
    image: "/images/project_2_portrait.jpg",
  },
  {
    num: "[ 03 ]",
    title: "Urban Penthouse",
    desc: "Luxury living elevated through bespoke interiors and panoramic city views.",
    image: "/images/project_3_portrait.jpg",
  },
  {
    num: "[ 04 ]",
    title: "Commercial Hub",
    desc: "Designing functional, high-energy workspaces built for modern collaboration.",
    image: "/images/project_4_portrait.jpg",
  },
  {
    num: "[ 05 ]",
    title: "Coastal Retreat",
    desc: "Harmonizing rich wooden tones and open spaces with seaside serene vibes.",
    image: "/images/project_5_portrait.jpg",
  },
];

export function useProjectCardViewModel() {
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const imageRadius = useTransform(scrollYProgress, [0, 1], ["40px", "0px"]);

  return {
    cardRef,
    opacity,
    imageScale,
    imageRadius,
  };
}

export function useProjectsCarouselViewModel() {
  return {
    projects,
  };
}