// src/features/home/views/Home.tsx
import { useEffect, useState } from "react";
import { useHomeViewModel } from "../viewModels/useHomeViewModel";
import { Header } from "./Header";
import { ServiceOverview } from "./ServiceOverview";
import ProjectsCarousel from "./ProjectsCarousel.tsx";
import { Process } from "./Process";
import { Offers } from "./Offers";
import { Navbar } from "./Navbar";

export function Home() {
  const viewModel = useHomeViewModel();
  void viewModel;

  const [activeSection, setActiveSection] = useState<string>("header");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -45% 0px",
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const key = entry.target.getAttribute("data-nav-key");
          if (key) {
            setActiveSection(key);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions,
    );

    // Track sections simply by looking for the data attribute
    const targets = document.querySelectorAll("[data-nav-key]");
    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#121212] text-white">
      {/* Simple, Static-Style White Navbar */}
      <Navbar activeSection={activeSection} />

      {/* Header */}
      <div id="header-section" data-nav-key="header">
        <Header />
      </div>

      {/* Service Overview */}
      <div id="services" data-nav-key="services">
        <ServiceOverview />
      </div>

      {/* Projects Carousel */}
      <div id="projects" data-nav-key="projects">
        <ProjectsCarousel />
      </div>

      {/* Offers */}
      <div id="offers" data-nav-key="services">
        <Offers />
      </div>

      {/* Process */}
      <div id="process" data-nav-key="process">
        <Process />
      </div>
    </div>
  );
}
