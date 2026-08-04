import { Navbar } from "../../../shared/components/Navbar";
import Footer from "../../../shared/components/Footer";
import Scroll from "../../../shared/components/Scroll";
import { Gallery } from "./Gallery";
import { Header } from "./Header";
import { useAboutUsGalleryViewModel } from "../viewModels/useAboutUsGalleryViewModel";
import { useAboutUsHeaderViewModel } from "../viewModels/useAboutUsHeaderViewModel";

export function AboutUs() {
  const headerViewModel = useAboutUsHeaderViewModel();
  const galleryViewModel = useAboutUsGalleryViewModel(headerViewModel.refs);

  return (
    <div className="relative bg-[#DFD6C9] text-white">
      <Navbar />

      <div
        ref={galleryViewModel.refs.containerRef}
        className="relative h-[1000vh] w-full"
      >
        <section className="sticky top-0 h-screen w-full overflow-hidden bg-[#DFD6C9]">
          <Header viewModel={headerViewModel} />
          <Gallery viewModel={galleryViewModel} />
        </section>
      </div>

      <Scroll />
      <Footer />
    </div>
  );
}
