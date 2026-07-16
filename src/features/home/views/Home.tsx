import { useHomeViewModel } from "../viewModels/useHomeViewModel";
import { Header } from "./Header";
import { ServiceOverview } from "./ServiceOverview";
import ProjectsCarousel from "./ProjectsCarousel.tsx";
import { Process } from "./Process";

export function Home() {
  const viewModel = useHomeViewModel();
  void viewModel;

  return (
    <div>
      <Header />
      <ServiceOverview />
      <ProjectsCarousel />
      <Process />
    </div>
  );
}
