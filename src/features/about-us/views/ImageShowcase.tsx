"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAboutUsShowcaseViewModel } from "../viewModels/useAboutUsShowcaseViewModel";

// Ported from the "Animated img slider" Framer component
// (framer.com/m/Animated-img-slider-kSPCiT) — a cascading image stack
// (prev-peek / current / next-peek), plus a per-character title reveal.
// That component only supports a title per slide; the description block
// below is new, added to carry the project descriptions alongside it.
//
// The image layers themselves are no longer Framer Motion elements: their
// position is a continuous function of live scroll progress (computed in
// useAboutUsShowcaseViewModel and written straight to each layer's
// style.transform every frame), not a per-slide spring animating toward a
// fixed rest position — see that view model for why.
const TEXT_EASE = [0.25, 1, 0.5, 1] as const;

const titleCharVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? 22 : -22,
    filter: "blur(6px)",
  }),
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: TEXT_EASE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -22 : 22,
    filter: "blur(6px)",
    transition: { duration: 0.3, ease: TEXT_EASE },
  }),
};

export function ImageShowcase() {
  const { data, state, refs } = useAboutUsShowcaseViewModel();
  const { items } = data;
  const { activeIndex, direction } = state;
  const current = items[activeIndex];

  return (
    // Tall scroll track: the section below stays pinned (sticky) while the
    // user scrolls through it, and scroll direction alone drives which
    // image is centered — scrolling down advances, scrolling up reverses.
    <div
      ref={refs.containerRef}
      className="relative w-full bg-[#DFD6C9]"
      style={{ height: `${items.length * 100}vh` }}
    >
      <section className="sticky top-0 h-screen w-full overflow-hidden bg-[#DFD6C9] px-6 py-20 sm:py-28">
        <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-12 md:flex-row md:items-center md:justify-between md:gap-4">
          {/* TEXT: eyebrow number, per-character title reveal, description */}
          <div className="flex w-full flex-col items-center gap-4 text-center md:w-1/2 md:items-start md:text-left">
            <AnimatePresence mode="wait">
              <motion.span
                key={`eyebrow-${activeIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: TEXT_EASE }}
                className="font-poppins text-xs font-medium tracking-[0.3em] text-[#4C3E39]/60 uppercase"
              >
                {current.number} &middot; Our Work
              </motion.span>
            </AnimatePresence>

            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.h2
                key={`title-${activeIndex}`}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({
                    transition: { staggerChildren: 0.025, staggerDirection: dir },
                  }),
                  center: { transition: { staggerChildren: 0.025 } },
                  exit: (dir: number) => ({
                    transition: { staggerChildren: 0.02, staggerDirection: -dir },
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-wrap justify-center font-['THE_BOLD_FONT'] text-4xl leading-[1.05] font-bold text-[#4C3E39] sm:text-5xl md:justify-start"
              >
                {current.title.split("").map((char, index) => (
                  <motion.span
                    key={`${char}-${index}`}
                    custom={direction}
                    variants={titleCharVariants}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h2>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${activeIndex}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: TEXT_EASE }}
                className="max-w-md font-sans text-base leading-relaxed text-[#4C3E39]/80"
              >
                {current.description}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* IMAGE STACK: every item stays mounted; each one's position is
              written directly (via refs) every animation frame as a
              continuous function of live scroll progress — see
              useAboutUsShowcaseViewModel. There is no per-slide "rest"
              animation to snap to, so wherever scrolling stops is exactly
              where the layers stay. */}
          <div className="relative flex h-72 w-full items-center justify-center sm:h-80 md:h-96 md:w-1/2">
            {items.map((item, index) => (
              <div
                key={item.image}
                ref={(el) => {
                  refs.layerRefs.current[index] = el;
                }}
                className={`pointer-events-none absolute top-1/2 left-1/2 -mt-32 -ml-32 h-64 w-64 rounded-2xl shadow-2xl sm:-mt-36 sm:-ml-36 sm:h-72 sm:w-72 md:-mt-40 md:-ml-40 md:h-80 md:w-80 ${
                  index === activeIndex ? "block" : "hidden md:block"
                }`}
                style={{ willChange: "transform, opacity, filter" }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  aria-hidden={index !== activeIndex}
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
