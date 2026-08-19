import { Navbar } from "../../../shared/components/Navbar";
import Footer from "../../../shared/components/Footer";
import Scroll from "../../../shared/components/Scroll";
import { Header } from "./Header";
import { ImageShowcase } from "./ImageShowcase";
import { useAboutUsGalleryViewModel } from "../viewModels/useAboutUsGalleryViewModel";
import { useAboutUsHeaderViewModel } from "../viewModels/useAboutUsHeaderViewModel";
import { useEffect, useState } from "react";

type AboutUsProps = {
  isNightMode: boolean;
  onToggleNight: () => void;
};

export function AboutUs({
  isNightMode: siteNightMode,
  onToggleNight,
}: AboutUsProps) {
  const headerViewModel = useAboutUsHeaderViewModel();
  const galleryViewModel = useAboutUsGalleryViewModel(headerViewModel.refs);
  const [isInVideoSection, setIsInVideoSection] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    let rafId: number;
    let settledFrames = 0;
    const REQUIRED_SETTLED_FRAMES = 3;
    const VIDEO_START_THRESHOLD_S = 0.05;
    const MAX_WAIT_MS = 1500;
    const startTime = performance.now();

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const checkReady = () => {
      const video = headerViewModel.refs.videoRef.current;
      const isAtTop = window.scrollY <= 0;
      const isVideoAtStart =
        !video || video.currentTime <= VIDEO_START_THRESHOLD_S;

      settledFrames = isAtTop && isVideoAtStart ? settledFrames + 1 : 0;

      const timedOut = performance.now() - startTime > MAX_WAIT_MS;

      if (settledFrames >= REQUIRED_SETTLED_FRAMES || timedOut) {
        setIsPageReady(true);
        return;
      }

      rafId = requestAnimationFrame(checkReady);
    };

    rafId = requestAnimationFrame(checkReady);

    return () => cancelAnimationFrame(rafId);
  }, [headerViewModel.refs.videoRef]);

  useEffect(() => {
    if (!isPageReady) return;
    const timeout = window.setTimeout(() => setShowLoader(false), 400);
    return () => window.clearTimeout(timeout);
  }, [isPageReady]);

  useEffect(() => {
    const handleScroll = () => {
      const container = galleryViewModel.refs.containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;

      if (totalScrollableHeight <= 0) {
        setIsInVideoSection(true);
        return;
      }

      const progress = Math.min(
        Math.max(-rect.top / totalScrollableHeight, 0),
        1,
      );
      setIsInVideoSection(progress < 0.92);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [galleryViewModel.refs.containerRef]);

  useEffect(() => {
    let isLocked = true;
    const unlockTimer = window.setTimeout(() => {
      isLocked = false;
    }, headerViewModel.data.timing.introAnimationCompleteMs);

    const preventInputScroll = (event: WheelEvent | TouchEvent) => {
      if (!isLocked) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const preventKeyboardScroll = (event: KeyboardEvent) => {
      if (!isLocked) return;

      const blockedKeys = new Set([
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
        "Spacebar",
      ]);

      if (!blockedKeys.has(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("wheel", preventInputScroll, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchmove", preventInputScroll, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keydown", preventKeyboardScroll, true);

    return () => {
      window.clearTimeout(unlockTimer);
      window.removeEventListener("wheel", preventInputScroll, true);
      window.removeEventListener("touchmove", preventInputScroll, true);
      window.removeEventListener("keydown", preventKeyboardScroll, true);
    };
  }, [headerViewModel.data.timing.introAnimationCompleteMs]);

  return (
    <div
      className={`about-us-page-shell relative bg-[#DFD6C9] text-white ${
        siteNightMode ? "about-us-page-shell--night" : ""
      }`}
    >
      {showLoader && (
        <div
          className={`about-us-page-loader ${
            siteNightMode ? "about-us-page-loader--night" : ""
          }`}
          style={{ opacity: isPageReady ? 0 : 1 }}
          aria-hidden="true"
        >
          <span className="about-us-page-loader__ring" />
        </div>
      )}

      <Navbar
        activeSection={isInVideoSection ? "header" : "gallery"}
        isNightMode={siteNightMode}
        onToggleNight={onToggleNight}
      />

      <div
        ref={galleryViewModel.refs.containerRef}
        className="relative h-[500vh] w-full"
      >
        <section className="sticky top-0 h-screen w-full overflow-hidden bg-[#DFD6C9]">
          <Header viewModel={headerViewModel} isNightMode={siteNightMode} />
        </section>
      </div>

      <ImageShowcase />

      <Scroll />
      <Footer />
    </div>
  );
}
