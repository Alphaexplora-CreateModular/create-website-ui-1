import { useHomeViewModel } from "../viewModels/useHomeViewModel";
import { Header } from "./Header";
import ProjectsCarousel from "./ProjectsCarousel.tsx";

export function Home() {
  const viewModel = useHomeViewModel();
  void viewModel;

  return (
    <div>
      <Header />
      <ProjectsCarousel />
    </div>
  );
}
