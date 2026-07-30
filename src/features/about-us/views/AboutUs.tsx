import { useLayoutEffect, useRef, useState } from "react";
import { Navbar } from "../../../shared/components/Navbar";
import Footer from "../../home/views/Footer";
import Scroll from "../../../shared/components/Scroll";

type Step = {
  number: string;
  category: string;
  title: string;
  description: string;
  side: "left" | "right";
  to: number; // Video target in seconds for this step
};

const STEPS: Step[] = [
  {
    number: "01",
    category: "What we do",
    title: "Modular Kitchen Cabinets",
    description:
      "Functional and elegant kitchen solutions designed around your lifestyle.",
    side: "left",
    to: 1,
  },
  {
    number: "02",
    category: "What we do",
    title: "Reception Counters",
    description:
      "Professionally designed reception areas that make a lasting impression.",
    side: "right",
    to: 2.7,
  },
  {
    number: "03",
    category: "What we do",
    title: "Office Furniture",
    description:
      "Workstations, executive tables, filing cabinets, and full office interiors.",
    side: "left",
    to: 6,
  },
];

const GALLERY_ITEMS = [
  {
    number: "[04]",
    title: "Cabinets",
    description:
      "Functional and elegant kitchen solutions designed around your lifestyle. Crafted with high-grade architectural finishes.",
    image: "public/images/project_1_portrait.jpg",
  },
  {
    number: "[05]",
    title: "Workstations",
    description:
      "Ergonomic workstations, executive desks, and tailored office configurations engineered for optimal productivity.",
    image: "public/images/project_2_portrait.jpg",
  },
  {
    number: "[06]",
    title: "Reception Counters",
    description:
      "Professionally designed reception areas that establish an immediate mark of sophistication and craft.",
    image: "public/images/project_3_portrait.jpg",
  },
  {
    number: "[07]",
    title: "Storage Systems",
    description:
      "Custom-built storage solutions that maximize space while maintaining a clean, cohesive architectural language.",
    image: "public/images/project_4_portrait.jpg",
  },
  {
    number: "[08]",
    title: "Interior Fit-Outs",
    description:
      "End-to-end interior fit-outs that bring together material, form, and function into a single unified space.",
    image: "public/images/project_5_portrait.jpg",
  },
];

const INTRO_LABEL = "What we do";
const INTRO_HEADING = "Custom solutions for every space";
const INTRO_PARAGRAPH =
  "Take a journey through our process to see how ideas evolve into complete architectural realities.";

const LABEL_STAGGER_MS = 45;
const LABEL_BASE_DELAY_MS = 0;
const HEADING_STAGGER_MS = 45;
const HEADING_BASE_DELAY_MS =
  LABEL_BASE_DELAY_MS + INTRO_LABEL.split(" ").length * LABEL_STAGGER_MS + 200;
const PARAGRAPH_STAGGER_MS = 22;
const PARAGRAPH_BASE_DELAY_MS =
  HEADING_BASE_DELAY_MS +
  INTRO_HEADING.split(" ").length * HEADING_STAGGER_MS +
  250;
const SCROLL_INDICATOR_DELAY_MS =
  PARAGRAPH_BASE_DELAY_MS +
  INTRO_PARAGRAPH.split(" ").length * PARAGRAPH_STAGGER_MS +
  500;

function FlyInWords({
  text,
  baseDelay,
  stagger,
  duration = 650,
  flyDistance = 24,
}: {
  text: string;
  baseDelay: number;
  stagger: number;
  duration?: number;
  flyDistance?: number;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block" }}>
          <span
            style={
              {
                display: "inline-block",
                opacity: 0,
                animationName: "flyInWord",
                animationDuration: `${duration}ms`,
                animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                animationDelay: `${baseDelay + i * stagger}ms`,
                animationFillMode: "both",
                ["--fly-y" as string]: `${flyDistance}px`,
              } as React.CSSProperties
            }
          >
            {word}
          </span>
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

const STAGE_NODES = [
  { start: 0.0, end: 0.1 },
  { start: 0.1, end: 0.22 },
  { start: 0.22, end: 0.34 },
  { start: 0.34, end: 0.45 },
  { start: 0.45, end: 1.0 },
];

export function AboutUs() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoOverlayRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const galleryContainerRef = useRef<HTMLDivElement | null>(null);
  const galleryCenterRef = useRef<HTMLDivElement | null>(null);
  const whatWeDoRef = useRef<HTMLDivElement | null>(null);
  const titleNumberRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef = useRef<HTMLDivElement | null>(null);
  const descTextRef = useRef<HTMLDivElement | null>(null);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const galleryItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const galleryImgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const activeStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const activeTimeUpdateHandler = useRef<(() => void) | null>(null);
  const reverseSeekCleanupRef = useRef<(() => void) | null>(null);
  const scrollRafIdRef = useRef<number | null>(null);

  // -1 = no gallery image has been revealed yet (so the first one also
  // gets an iris-in rather than just appearing).
  const galleryDisplayedIndexRef = useRef(-1);
  const galleryTransitionActiveRef = useRef(false);
  const galleryTransitionRafRef = useRef<number | null>(null);

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useLayoutEffect(() => {
    // Prevent the browser from restoring a mid-scroll position on refresh,
    // which would desync the scroll-driven animation state from the DOM's
    // initial (unstyled) render.
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const video = videoRef.current;
    if (!video) return;

    const cleanupTimeUpdate = () => {
      if (activeTimeUpdateHandler.current) {
        video.removeEventListener(
          "timeupdate",
          activeTimeUpdateHandler.current,
        );
        activeTimeUpdateHandler.current = null;
      }
    };

    const playForwardTo = (target: number, onDone: () => void) => {
      cleanupTimeUpdate();
      reverseSeekCleanupRef.current?.();

      isAnimatingRef.current = true;
      video.playbackRate = 1;

      const onTimeUpdate = () => {
        if (video.currentTime >= target - 0.03) {
          video.pause();
          video.currentTime = target;
          cleanupTimeUpdate();
          isAnimatingRef.current = false;
          onDone();
        }
      };

      activeTimeUpdateHandler.current = onTimeUpdate;
      video.addEventListener("timeupdate", onTimeUpdate);
      video.play().catch(() => {
        cleanupTimeUpdate();
        video.currentTime = target;
        isAnimatingRef.current = false;
        onDone();
      });
    };

    const scrubBackwardTo = (
      target: number,
      durationMs: number,
      onDone: () => void,
    ) => {
      cleanupTimeUpdate();
      reverseSeekCleanupRef.current?.();

      video.pause();
      isAnimatingRef.current = true;

      const startTime = performance.now();
      const startVideoTime = video.currentTime;
      const totalVideoDelta = target - startVideoTime;

      let cancelled = false;
      let rafId: number | null = null;

      const cleanup = () => {
        cancelled = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
        if (reverseSeekCleanupRef.current === cleanup) {
          reverseSeekCleanupRef.current = null;
        }
      };

      // Drive purely off elapsed wall-clock time each animation frame,
      // rather than waiting for the previous seek to fully resolve.
      // Setting currentTime again while a seek is still in flight just
      // redirects the browser to the newest target instead of queueing
      // up behind a slow keyframe decode — this is what keeps reverse
      // scrubbing feeling as responsive as forward playback.
      const step = () => {
        if (cancelled) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const nextTime = startVideoTime + totalVideoDelta * progress;

        video.currentTime = nextTime;

        if (progress >= 1) {
          cleanup();
          video.currentTime = target;
          isAnimatingRef.current = false;
          onDone();
          return;
        }

        rafId = requestAnimationFrame(step);
      };

      reverseSeekCleanupRef.current = cleanup;
      rafId = requestAnimationFrame(step);
    };

    const transitionToStage = (nextStage: number) => {
      if (nextStage === activeStepRef.current) return;

      const targetStep = Math.min(nextStage, STEPS.length);
      const targetTime = targetStep === 0 ? 0 : STEPS[targetStep - 1].to;

      const previousStage = activeStepRef.current;
      activeStepRef.current = nextStage;

      const segmentSeconds = Math.max(
        0.5,
        Math.abs(targetTime - video.currentTime),
      );
      const durationMs = segmentSeconds * 1000;

      const onDone = () => {
        isAnimatingRef.current = false;
      };

      if (nextStage > previousStage) {
        playForwardTo(targetTime, onDone);
      } else {
        scrubBackwardTo(targetTime, durationMs, onDone);
      }
    };

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const cancelGalleryTransition = () => {
      if (galleryTransitionRafRef.current !== null) {
        cancelAnimationFrame(galleryTransitionRafRef.current);
        galleryTransitionRafRef.current = null;
      }
      galleryTransitionActiveRef.current = false;
    };

    // Runs a single self-contained iris reveal: the incoming image sits
    // on top of the outgoing one and is masked by a soft-edged circle
    // that grows from a point to full coverage. Once started it plays to
    // completion on a fixed timer — it does not need to be scrubbed by
    // continued scrolling.
    const startGalleryIris = (toIndex: number) => {
      const fromIndex = galleryDisplayedIndexRef.current;
      if (toIndex === fromIndex) return;

      cancelGalleryTransition();
      galleryTransitionActiveRef.current = true;

      const centerEl = galleryCenterRef.current;
      const toItem = galleryItemRefs.current[toIndex];

      if (!centerEl || !toItem) {
        galleryDisplayedIndexRef.current = toIndex;
        galleryTransitionActiveRef.current = false;
        return;
      }

      const rect = centerEl.getBoundingClientRect();
      const cornerDist = Math.sqrt(rect.width ** 2 + rect.height ** 2) / 2;
      const feather = Math.max(50, cornerDist * 0.28);
      const maxRadius = cornerDist + feather * 0.5;

      GALLERY_ITEMS.forEach((_, idx) => {
        const el = galleryItemRefs.current[idx];
        if (!el || idx === toIndex) return;
        el.style.webkitMaskImage = "none";
        el.style.maskImage = "none";
        el.style.pointerEvents = "none";
        if (idx === fromIndex) {
          el.style.opacity = "1";
          el.style.zIndex = "1";
        } else {
          el.style.opacity = "0";
          el.style.zIndex = "0";
        }
      });

      toItem.style.opacity = "1";
      toItem.style.zIndex = "2";
      toItem.style.pointerEvents = "none";

      const duration = 900;
      const start = performance.now();

      const frame = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = easeInOutCubic(t);
        const r = eased * maxRadius;
        const inner = Math.max(0, r - feather);
        const maskValue = `radial-gradient(circle at 50% 50%, #000 0px, #000 ${inner}px, transparent ${r}px)`;
        toItem.style.webkitMaskImage = maskValue;
        toItem.style.maskImage = maskValue;

        if (t < 1) {
          galleryTransitionRafRef.current = requestAnimationFrame(frame);
          return;
        }

        toItem.style.webkitMaskImage = "none";
        toItem.style.maskImage = "none";
        toItem.style.zIndex = "1";
        galleryDisplayedIndexRef.current = toIndex;
        galleryTransitionActiveRef.current = false;
        galleryTransitionRafRef.current = null;

        GALLERY_ITEMS.forEach((_, idx) => {
          if (idx === toIndex) return;
          const el = galleryItemRefs.current[idx];
          if (el) {
            el.style.opacity = "0";
            el.style.zIndex = "0";
          }
        });
      };

      galleryTransitionRafRef.current = requestAnimationFrame(frame);
    };

    const updateDOMForScroll = (progress: number) => {
      // 1. Calculate Intro screen scroll-up & fade out
      let introOpacity = 0;
      let introTranslateY = 0;

      const node0 = STAGE_NODES[0];
      if (progress <= node0.end) {
        const p = progress / node0.end;
        introOpacity = Math.max(0, 1 - Math.pow(p, 1.2));
        introTranslateY = -100 * p; // Full screen scroll up (-100vh)
      } else {
        introOpacity = 0;
        introTranslateY = -100;
      }

      if (introRef.current) {
        introRef.current.style.opacity = `${introOpacity}`;
        introRef.current.style.transform = `translate3d(0, ${introTranslateY}vh, 0)`;
        introRef.current.style.pointerEvents =
          introOpacity > 0.05 ? "auto" : "none";
      }

      // 2. Video Step Text: Scroll in from bottom (+100vh), pause/center, scroll past top (-100vh) with fades
      for (let index = 0; index < STEPS.length; index++) {
        const stepStageIndex = index + 1;
        const node = STAGE_NODES[stepStageIndex];
        const prevNode = STAGE_NODES[stepStageIndex - 1];

        let opacity = 0;
        let translateY = 100; // Start off-screen at the bottom (100vh)

        if (progress < prevNode.start) {
          // Below the trigger window: hidden at bottom
          opacity = 0;
          translateY = 100;
        } else if (progress < node.start) {
          // Entering phase: transition from 100vh -> 0vh (center)
          const enterProgress =
            (progress - prevNode.start) / (node.start - prevNode.start);
          translateY = 100 * (1 - enterProgress);
          // Fade in during the first half of entry
          opacity = Math.min(1, enterProgress * 2);
        } else if (progress <= node.end) {
          // Active phase: slow transition from center (0vh) up to top exit position (-100vh)
          const activeProgress =
            (progress - node.start) / (node.end - node.start);
          translateY = -100 * activeProgress;

          // Fade out during the final 30% of its duration
          if (activeProgress > 0.7) {
            opacity = 1 - (activeProgress - 0.7) / 0.3;
          } else {
            opacity = 1;
          }
        } else {
          // Past phase: hidden beyond top
          opacity = 0;
          translateY = -100;
        }

        const el = stepRefs.current[index];
        if (el) {
          el.style.opacity = `${opacity}`;
          el.style.transform = `translate3d(0, calc(-50% + ${translateY}vh), 0)`;
          el.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
        }
      }

      // 3. Gallery & Video Opacity Calculations
      const galleryStart = STAGE_NODES[4].start; // 0.45
      const galleryEnd = STAGE_NODES[4].end; // 1.00
      const galleryRawProgress = Math.max(
        0,
        Math.min(1, (progress - galleryStart) / (galleryEnd - galleryStart)),
      );

      const innerImageParallaxY = (0.5 - galleryRawProgress) * 24;

      let videoOpacity = 1;
      if (progress > 0.38 && progress <= galleryStart) {
        videoOpacity = 1 - ((progress - 0.38) / (galleryStart - 0.38)) * 0.9;
      } else if (progress > galleryStart) {
        videoOpacity = galleryRawProgress > 0.05 ? 0 : 0.1;
      }

      if (videoContainerRef.current) {
        videoContainerRef.current.style.opacity = `${videoOpacity}`;
      }

      if (videoOverlayRef.current) {
        videoOverlayRef.current.style.opacity = `${
          introOpacity > 0 ? introOpacity : videoOpacity * 0.4
        }`;
      }

      if (galleryContainerRef.current) {
        galleryContainerRef.current.style.opacity =
          galleryRawProgress > 0 ? "1" : "0";
        galleryContainerRef.current.style.pointerEvents =
          galleryRawProgress > 0 ? "auto" : "none";
      }

      const itemCount = GALLERY_ITEMS.length;
      const itemSegmentLength = 1 / itemCount;

      // -1 means "haven't entered the gallery yet" so the first image
      // also plays an iris-in instead of just appearing.
      const calculatedGalleryIndex =
        galleryRawProgress <= 0
          ? -1
          : Math.min(
              itemCount - 1,
              Math.floor(galleryRawProgress / itemSegmentLength),
            );

      // Crossing a segment boundary just once is enough to kick the iris
      // reveal off — it then runs to completion on its own fixed timer
      // regardless of whether the user keeps scrolling.
      if (
        calculatedGalleryIndex >= 0 &&
        calculatedGalleryIndex !== galleryDisplayedIndexRef.current &&
        !galleryTransitionActiveRef.current
      ) {
        startGalleryIris(calculatedGalleryIndex);
      }

      const textIndex = Math.max(0, calculatedGalleryIndex);

      setActiveGalleryIndex((prev) => (prev !== textIndex ? textIndex : prev));

      const itemProgress =
        (galleryRawProgress - textIndex * itemSegmentLength) /
        itemSegmentLength;

      // Gallery text scroll and fade
      const titleAndNumberY =
        itemProgress < 0.45 ? 100 - (itemProgress / 0.45) * 200 : -100;

      const titleAndNumberOpacity = Math.max(
        0,
        itemProgress < 0.08
          ? itemProgress / 0.08
          : itemProgress > 0.37
            ? 1 - (itemProgress - 0.37) / 0.08
            : 1,
      );

      const descY =
        itemProgress >= 0.45 && itemProgress < 0.9
          ? 100 - ((itemProgress - 0.45) / 0.45) * 200
          : itemProgress >= 0.9
            ? -100
            : 100;

      const descOpacity = Math.max(
        0,
        itemProgress < 0.48
          ? 0
          : itemProgress < 0.55
            ? (itemProgress - 0.48) / 0.07
            : itemProgress > 0.83
              ? 1 - (itemProgress - 0.83) / 0.07
              : 1,
      );

      const whatWeDoOpacity = Math.max(
        0,
        galleryRawProgress < 0.05
          ? galleryRawProgress / 0.05
          : galleryRawProgress > 0.93
            ? 1 - (galleryRawProgress - 0.93) / 0.07
            : 1,
      );

      if (whatWeDoRef.current)
        whatWeDoRef.current.style.opacity = `${whatWeDoOpacity}`;

      if (titleNumberRef.current) {
        titleNumberRef.current.style.transform = `translate3d(0, ${titleAndNumberY}vh, 0)`;
        titleNumberRef.current.style.opacity = `${titleAndNumberOpacity}`;
      }

      if (titleTextRef.current) {
        titleTextRef.current.style.transform = `translate3d(0, ${titleAndNumberY}vh, 0)`;
        titleTextRef.current.style.opacity = `${titleAndNumberOpacity}`;
      }

      if (descTextRef.current) {
        descTextRef.current.style.transform = `translate3d(0, ${descY}vh, 0)`;
        descTextRef.current.style.opacity = `${descOpacity}`;
      }

      // Subtle continuous Ken-Burns pan/zoom on the images — independent
      // of the iris reveal, which is entirely handled by startGalleryIris.
      GALLERY_ITEMS.forEach((_, idx) => {
        const imgEl = galleryImgRefs.current[idx];
        if (imgEl) {
          imgEl.style.transform = `translate3d(0, ${innerImageParallaxY}%, 0) scale(1.3)`;
        }
      });
    };

    const handleScroll = () => {
      if (scrollRafIdRef.current !== null) return;

      scrollRafIdRef.current = requestAnimationFrame(() => {
        scrollRafIdRef.current = null;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const totalScrollableHeight = rect.height - window.innerHeight;
        if (totalScrollableHeight <= 0) return;

        const progress = Math.min(
          Math.max(-rect.top / totalScrollableHeight, 0),
          1,
        );

        updateDOMForScroll(progress);

        let targetStage = 0;
        if (progress >= STAGE_NODES[4].start) {
          targetStage = 4;
        } else if (progress >= STAGE_NODES[3].start) {
          targetStage = 3;
        } else if (progress >= STAGE_NODES[2].start) {
          targetStage = 2;
        } else if (progress >= STAGE_NODES[1].start) {
          targetStage = 1;
        } else {
          targetStage = 0;
        }

        if (targetStage !== activeStepRef.current && !isAnimatingRef.current) {
          transitionToStage(targetStage);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollRafIdRef.current !== null) {
        cancelAnimationFrame(scrollRafIdRef.current);
      }
      cleanupTimeUpdate();
      reverseSeekCleanupRef.current?.();
      if (galleryTransitionRafRef.current !== null) {
        cancelAnimationFrame(galleryTransitionRafRef.current);
      }
    };
  }, []);

  return (
    <div className="relative bg-[#DFD6C9] text-white">
      <Navbar />

      <div ref={containerRef} className="relative h-[1000vh] w-full">
        <section className="sticky top-0 h-screen w-full overflow-hidden bg-[#DFD6C9]">
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

          {/* BACKGROUND VIDEO */}
          <div
            ref={videoContainerRef}
            className="absolute inset-0 h-full w-full pointer-events-none transform-gpu"
          >
            <video
              ref={videoRef}
              src="public/video/about_us.mp4"
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="auto"
            />
          </div>

          {/* DYNAMIC OVERLAY DARKENING LAYER FOR VIDEO */}
          <div
            ref={videoOverlayRef}
            className="absolute inset-0 z-10 bg-black/40 backdrop-blur-md pointer-events-none transform-gpu"
          />

          {/* INTRO SCREEN */}
          <div
            ref={introRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 transform-gpu"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs tracking-[0.3em] uppercase mb-3 block text-white/70 font-sans">
                <FlyInWords
                  text={INTRO_LABEL}
                  baseDelay={LABEL_BASE_DELAY_MS}
                  stagger={LABEL_STAGGER_MS}
                  duration={500}
                  flyDistance={14}
                />
              </span>
              <h1 className="text-3xl md:text-6xl font-bold mb-4 max-w-3xl text-white tracking-tight">
                <FlyInWords
                  text={INTRO_HEADING}
                  baseDelay={HEADING_BASE_DELAY_MS}
                  stagger={HEADING_STAGGER_MS}
                  duration={700}
                  flyDistance={30}
                />
              </h1>
              <p className="text-sm md:text-base max-w-xl leading-relaxed text-white/80 font-sans">
                <FlyInWords
                  text={INTRO_PARAGRAPH}
                  baseDelay={PARAGRAPH_BASE_DELAY_MS}
                  stagger={PARAGRAPH_STAGGER_MS}
                  duration={600}
                  flyDistance={18}
                />
              </p>

              <div
                className="absolute bottom-8 text-xs text-white/50 tracking-wider uppercase"
                style={{
                  opacity: 0,
                  animationName: "fadeInUpIntro",
                  animationDuration: "600ms",
                  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  animationDelay: `${SCROLL_INDICATOR_DELAY_MS}ms`,
                  animationFillMode: "both",
                }}
              >
                <span className="inline-block animate-bounce">
                  Scroll down to step through
                </span>
              </div>
            </div>
          </div>

          {/* STEP CONTENT LAYERS */}
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className={`absolute top-1/2 z-20 w-[88%] max-w-md px-6 sm:px-0 transform-gpu ${
                step.side === "left"
                  ? "left-6 text-left sm:left-16"
                  : "right-6 text-right sm:right-16"
              }`}
              style={{
                willChange: "transform, opacity",
                transform: "translate3d(0, calc(-50% + 100vh), 0)",
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              <div className="overflow-hidden py-1">
                <span className="block font-sans text-xs uppercase tracking-[0.3em] text-white/70">
                  {step.category}
                </span>
              </div>

              <div className="mt-2 overflow-hidden py-1.5">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  {step.title}
                </h2>
              </div>

              <div className="mt-2 overflow-hidden py-1">
                <p className="font-sans text-base leading-relaxed text-white/85">
                  {step.description}
                </p>
              </div>
            </div>
          ))}

          {/* GALLERY PINNED SHOWCASE SECTION */}
          <div
            ref={galleryContainerRef}
            className="absolute inset-0 z-30 flex items-center justify-center px-6 md:px-12 transform-gpu"
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            <div className="relative flex w-full max-w-7xl items-center justify-between gap-6 md:gap-12">
              <div
                ref={whatWeDoRef}
                className="[writing-mode:vertical-rl] absolute -left-30 rotate-180 text-center text-[#4C3E39] font-montserrat text-lg font-normal tracking-widest uppercase transform-gpu"
                style={{ willChange: "opacity", opacity: 0 }}
              >
                WHAT WE DO
              </div>

              {/* LEFT SIDE */}
              <div className="relative flex flex-1 justify-end h-screen items-center overflow-hidden">
                <div
                  ref={titleNumberRef}
                  className="absolute inset-x-0 flex justify-end transform-gpu"
                  style={{
                    willChange: "transform, opacity",
                    transform: "translate3d(0, 100vh, 0)",
                    opacity: 0,
                  }}
                >
                  <span className="text-[#4C3E39] font-poppins text-xl font-normal tracking-widest">
                    {GALLERY_ITEMS[activeGalleryIndex].number}
                  </span>
                </div>
              </div>

              {/* CENTER: IRIS-REVEAL IMAGE CONTAINER */}
              <div
                ref={galleryCenterRef}
                className="relative h-screen w-[420px] max-w-[90vw] shrink-0 overflow-hidden"
              >
                {GALLERY_ITEMS.map((item, idx) => (
                  <div
                    key={item.image}
                    ref={(el) => {
                      galleryItemRefs.current[idx] = el;
                    }}
                    className="absolute inset-0 overflow-hidden transform-gpu"
                    style={{
                      willChange: "opacity",
                      opacity: 0,
                      zIndex: 0,
                    }}
                  >
                    <img
                      ref={(el) => {
                        galleryImgRefs.current[idx] = el;
                      }}
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transform-gpu"
                      style={{ willChange: "transform" }}
                    />
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* RIGHT SIDE */}
              <div className="relative flex flex-1 h-screen items-center justify-start overflow-hidden">
                <div
                  ref={titleTextRef}
                  className="absolute inset-x-0 flex justify-start transform-gpu"
                  style={{
                    willChange: "transform, opacity",
                    transform: "translate3d(0, 100vh, 0)",
                    opacity: 0,
                  }}
                >
                  <h2 className="font-['THE_BOLD_FONT'] text-5xl font-bold leading-none text-[#4C3E39]">
                    {GALLERY_ITEMS[activeGalleryIndex].title}
                  </h2>
                </div>

                <div
                  ref={descTextRef}
                  className="absolute inset-x-0 flex justify-start transform-gpu"
                  style={{
                    willChange: "transform, opacity",
                    transform: "translate3d(0, 100vh, 0)",
                    opacity: 0,
                  }}
                >
                  <p className="max-w-md font-sans leading-relaxed text-[#4C3E39]/90 text-xl font-light">
                    {GALLERY_ITEMS[activeGalleryIndex].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Scroll />
      <Footer />
    </div>
  );
}
