import { FlyInWords } from "../../../shared/components/FlyInWords";
import { useProcessViewModel } from "../viewModels/useProcessViewModel";

export function Process() {
  const { data, state, refs } = useProcessViewModel();
  const { textColor, pinHeightVh, intro } = data;
  const {
    introActive,
    introPlayKey,
    isInView50,
    current,
    hasActiveContent,
    transitionMs,
    visible,
    activeStep,
    stepBlockTransform,
    stepTextOpacity,
  } = state;

  return (
    <div
      ref={refs.containerRef}
      className="relative w-full"
      style={{ height: `${pinHeightVh}vh` }}
    >
      <section
        ref={refs.sectionRef}
        className="sticky top-0 h-screen overflow-hidden bg-[#060606]"
      >
        <style>{`
        @keyframes flyInWord {
          0% {
            opacity: 0;
            transform: translateY(var(--fly-y, 24px));
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUpIntro {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

        {/* On mobile the video shrinks to the bottom row once a step is
            active, instead of staying full-bleed behind an opaque panel.
            It fills that row completely (object-cover, cropping as needed)
            rather than being letterboxed inside it. sm: and up always keep
            it full-bleed, cropped, behind the overlaid text. */}
        <video
          ref={refs.videoRef}
          src="/video/process.mp4"
          className={`absolute inset-x-0 z-5 w-full object-cover transition-[top,height] duration-500 ease-in-out sm:top-0 sm:h-full sm:object-center ${
            introActive
              ? "top-0 h-full object-center"
              : "top-[42vh] h-[calc(100%-42vh)] object-bottom"
          }`}
          muted
          playsInline
          preload="auto"
        />

        {/* 20% OVERLAY LAYER */}
        <div
          className={`absolute inset-0 z-10
    bg-[#000000]/35
    backdrop-blur-xl
    transition-opacity duration-700
    ${introActive ? "opacity-100" : "opacity-0 pointer-events-none"}
  `}
        />

        {/* FIRST GLANCE / INTRO HEADER */}
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 transition-all duration-500 ease-in-out ${
            introActive
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          {/* Only mount the animations when the section is at least 50% in view */}
          {isInView50 && (
            <div key={introPlayKey} className="flex flex-col items-center">
              <span
                className="text-xs tracking-[0.3em] uppercase mb-3 block"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <FlyInWords
                  text={intro.label}
                  baseDelay={intro.timing.labelBaseDelayMs}
                  stagger={intro.timing.labelStaggerMs}
                  duration={500}
                  flyDistance={14}
                />
              </span>
              <h2
                className="text-3xl md:text-5xl font-bold mb-4 max-w-2xl text-white"
                style={{ fontFamily: "'The Bold Font', sans-serif" }}
              >
                <FlyInWords
                  text={intro.heading}
                  baseDelay={intro.timing.headingBaseDelayMs}
                  stagger={intro.timing.headingStaggerMs}
                  duration={700}
                  flyDistance={30}
                />
              </h2>
              <p
                className="text-sm md:text-base max-w-xl leading-relaxed"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <FlyInWords
                  text={intro.paragraph}
                  baseDelay={intro.timing.paragraphBaseDelayMs}
                  stagger={intro.timing.paragraphStaggerMs}
                  duration={600}
                  flyDistance={18}
                />
              </p>

              {/* Subtle scroll indicator: fades/rises in after the text finishes,
                then bounces continuously */}
              <div
                className="absolute bottom-8 text-xs text-white/50 tracking-wider uppercase"
                style={{
                  opacity: 0,
                  animationName: "fadeInUpIntro",
                  animationDuration: "600ms",
                  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  animationDelay: `${intro.timing.scrollIndicatorDelayMs}ms`,
                  animationFillMode: "both",
                }}
              >
                <span className="inline-block animate-bounce">
                  Scroll down to explore
                </span>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE STEP TEXT ROW — on small screens the step text moves off
            the video into its own row above it (2-row layout) instead of
            overlaying the footage; sm: and up keep the original full-bleed
            video with text overlaid on top. Synced to `!introActive` (not
            `hasActiveContent`) so it appears/disappears in the same tick as
            the video resizes above — `activeStep` itself only updates ~250ms
            later, and syncing to it would leave a blank gap in between. */}
        {/* Fills the whole row (not just the text area) so wherever the
            uncropped, bottom-aligned video doesn't reach — the letterboxed
            space above it — shows this cream backdrop instead of the
            section's near-black background. Sits behind the video (z-0 vs
            the video's z-5) so the video still paints on top of it. */}
        <div
          className="absolute inset-0 z-0 bg-[#DFD6C9] transition-opacity duration-300 ease-in-out sm:hidden"
          style={{
            opacity: !introActive ? 1 : 0,
          }}
          aria-hidden="true"
        />

        {/* Clips the step text's fly-in/out sweep to this row on mobile so
            it never visually crosses into the video below. sm: and up
            become `contents` (no box of its own), so the step content
            resolves against the section like before and can overlay the
            full-height video again. */}
        <div className="absolute inset-x-0 top-0 h-[42vh] overflow-hidden sm:contents">
          {/* STEP CONTENT LAYERS */}
          <div
            key={activeStep}
            className={`absolute top-1/2 z-20 inset-x-0 mx-auto w-[88%] max-w-md px-6 text-center transform-gpu sm:inset-x-auto sm:mx-0 sm:px-0 ${
              current.side === "left"
                ? "sm:left-16 sm:text-left"
                : "sm:right-16 sm:text-right"
            }`}
            style={{
              transform: stepBlockTransform,
              opacity: hasActiveContent && !introActive ? 1 : 0,
              pointerEvents:
                hasActiveContent && !introActive ? "auto" : "none",
              transitionProperty: "transform, opacity",
              transitionDuration: `${transitionMs}ms, 300ms`,
              transitionTimingFunction:
                "cubic-bezier(0.16, 1, 0.3, 1), ease-in-out",
            }}
          >
            {/* STEP NUMBER */}
            <div className="overflow-hidden py-1">
              <span
                className="block transition-opacity"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  color: "rgba(76,62,57,0.6)",
                  opacity: stepTextOpacity,
                  transitionDuration: `${transitionMs}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                Step {current.number}
              </span>
            </div>

            {/* TITLE */}
            <div className="mt-2 overflow-hidden py-1.5">
              <h3
                className="block transition-opacity"
                style={{
                  fontFamily: "'The Bold Font', sans-serif",
                  fontSize: "1.75rem",
                  color: textColor,
                  opacity: stepTextOpacity,
                  transitionDuration: `${transitionMs}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay:
                    visible && hasActiveContent
                      ? `${transitionMs * 0.12}ms`
                      : "0ms",
                }}
              >
                {current.title}
              </h3>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-2 overflow-hidden py-1">
              <p
                className="block transition-opacity"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1rem",
                  color: "rgba(76,62,57,0.8)",
                  lineHeight: "1.6",
                  opacity: stepTextOpacity,
                  transitionDuration: `${transitionMs}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay:
                    visible && hasActiveContent
                      ? `${transitionMs * 0.24}ms`
                      : "0ms",
                }}
              >
                {current.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
