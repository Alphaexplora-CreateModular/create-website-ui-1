import type { AboutUsGalleryViewModel } from "../viewModels/useAboutUsGalleryViewModel";

export function Gallery({ viewModel }: { viewModel: AboutUsGalleryViewModel }) {
  const { data, refs, state } = viewModel;

  return (
    <div
      ref={refs.galleryContainerRef}
      className="absolute inset-0 z-30 flex items-center justify-center px-6 md:px-12 bg-[#DFD6C9] transform-gpu"
      style={{
        willChange: "transform, opacity",
        transform: "translate3d(0, 100vh, 0)",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <div className="relative flex w-full max-w-7xl items-center justify-between gap-6 md:gap-12">
        <div
          ref={refs.whatWeDoRef}
          className="[writing-mode:vertical-rl] absolute -left-30 rotate-180 text-center text-[#4C3E39] font-montserrat text-lg font-normal tracking-widest uppercase transform-gpu"
          style={{ willChange: "opacity", opacity: 0 }}
        >
          WHAT WE DO
        </div>

        <div className="relative flex flex-1 justify-end h-screen items-center overflow-hidden">
          <div
            ref={refs.titleNumberRef}
            className="absolute inset-x-0 flex justify-end transform-gpu"
            style={{
              willChange: "transform, opacity",
              transform: "translate3d(0, 100vh, 0)",
              opacity: 0,
            }}
          >
            <span className="text-[#4C3E39] font-poppins text-xl font-normal tracking-widest">
              {data.galleryItems[state.activeGalleryIndex].number}
            </span>
          </div>
        </div>

        <div
          ref={refs.galleryCenterRef}
          className="relative h-screen w-125 max-w-[90vw] shrink-0 overflow-hidden"
        >
          {data.galleryItems.map((item, index) => (
            <div
              key={item.image}
              ref={(el) => {
                refs.galleryItemRefs.current[index] = el;
              }}
              className="absolute inset-0 overflow-hidden transform-gpu"
              style={{
                willChange: "opacity, clip-path",
                opacity: 0,
                zIndex: 0,
                contain: "paint",
              }}
            >
              <img
                ref={(el) => {
                  refs.galleryImgRefs.current[index] = el;
                }}
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transform-gpu"
                style={{ willChange: "transform" }}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <div className="absolute inset-0 pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="relative flex flex-1 h-screen items-center justify-start overflow-hidden">
          <div
            ref={refs.titleTextRef}
            className="absolute inset-x-0 flex justify-start transform-gpu"
            style={{
              willChange: "transform, opacity",
              transform: "translate3d(0, 100vh, 0)",
              opacity: 0,
            }}
          >
            <h2 className="font-['THE_BOLD_FONT'] text-5xl font-bold leading-none text-[#4C3E39]">
              {data.galleryItems[state.activeGalleryIndex].title}
            </h2>
          </div>

          <div
            ref={refs.descTextRef}
            className="absolute inset-x-0 flex justify-start transform-gpu"
            style={{
              willChange: "transform, opacity",
              transform: "translate3d(0, 100vh, 0)",
              opacity: 0,
            }}
          >
            <p className="max-w-md font-sans leading-relaxed text-[#4C3E39]/90 text-xl font-light">
              {data.galleryItems[state.activeGalleryIndex].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
