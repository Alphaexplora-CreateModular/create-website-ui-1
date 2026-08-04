// src/features/home/views/Home.tsx
import { useState } from "react";
import { useHomeViewModel } from "../viewModels/useHomeViewModel";
import { Header } from "./Header";
import { ServiceOverview } from "./ServiceOverview";
import ProjectsCarousel from "./ProjectsCarousel";
import { Process } from "./Process";
import { Navbar } from "../../../shared/components/Navbar";
import Footer from "../../../shared/components/Footer";
import Scroll from "../../../shared/components/Scroll";

export function Home() {
  const viewModel = useHomeViewModel();
  void viewModel;

  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  const handleToggleNight = (nextState?: boolean) => {
    setIsNightMode((prev) => (nextState !== undefined ? nextState : !prev));
  };

  return (
    <div className="home-page-shell relative min-h-screen">
      <Navbar
        isNightMode={isNightMode}
        onToggleNight={() => handleToggleNight()}
      />

      {/* Hero Header */}
      <Header
        isNightMode={isNightMode}
        onToggleNight={(nextState) => handleToggleNight(nextState)}
      />

      {/* Home Sections */}
      <ServiceOverview />
      <ProjectsCarousel />
      <Process />
      <Scroll />

      {/* Footer */}
      <Footer />
    </div>
  );
}
