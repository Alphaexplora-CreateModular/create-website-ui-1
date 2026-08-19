import { useEffect, useRef, useState } from "react";

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
  side: "left" | "right";
  to: number; // seek/landing target in seconds for this step
};

const STEPS: ProcessStep[] = [
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
const PROCESS_PIN_HEIGHT_VH = 500;

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

export function useProcessViewModel() {
  const containerRef = useRef<HTMLDivElement | null>(null);
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
  // True only for the brief window where the OUTGOING step content is
  // animating away (before the new step mounts). Kept separate from
  // `scrollDirection` so the outgoing block can fly off the opposite side
  // from where the incoming block enters — a continuous up/down sweep,
  // matching the About Us step transition.
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!container || !section || !video) return;

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
    };

    const unlockScroll = () => {
      if (!isLockedRef.current) return;
      isLockedRef.current = false;
    };

    const sectionFullyInView = () => {
      const rect = section.getBoundingClientRect();
      return (
        rect.top <= VIEW_EPS && rect.bottom >= window.innerHeight - VIEW_EPS
      );
    };

    const isAtProcessStart = () => {
      const rect = container.getBoundingClientRect();
      return rect.top >= -VIEW_EPS;
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

      // Send the current content flying off in the direction of travel
      // (up for forward, down for backward) instead of toward where the
      // next content will enter from.
      setIsExiting(true);
      setVisible(false);

      setTimeout(() => {
        setActiveStep(nextIndex);
        setIsExiting(false);

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
      if (isLockedRef.current && !sectionFullyInView()) {
        unlockScroll();
      }

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
          // Keep the section pinned while moving upward through its own range.
          // Only release once we're back at the very start of Process.
          if (isAtProcessStart()) {
            unlockScroll();
          } else {
            lockScroll();
            preventable();
          }
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
        if (isAtProcessStart()) {
          unlockScroll();
        } else {
          lockScroll();
          preventable();
        }
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
    };
  }, []);

  const current = activeStep > 0 ? STEPS[activeStep - 1] : STEPS[0];
  const hasActiveContent = activeStep > 0;

  // Position of the whole step-content block: centered when visible, or
  // parked a full viewport-height above/below the section when hidden.
  // Entering content always comes from the direction of travel (below for
  // forward, above for backward) and exiting content always continues
  // past the opposite edge — one continuous up/down sweep through the
  // section, the same way the About Us step text travels.
  const getStepBlockTransform = () => {
    if (visible && hasActiveContent) {
      return "translate3d(0, -50%, 0)";
    }
    const goingForward = scrollDirection === "forward";
    const offVh = isExiting
      ? goingForward
        ? -100
        : 100
      : goingForward
        ? 100
        : -100;
    return `translate3d(0, calc(-50% + ${offVh}vh), 0)`;
  };

  const stepTextOpacity = visible && hasActiveContent ? 1 : 0;

  return {
    data: {
      steps: STEPS,
      textColor: TEXT_COLOR,
      pinHeightVh: PROCESS_PIN_HEIGHT_VH,
      intro: {
        label: INTRO_LABEL,
        heading: INTRO_HEADING,
        paragraph: INTRO_PARAGRAPH,
        timing: {
          labelBaseDelayMs: LABEL_BASE_DELAY_MS,
          labelStaggerMs: LABEL_STAGGER_MS,
          headingBaseDelayMs: HEADING_BASE_DELAY_MS,
          headingStaggerMs: HEADING_STAGGER_MS,
          paragraphBaseDelayMs: PARAGRAPH_BASE_DELAY_MS,
          paragraphStaggerMs: PARAGRAPH_STAGGER_MS,
          scrollIndicatorDelayMs: SCROLL_INDICATOR_DELAY_MS,
        },
      },
    },
    state: {
      introActive,
      introPlayKey,
      isInView50,
      activeStep,
      visible,
      transitionMs,
      scrollDirection,
      isExiting,
      current,
      hasActiveContent,
      stepBlockTransform: getStepBlockTransform(),
      stepTextOpacity,
    },
    refs: {
      containerRef,
      sectionRef,
      videoRef,
    },
  };
}

export type ProcessViewModel = ReturnType<typeof useProcessViewModel>;
