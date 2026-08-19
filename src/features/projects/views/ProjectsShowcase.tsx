import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "../../../shared/components/Navbar";
import { useProjectsShowcaseViewModel } from "../viewModels/useProjectsShowcaseViewModel";

type ProjectsShowcaseProps = {
  isNightMode: boolean;
  onToggleNight: () => void;
};

export function ProjectsShowcase({
  isNightMode,
  onToggleNight,
}: ProjectsShowcaseProps) {
  const viewModel = useProjectsShowcaseViewModel();
  const [isShowcaseInView, setIsShowcaseInView] = useState(true);
  const { projects } = viewModel.data;
  const { currentIndex, isGridView } = viewModel.state;
  const {
    handleNext,
    handlePrev,
    toggleView,
    selectProjectFromGrid,
    getImgSrc,
    setImgErrorMap,
  } = viewModel.actions;

  useEffect(() => {
    const updateShowcaseInView = () => {
      const container = viewModel.refs.containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const navProbeY = 88;
      const inView = rect.top <= navProbeY && rect.bottom >= navProbeY;
      setIsShowcaseInView(inView);
    };

    window.addEventListener("scroll", updateShowcaseInView, { passive: true });
    window.addEventListener("resize", updateShowcaseInView);
    updateShowcaseInView();

    return () => {
      window.removeEventListener("scroll", updateShowcaseInView);
      window.removeEventListener("resize", updateShowcaseInView);
    };
  }, [viewModel.refs.containerRef]);

  const isWhiteNav = !isGridView && isShowcaseInView;

  return (
    <div
      ref={viewModel.refs.containerRef}
      className={`relative w-full bg-[#2D2623] font-poppins ${
        isGridView ? "min-h-screen h-auto" : "h-screen"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar
          activeSection={isWhiteNav ? "header" : "content"}
          isNightMode={isNightMode}
          onToggleNight={onToggleNight}
          forceWhiteText
        />
      </div>

      {!isGridView ? (
        <div className="relative w-full h-full pt-28 pb-12 overflow-hidden">
          {projects.map((project, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={project.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex flex-col justify-between pt-28 pb-12 ${
                  isActive
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={getImgSrc(project, idx)}
                    onError={() =>
                      setImgErrorMap((previous) => ({
                        ...previous,
                        [idx]: true,
                      }))
                    }
                    alt={project.title}
                    className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                      isActive ? "scale-100" : "scale-105"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />
                </div>

                <div className="relative z-20 px-8 md:px-16 flex justify-between items-center text-xs tracking-widest text-white/80 uppercase">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DFD6C9] animate-pulse" />
                    <span>Featured Works</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-white/90">
                    <span>{project.category}</span>
                    <span>•</span>
                    <span>{project.location}</span>
                    <span>•</span>
                    <span>{project.year}</span>
                  </div>
                </div>

                <div className="relative z-20 px-8 md:px-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="max-w-5xl">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-poppins text-lg md:text-2xl font-light text-white/80 tracking-widest">
                        [{project.id}]
                      </span>
                      <p className="text-xs md:text-sm text-[#DFD6C9] uppercase font-medium tracking-widest">
                        {project.subtitle}
                      </p>
                    </div>

                    <h1 className="font-bold-display text-4xl sm:text-6xl md:text-7xl lg:text-9xl text-white leading-[0.9] tracking-tight drop-shadow-md">
                      {project.title}
                    </h1>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={handlePrev}
            aria-label="Previous Project"
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group shadow-2xl cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Project"
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group shadow-2xl cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="absolute bottom-12 right-8 md:right-16 z-30 flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right pr-4 border-r border-white/20 text-white">
              <span className="text-xl font-bold font-poppins">
                0{currentIndex + 1}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest">
                / 0{projects.length}
              </span>
            </div>

            <button
              onClick={toggleView}
              title="Switch to Grid View"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-[#2D2623] flex items-center justify-center hover:bg-[#DFD6C9] hover:scale-105 transition-all duration-300 shadow-xl group cursor-pointer"
            >
              <LayoutGrid className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-auto pt-28 px-6 md:px-16 pb-12 bg-[#DFD6C9]">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#4C3E39]/20">
            <div>
              <p className="text-[#4C3E39] text-xs font-semibold uppercase tracking-widest mb-1">
                Index View
              </p>
              <h2 className="font-bold-display text-3xl md:text-4xl text-[#2D2623]">
                All Projects
              </h2>
            </div>

            <button
              onClick={toggleView}
              title="Switch to Slideshow View"
              aria-label="Switch to Slideshow View"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#4C3E39] text-white hover:bg-[#2D2623] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:scale-105"
            >
              <Images className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div
            ref={viewModel.refs.gridContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12"
          >
            {projects.map((project, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={project.id}
                  onClick={() => selectProjectFromGrid(idx)}
                  className={`project-grid-card group relative rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm border ${
                    isActive
                      ? "border-[#4C3E39] ring-2 ring-[#4C3E39]"
                      : "border-[#4C3E39]/10"
                  } hover:border-[#4C3E39]/40 transition-all duration-300 cursor-pointer flex flex-col shadow-sm hover:shadow-md`}
                >
                  <div className="relative h-60 overflow-hidden bg-zinc-200">
                    <img
                      src={getImgSrc(project, idx)}
                      onError={() =>
                        setImgErrorMap((previous) => ({
                          ...previous,
                          [idx]: true,
                        }))
                      }
                      alt={project.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 font-poppins text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                      [{project.id}]
                    </div>

                    {isActive && (
                      <div className="absolute top-4 right-4 bg-[#4C3E39] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </div>
                    )}

                    <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:bg-[#4C3E39] group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-[#4C3E39] font-medium uppercase tracking-wider mb-1">
                        {project.category}
                      </div>
                      <h3 className="font-bold-display text-2xl text-[#2D2623] group-hover:text-[#4C3E39] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-2 line-clamp-2 font-poppins leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#4C3E39]/10 flex justify-between items-center text-xs text-zinc-500 font-poppins">
                      <span>{project.location}</span>
                      <span>{project.year}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
