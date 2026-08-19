// src/features/home/views/Home.tsx
import { useEffect, useRef } from "react";
import { useHomeViewModel } from "../viewModels/useHomeViewModel";
import { Header } from "./Header";
import { ServiceOverview } from "./ServiceOverview";
import ProjectsCarousel from "./ProjectsCarousel";
import { Process } from "./Process";
import { Navbar } from "../../../shared/components/Navbar";
import Footer from "../../../shared/components/Footer";
import Scroll from "../../../shared/components/Scroll";

type HomeProps = {
  isNightMode: boolean;
  playIntroVideo: boolean;
  onToggleNight: () => void;
  onSetNightMode: (isNightMode: boolean) => void;
  onHomeIntroMounted: () => void;
};

export function Home({
  isNightMode,
  playIntroVideo,
  onToggleNight,
  onSetNightMode,
  onHomeIntroMounted,
}: HomeProps) {
  const shouldPlayIntroVideo = useRef(playIntroVideo).current;
  const hasReportedIntroMount = useRef(false);
  const viewModel = useHomeViewModel();
  void viewModel;

  useEffect(() => {
    if (shouldPlayIntroVideo && !hasReportedIntroMount.current) {
      hasReportedIntroMount.current = true;
      onHomeIntroMounted();
    }
  }, [onHomeIntroMounted, shouldPlayIntroVideo]);

  const handleToggleNight = (nextState?: boolean) => {
    if (nextState !== undefined) {
      onSetNightMode(nextState);
      return;
    }

    onToggleNight();
  };

  return (
    <div
      className={`home-page-shell relative min-h-screen ${
        isNightMode ? "home-page-shell--night" : ""
      }`}
    >
      <Navbar
        isNightMode={isNightMode}
        onToggleNight={() => handleToggleNight()}
      />

      {/* Hero Header */}
      <Header
        isNightMode={isNightMode}
        playIntroVideo={shouldPlayIntroVideo}
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
