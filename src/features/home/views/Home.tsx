// src/features/home/views/Home.tsx
import { useEffect, useState } from "react";
import { useHomeViewModel } from "../viewModels/useHomeViewModel";
import { Header } from "./Header";
import { ServiceOverview } from "./ServiceOverview";
import ProjectsCarousel from "./ProjectsCarousel.tsx";
import { Process } from "./Process";
import { Offers } from "./Offers";
import { Navbar } from "./Navbar";
import Contact from "./Contact.tsx";
import Footer from "./Footer.tsx";

export function Home() {
  const viewModel = useHomeViewModel();
  void viewModel;

  const isHeaderScrolled = false;
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

    const targets = document.querySelectorAll("[data-nav-key]");
    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
    };
  }, []);

  return (
    <div className="home-page-shell relative min-h-screen">
      <Navbar
        activeSection={activeSection}
        isHeaderScrolled={isHeaderScrolled}
      />

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

      {/* Contact Section */}
      <div id="contact" data-nav-key="contact">
        <Contact />
      </div>

      {/* Footer */}
      <div id="footer" data-nav-key="footer">
        <Footer />
      </div>
    </div>
  );
}
