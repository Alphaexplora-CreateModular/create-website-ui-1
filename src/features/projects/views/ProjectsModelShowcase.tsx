import { MODEL_SHOWCASE } from "../viewModels/projectsContent";
import { useProjectsModelViewModel } from "../viewModels/useProjectsModelViewModel";

export function ProjectsModelShowcase() {
  const viewModel = useProjectsModelViewModel();

  return (
    <section className="relative w-full bg-[#DFD6C9] border-t border-[#4C3E39]/10 py-20 md:py-28 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative w-full h-[420px] sm:h-[480px] md:h-[560px] lg:h-[620px] order-2 lg:order-1">
          <div
            ref={viewModel.refs.modelMountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          />

          {viewModel.state.modelLoading && !viewModel.state.modelError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs uppercase tracking-widest text-[#4C3E39]/60 font-poppins animate-pulse">
                Loading model…
              </span>
            </div>
          )}

          {viewModel.state.modelError && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-6 pointer-events-none">
              <span className="text-xs uppercase tracking-widest text-red-800/70 font-poppins">
                Failed to load model from public/models/kitchen.glb —
                check the browser console for details.
              </span>
            </div>
          )}

          {!viewModel.state.modelLoading && !viewModel.state.modelError && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-[#4C3E39]/50 font-poppins pointer-events-none">
              Drag to rotate • Scroll to zoom
            </span>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-[#4C3E39] text-xs font-semibold uppercase tracking-widest mb-3">
            {MODEL_SHOWCASE.eyebrow}
          </p>
          <h2 className="font-bold-display text-4xl md:text-5xl lg:text-6xl text-[#2D2623] leading-[0.95] mb-6">
            {MODEL_SHOWCASE.title}
          </h2>
          <p className="text-sm md:text-base text-zinc-700 font-poppins leading-relaxed mb-8 max-w-md">
            {MODEL_SHOWCASE.description}
          </p>

          <ul className="space-y-3">
            {MODEL_SHOWCASE.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-3 text-sm text-[#2D2623] font-poppins"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4C3E39] flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
