import { useEffect, useRef, useState } from "react";
import { PROJECTS_DATA, type ProjectItem } from "./projectsContent";

declare global {
  interface Window {
    gsap?: any;
  }
}

export function useProjectsShowcaseViewModel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});
  const [gsapReady, setGsapReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.gsap) {
      setGsapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    script.onload = () => setGsapReady(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isGridView) return;

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % PROJECTS_DATA.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isGridView, currentIndex]);

  useEffect(() => {
    if (!gsapReady || !isGridView || !gridContainerRef.current || !window.gsap) {
      return;
    }

    const gsap = window.gsap;
    const cards = gridContainerRef.current.querySelectorAll(".project-grid-card");

    gsap.fromTo(
      cards,
      { y: 50, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      },
    );
  }, [isGridView, gsapReady]);

  const handleNext = () => {
    setCurrentIndex((previous) => (previous + 1) % PROJECTS_DATA.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (previous) => (previous - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length,
    );
  };

  const toggleView = () => {
    if (gsapReady && window.gsap && containerRef.current) {
      const gsap = window.gsap;
      gsap.to(containerRef.current, {
        opacity: 0.8,
        duration: 0.2,
        onComplete: () => {
          setIsGridView((previous) => !previous);
          gsap.to(containerRef.current, { opacity: 1, duration: 0.3 });
        },
      });
    } else {
      setIsGridView((previous) => !previous);
    }
  };

  const selectProjectFromGrid = (index: number) => {
    setCurrentIndex(index);
    setIsGridView(false);
  };

  const getImgSrc = (project: ProjectItem, index: number) => {
    return imgErrorMap[index] ? project.fallbackImage : project.image;
  };

  return {
    data: {
      projects: PROJECTS_DATA,
    },
    state: {
      currentIndex,
      isGridView,
    },
    refs: {
      containerRef,
      gridContainerRef,
    },
    actions: {
      handleNext,
      handlePrev,
      toggleView,
      selectProjectFromGrid,
      getImgSrc,
      setImgErrorMap,
    },
  };
}

export type ProjectsShowcaseViewModel = ReturnType<typeof useProjectsShowcaseViewModel>;