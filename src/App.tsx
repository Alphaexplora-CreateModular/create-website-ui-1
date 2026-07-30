// src/App.tsx
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Lenis from "lenis";
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

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
