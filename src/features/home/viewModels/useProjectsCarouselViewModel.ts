import { useCallback, useState } from "react";

export type Project = {
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
const BG_COLOR = "#3a2f2a";

export function useProjectsCarouselViewModel() {
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

  const handlePrev = useCallback(() => {
    goTo(activeIndex - 1, "prev");
  }, [activeIndex, goTo]);

  const handleNext = useCallback(() => {
    goTo(activeIndex + 1, "next");
  }, [activeIndex, goTo]);

  const getOffset = useCallback(
    (index: number) => {
      let offset = index - activeIndex;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      return offset;
    },
    [activeIndex, total],
  );

  return {
    projects,
    activeIndex,
    direction,
    handlePrev,
    handleNext,
    goTo,
    getOffset,
    BG_COLOR,
    MAX_VISIBLE_OFFSET,
  };
}
