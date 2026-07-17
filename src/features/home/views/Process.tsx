import { useEffect, useRef, useState } from "react";

type Step = {
  number: string;
  title: string;
  description: string;
  side: "left" | "right";
  to: number; // seek/landing target in seconds for this step
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Consultation",
    description:
      "We start by understanding your needs, lifestyle, budget, and design preferences.",
    side: "right",
    to: 3,
  },
  {
    number: "02",
    title: "Site Measurement",
    description:
      "Our team visits to take accurate measurements and evaluate the space.",
    side: "left",
    to: 5,
  },
  {
    number: "03",
    title: "Material Selection",
    description:
      "Choose from a wide range of colors, finishes, hardware, and materials.",
    side: "left",
    to: 6.5,
  },
  {
    number: "04",
    title: "Delivery & Installation",
    description:
      "Experienced installers assemble everything perfectly and ready for use.",
    side: "left",
    to: 9,
  },
];

const COOLDOWN_MS = 250;
const TOUCH_TRIGGER_PX = 35;
const MIN_ANIMATION_MS = 400;
const VIEW_EPS = 2; // px tolerance for "fully in view"
const TEXT_COLOR = "#4C3E39";

// --- Intro fly-in text content & timing -----------------------------------

const INTRO_LABEL = "How we work";
const INTRO_HEADING = "A proven process, from idea to installation";
const INTRO_PARAGRAPH =
  "Four carefully managed steps that keep your project on schedule and hold every detail to a single standard of quality.";

const LABEL_STAGGER_MS = 45;
const LABEL_BASE_DELAY_MS = 0;
const LABEL_WORD_COUNT = INTRO_LABEL.split(" ").length;

const HEADING_STAGGER_MS = 45;
const HEADING_BASE_DELAY_MS =
  LABEL_BASE_DELAY_MS + LABEL_WORD_COUNT * LABEL_STAGGER_MS + 200;
const HEADING_WORD_COUNT = INTRO_HEADING.split(" ").length;

const PARAGRAPH_STAGGER_MS = 22;
const PARAGRAPH_BASE_DELAY_MS =
  HEADING_BASE_DELAY_MS + HEADING_WORD_COUNT * HEADING_STAGGER_MS + 250;
const PARAGRAPH_WORD_COUNT = INTRO_PARAGRAPH.split(" ").length;

const SCROLL_INDICATOR_DELAY_MS =
  PARAGRAPH_BASE_DELAY_MS + PARAGRAPH_WORD_COUNT * PARAGRAPH_STAGGER_MS + 500;

// Splits `text` into words and flies each one in with a staggered delay.
// `key`-remounting the parent (see `introPlayKey` in Process) replays this
// every time the intro reappears, since CSS keyframe animations only run
// again when the element is freshly created in the DOM.
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

export function Process() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stepIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const isLockedRef = useRef(false);
  const cooldownRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const activeTimeUpdateHandler = useRef<(() => void) | null>(null);
  const reverseSeekCleanupRef = useRef<(() => void) | null>(null);

  // Intro states
  const [introActive, setIntroActive] = useState(true);
  const introActiveRef = useRef(true);
  // Bumped every time the intro re-appears so the fly-in word animation replays
  const [introPlayKey, setIntroPlayKey] = useState(0);

  // Track if the section is 50% visible in the viewport
  const [isInView50, setIsInView50] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [transitionMs, setTransitionMs] = useState(600);
  const [scrollDirection, setScrollDirection] = useState<
    "forward" | "backward"
  >("forward");

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Intersection Observer to monitor 50% section visibility
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView50(entry.isIntersecting);
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(section);

    const lockScroll = () => {
      if (isLockedRef.current) return;
      isLockedRef.current = true;
      document.body.style.overflow = "hidden";
    };

    const unlockScroll = () => {
      if (!isLockedRef.current) return;
      isLockedRef.current = false;
      document.body.style.overflow = "";
    };

    const sectionFullyInView = () => {
      const rect = section.getBoundingClientRect();
      return (
        rect.top <= VIEW_EPS && rect.bottom >= window.innerHeight - VIEW_EPS
      );
    };

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
        video.removeEventListener("seeked", onSeeked);
        if (rafId !== null) cancelAnimationFrame(rafId);
        if (reverseSeekCleanupRef.current === cleanup) {
          reverseSeekCleanupRef.current = null;
        }
      };

      const requestNextSeek = () => {
        if (cancelled) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        if (progress >= 1) {
          cleanup();
          video.currentTime = target;
          isAnimatingRef.current = false;
          onDone();
          return;
        }

        const nextTime = startVideoTime + totalVideoDelta * progress;
        video.currentTime = nextTime;
      };

      const onSeeked = () => {
        rafId = requestAnimationFrame(requestNextSeek);
      };

      video.addEventListener("seeked", onSeeked);
      reverseSeekCleanupRef.current = cleanup;

      requestNextSeek();
    };

    const goToStep = (nextIndex: number, direction: number) => {
      if (isAnimatingRef.current) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const target =
        nextIndex === 0 ? 0 : Math.min(STEPS[nextIndex - 1].to, duration);

      const segmentSeconds = Math.abs(target - video.currentTime);
      const durationMs = Math.max(MIN_ANIMATION_MS, segmentSeconds * 1000);
      setTransitionMs(durationMs);

      const dir = direction > 0 ? "forward" : "backward";
      setScrollDirection(dir);

      setVisible(false);

      setTimeout(() => {
        setActiveStep(nextIndex);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(nextIndex > 0);
          });
        });
      }, 250);

      const onDone = () => {
        stepIndexRef.current = nextIndex;
      };

      if (direction > 0) {
        playForwardTo(target, onDone);
      } else {
        scrubBackwardTo(target, durationMs, onDone);
      }
    };

    const runCooldown = () => {
      cooldownRef.current = true;
      window.setTimeout(() => {
        cooldownRef.current = false;
      }, COOLDOWN_MS);
    };

    const handleDirection = (direction: number, preventable: () => void) => {
      // 1. Check if the intro screen is active
      if (introActiveRef.current) {
        if (!sectionFullyInView()) return;

        if (direction > 0) {
          // User scrolled down: remove intro layer and move straight to Step 1
          preventable();
          introActiveRef.current = false;
          setIntroActive(false);
          lockScroll();
          goToStep(1, 1);
          runCooldown();
        } else {
          // User scrolled up while intro is showing: release the lock and let
          // the browser handle the scroll natively so they can leave the section.
          // IMPORTANT: do NOT call preventable()/preventDefault() here.
          unlockScroll();
        }
        return;
      }

      // 2. Regular step process management
      if (!isLockedRef.current) {
        if (!sectionFullyInView()) return;
        if (direction > 0 && stepIndexRef.current >= STEPS.length) return;
        if (direction < 0 && stepIndexRef.current <= 0) return;
        lockScroll();
      }

      if (direction > 0 && stepIndexRef.current >= STEPS.length) {
        unlockScroll();
        return;
      }

      // Going backward from Step 1 always returns to the Intro screen
      // (checked BEFORE the generic <= 0 guard so it can never be skipped)
      if (direction < 0 && stepIndexRef.current === 1) {
        preventable();
        if (isAnimatingRef.current || cooldownRef.current) return;
        introActiveRef.current = true;
        setIntroActive(true);
        setIntroPlayKey((k) => k + 1);
        goToStep(0, -1);
        runCooldown();
        return;
      }

      if (direction < 0 && stepIndexRef.current <= 0) {
        unlockScroll();
        return;
      }

      preventable();

      if (isAnimatingRef.current || cooldownRef.current) return;

      goToStep(stepIndexRef.current + (direction > 0 ? 1 : -1), direction);
      runCooldown();
    };

    const handleWheel = (e: WheelEvent) => {
      handleDirection(e.deltaY, () => e.preventDefault());
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const startY = touchStartYRef.current;
      if (startY === null) return;
      const currentY = e.touches[0]?.clientY ?? startY;
      const delta = startY - currentY;

      if (Math.abs(delta) < TOUCH_TRIGGER_PX) {
        if (!isLockedRef.current && !introActiveRef.current) return;
        e.preventDefault();
        return;
      }

      handleDirection(delta, () => e.preventDefault());
      touchStartYRef.current = currentY;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      observer.disconnect();
      cleanupTimeUpdate();
      reverseSeekCleanupRef.current?.();
      document.body.style.overflow = "";
    };
  }, []);

  const current = activeStep > 0 ? STEPS[activeStep - 1] : STEPS[0];
  const hasActiveContent = activeStep > 0;

  const getTranslationClass = () => {
    if (visible && hasActiveContent) {
      return "translate-y-0 opacity-100 scale-100";
    }
    if (scrollDirection === "forward") {
      return "translate-y-[80%] opacity-0 scale-95";
    } else {
      return "-translate-y-[80%] opacity-0 scale-95";
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-[#060606]"
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

      <video
        ref={videoRef}
        src="/video/process.mp4"
        className="absolute inset-0 h-full w-full object-cover"
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
                text={INTRO_LABEL}
                baseDelay={LABEL_BASE_DELAY_MS}
                stagger={LABEL_STAGGER_MS}
                duration={500}
                flyDistance={14}
              />
            </span>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4 max-w-2xl text-white"
              style={{ fontFamily: "'The Bold Font', sans-serif" }}
            >
              <FlyInWords
                text={INTRO_HEADING}
                baseDelay={HEADING_BASE_DELAY_MS}
                stagger={HEADING_STAGGER_MS}
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
                text={INTRO_PARAGRAPH}
                baseDelay={PARAGRAPH_BASE_DELAY_MS}
                stagger={PARAGRAPH_STAGGER_MS}
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
                animationDelay: `${SCROLL_INDICATOR_DELAY_MS}ms`,
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

      {/* STEP CONTENT LAYERS */}
      <div
        key={activeStep}
        className={`absolute top-1/2 z-20 w-[88%] max-w-md -translate-y-1/2 px-6 transition-all duration-300 ease-in-out sm:px-0 ${
          hasActiveContent && !introActive
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } ${
          current.side === "left"
            ? "left-6 text-left sm:left-16"
            : "right-6 text-right sm:right-16"
        }`}
      >
        {/* STEP NUMBER */}
        <div className="overflow-hidden py-1">
          <span
            className={`block transform-gpu transition-all cubic-bezier(0.16, 1, 0.3, 1) ${getTranslationClass()}`}
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "rgba(76,62,57,0.6)",
              transitionDuration: `${transitionMs}ms`,
            }}
          >
            Step {current.number}
          </span>
        </div>

        {/* TITLE */}
        <div className="mt-2 overflow-hidden py-1.5">
          <h3
            className={`block transform-gpu transition-all cubic-bezier(0.16, 1, 0.3, 1) ${getTranslationClass()}`}
            style={{
              fontFamily: "'The Bold Font', sans-serif",
              fontSize: "1.75rem",
              color: TEXT_COLOR,
              transitionDuration: `${transitionMs}ms`,
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
            className={`block transform-gpu transition-all cubic-bezier(0.16, 1, 0.3, 1) ${getTranslationClass()}`}
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1rem",
              color: "rgba(76,62,57,0.8)",
              lineHeight: "1.6",
              transitionDuration: `${transitionMs}ms`,
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
    </section>
  );
}
