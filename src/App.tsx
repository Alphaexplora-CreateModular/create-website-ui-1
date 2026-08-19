// src/App.tsx
import {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import NightPointerBlob from "./shared/components/NightPointerBlob";
import "./App.css";

// Lazy-load page components from their respective feature folders
const Home = lazy(() =>
  import("./features/home/views/Home").then((m) => ({ default: m.Home })),
);
const AboutUs = lazy(() =>
  import("./features/about-us/views/AboutUs").then((m) => ({
    default: m.AboutUs,
  })),
);
const Projects = lazy(() =>
  import("./features/projects/views/Projects").then((m) => ({
    default: m.Projects,
  })),
);
const Contact = lazy(() =>
  import("./features/contact/views/Contact").then((m) => ({
    default: m.Contact,
  })),
);

function ScrollToTopOnRouteChange({
  lenisRef,
}: {
  lenisRef: React.RefObject<Lenis | null>;
}) {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, lenisRef]);

  return null;
}

export default function App() {
  const [isNightMode, setIsNightMode] = useState(false);
  const [hasHomeIntroPlayed, setHasHomeIntroPlayed] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  const toggleNightMode = () => {
    setIsNightMode((previous) => !previous);
  };

  useEffect(() => {
    document.body.classList.toggle("site-night-mode", isNightMode);
    document.body.classList.toggle("home-night-mode", isNightMode);

    return () => {
      document.body.classList.remove("site-night-mode");
      document.body.classList.remove("home-night-mode");
    };
  }, [isNightMode]);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTopOnRouteChange lenisRef={lenisRef} />
      <NightPointerBlob isNightMode={isNightMode} />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <Home
                isNightMode={isNightMode}
                playIntroVideo={!hasHomeIntroPlayed}
                onToggleNight={toggleNightMode}
                onSetNightMode={setIsNightMode}
                onHomeIntroMounted={() => setHasHomeIntroPlayed(true)}
              />
            }
          />
          <Route
            path="/about-us"
            element={
              <AboutUs
                isNightMode={isNightMode}
                onToggleNight={toggleNightMode}
              />
            }
          />
          <Route
            path="/projects"
            element={
              <Projects
                isNightMode={isNightMode}
                onToggleNight={toggleNightMode}
              />
            }
          />
          <Route
            path="/contact"
            element={
              <Contact
                isNightMode={isNightMode}
                onToggleNight={toggleNightMode}
              />
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
