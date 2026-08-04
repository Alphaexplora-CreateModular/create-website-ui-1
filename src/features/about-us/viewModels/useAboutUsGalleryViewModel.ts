import { useLayoutEffect, useRef, useState } from "react";
import { ABOUT_US_GALLERY_ITEMS, ABOUT_US_STEPS } from "./aboutUsContent";
import type { AboutUsHeaderRefs } from "./useAboutUsHeaderViewModel";

const STAGE_NODES = [
  { start: 0.0, end: 0.1 },
  { start: 0.1, end: 0.22 },
  { start: 0.22, end: 0.34 },
  { start: 0.34, end: 0.45 },
  { start: 0.45, end: 1.0 },
];

export function useAboutUsGalleryViewModel(headerRefs: AboutUsHeaderRefs) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const galleryContainerRef = useRef<HTMLDivElement | null>(null);
  const galleryCenterRef = useRef<HTMLDivElement | null>(null);
  const whatWeDoRef = useRef<HTMLDivElement | null>(null);
  const titleNumberRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef = useRef<HTMLDivElement | null>(null);
  const descTextRef = useRef<HTMLDivElement | null>(null);

  const galleryItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const galleryImgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const activeStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const activeTimeUpdateHandler = useRef<(() => void) | null>(null);
  const reverseSeekCleanupRef = useRef<(() => void) | null>(null);
  const forwardLoopCleanupRef = useRef<(() => void) | null>(null);
  const scrollRafIdRef = useRef<number | null>(null);

  const galleryDisplayedIndexRef = useRef(-1);
  const galleryTransitionActiveRef = useRef(false);
  const galleryTransitionCleanupRef = useRef<(() => void) | null>(null);

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useLayoutEffect(() => {
    ABOUT_US_GALLERY_ITEMS.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, []);

  useLayoutEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    const video = headerRefs.videoRef.current;
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

    const supportsFrameCallback =
      typeof (video as any).requestVideoFrameCallback === "function";

    const playForwardTo = (target: number, onDone: () => void) => {
      cleanupTimeUpdate();
      reverseSeekCleanupRef.current?.();
      forwardLoopCleanupRef.current?.();

      isAnimatingRef.current = true;
      video.playbackRate = 1;

      let frameCallbackId: number | null = null;
      let stopped = false;

      const cancelLoop = () => {
        if (stopped) return;
        stopped = true;
        cleanupTimeUpdate();
        if (
          frameCallbackId !== null &&
          typeof (video as any).cancelVideoFrameCallback === "function"
        ) {
          (video as any).cancelVideoFrameCallback(frameCallbackId);
        }
        if (forwardLoopCleanupRef.current === cancelLoop) {
          forwardLoopCleanupRef.current = null;
        }
      };

      const finish = () => {
        if (stopped) return;
        cancelLoop();
        video.pause();
        video.currentTime = target;
        isAnimatingRef.current = false;
        onDone();
      };

      const checkTime = () => {
        if (video.currentTime >= target - 0.03) {
          finish();
          return true;
        }

        return false;
      };

      if (supportsFrameCallback) {
        const onFrame = () => {
          if (stopped) return;
          if (!checkTime()) {
            frameCallbackId = (video as any).requestVideoFrameCallback(onFrame);
          }
        };

        frameCallbackId = (video as any).requestVideoFrameCallback(onFrame);
      } else {
        const onTimeUpdate = () => {
          checkTime();
        };

        activeTimeUpdateHandler.current = onTimeUpdate;
        video.addEventListener("timeupdate", onTimeUpdate);
      }

      forwardLoopCleanupRef.current = cancelLoop;

      video.play().catch(() => {
        cancelLoop();
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
      forwardLoopCleanupRef.current?.();

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

    const transitionToStage = (nextStage: number) => {
      if (nextStage === activeStepRef.current) return;

      const targetStep = Math.min(nextStage, ABOUT_US_STEPS.length);
      const targetTime = targetStep === 0 ? 0 : ABOUT_US_STEPS[targetStep - 1].to;

      const previousStage = activeStepRef.current;
      activeStepRef.current = nextStage;

      const segmentSeconds = Math.max(
        0.5,
        Math.abs(targetTime - video.currentTime),
      );
      const durationMs = segmentSeconds * 1000;

      const onDone = () => {
        isAnimatingRef.current = false;
        syncStageToScroll();
      };

      if (nextStage > previousStage) {
        playForwardTo(targetTime, onDone);
      } else {
        scrubBackwardTo(targetTime, durationMs, onDone);
      }
    };

    const cancelGalleryTransition = () => {
      if (galleryTransitionCleanupRef.current) {
        galleryTransitionCleanupRef.current();
        galleryTransitionCleanupRef.current = null;
      }
      galleryTransitionActiveRef.current = false;
    };

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
      const maxRadius = Math.sqrt(rect.width ** 2 + rect.height ** 2) / 2 + 12;

      const setClip = (el: HTMLElement, value: string) => {
        el.style.clipPath = value;
        (el.style as unknown as Record<string, string>).webkitClipPath = value;
      };

      const setClipTransition = (el: HTMLElement, value: string) => {
        el.style.transition = value;
        (el.style as unknown as Record<string, string>).webkitTransition =
          value.replace("clip-path", "-webkit-clip-path");
      };

      ABOUT_US_GALLERY_ITEMS.forEach((_, idx) => {
        const el = galleryItemRefs.current[idx];
        if (!el || idx === toIndex) return;
        setClipTransition(el, "none");
        setClip(el, "none");
        el.style.pointerEvents = "none";
        if (idx === fromIndex) {
          el.style.opacity = "1";
          el.style.zIndex = "1";
        } else {
          el.style.opacity = "0";
          el.style.zIndex = "0";
        }
      });

      setClipTransition(toItem, "none");
      setClip(toItem, "circle(0px at 50% 50%)");
      toItem.style.opacity = "1";
      toItem.style.zIndex = "2";
      toItem.style.pointerEvents = "none";

      void toItem.offsetWidth;

      const duration = 900;
      setClipTransition(
        toItem,
        `clip-path ${duration}ms cubic-bezier(0.65, 0, 0.35, 1)`,
      );
      setClip(toItem, `circle(${maxRadius}px at 50% 50%)`);

      let settled = false;
      let timeoutId: number | null = null;

      const finishReveal = () => {
        if (settled) return;
        settled = true;
        toItem.removeEventListener("transitionend", onTransitionEnd);
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (galleryTransitionCleanupRef.current === cleanup) {
          galleryTransitionCleanupRef.current = null;
        }

        setClipTransition(toItem, "none");
        setClip(toItem, "none");
        toItem.style.zIndex = "1";
        galleryDisplayedIndexRef.current = toIndex;
        galleryTransitionActiveRef.current = false;

        ABOUT_US_GALLERY_ITEMS.forEach((_, idx) => {
          if (idx === toIndex) return;
          const el = galleryItemRefs.current[idx];
          if (el) {
            el.style.opacity = "0";
            el.style.zIndex = "0";
          }
        });
      };

      const onTransitionEnd = (e: TransitionEvent) => {
        if (e.target !== toItem) return;
        if (e.propertyName !== "clip-path") return;
        finishReveal();
      };

      toItem.addEventListener("transitionend", onTransitionEnd);

      timeoutId = window.setTimeout(finishReveal, duration + 200);

      const cleanup = () => {
        if (settled) return;
        settled = true;
        toItem.removeEventListener("transitionend", onTransitionEnd);
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      galleryTransitionCleanupRef.current = cleanup;
    };

    const updateDOMForScroll = (progress: number) => {
      let introOpacity = 0;
      let introTranslateY = 0;

      const node0 = STAGE_NODES[0];
      if (progress <= node0.end) {
        const p = progress / node0.end;
        introOpacity = Math.max(0, 1 - Math.pow(p, 1.2));
        introTranslateY = -100 * p;
      } else {
        introOpacity = 0;
        introTranslateY = -100;
      }

      if (headerRefs.introRef.current) {
        headerRefs.introRef.current.style.opacity = `${introOpacity}`;
        headerRefs.introRef.current.style.transform = `translate3d(0, ${introTranslateY}vh, 0)`;
        headerRefs.introRef.current.style.pointerEvents =
          introOpacity > 0.05 ? "auto" : "none";
      }

      for (let index = 0; index < ABOUT_US_STEPS.length; index++) {
        const stepStageIndex = index + 1;
        const node = STAGE_NODES[stepStageIndex];
        const prevNode = STAGE_NODES[stepStageIndex - 1];

        let opacity = 0;
        let translateY = 100;

        if (progress < prevNode.start) {
          opacity = 0;
          translateY = 100;
        } else if (progress < node.start) {
          const enterProgress =
            (progress - prevNode.start) / (node.start - prevNode.start);
          translateY = 100 * (1 - enterProgress);
          opacity = Math.min(1, enterProgress * 2);
        } else if (progress <= node.end) {
          const activeProgress =
            (progress - node.start) / (node.end - node.start);
          translateY = -100 * activeProgress;

          if (activeProgress > 0.7) {
            opacity = 1 - (activeProgress - 0.7) / 0.3;
          } else {
            opacity = 1;
          }
        } else {
          opacity = 0;
          translateY = -100;
        }

        const el = headerRefs.stepRefs.current[index];
        if (el) {
          el.style.opacity = `${opacity}`;
          el.style.transform = `translate3d(0, calc(-50% + ${translateY}vh), 0)`;
          el.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
        }
      }

      const galleryStart = STAGE_NODES[4].start;
      const galleryEnd = STAGE_NODES[4].end;
      const slideStart = 0.36;
      const slideProgress = Math.max(
        0,
        Math.min(1, (progress - slideStart) / (galleryStart - slideStart)),
      );

      const galleryTranslateY = 100 * (1 - slideProgress);

      if (galleryContainerRef.current) {
        galleryContainerRef.current.style.transform = `translate3d(0, ${galleryTranslateY}vh, 0)`;
        galleryContainerRef.current.style.opacity =
          slideProgress > 0 ? "1" : "0";
        galleryContainerRef.current.style.pointerEvents =
          slideProgress >= 1 ? "auto" : "none";
      }

      if (headerRefs.videoContainerRef.current) {
        if (slideProgress >= 1) {
          headerRefs.videoContainerRef.current.style.opacity = "0";
          headerRefs.videoContainerRef.current.style.visibility = "hidden";
        } else {
          headerRefs.videoContainerRef.current.style.opacity = "1";
          headerRefs.videoContainerRef.current.style.visibility = "visible";
        }
      }

      const galleryRawProgress = Math.max(
        0,
        Math.min(1, (progress - galleryStart) / (galleryEnd - galleryStart)),
      );

      const innerImageParallaxY = (0.5 - galleryRawProgress) * 24;
      const itemCount = ABOUT_US_GALLERY_ITEMS.length;
      const itemSegmentLength = 1 / itemCount;

      const calculatedGalleryIndex =
        galleryRawProgress <= 0
          ? -1
          : Math.min(
              itemCount - 1,
              Math.floor(galleryRawProgress / itemSegmentLength),
            );

      if (
        calculatedGalleryIndex >= 0 &&
        calculatedGalleryIndex !== galleryDisplayedIndexRef.current &&
        !galleryTransitionActiveRef.current
      ) {
        startGalleryIris(calculatedGalleryIndex);
      }

      const textIndex = Math.max(0, calculatedGalleryIndex);
      setActiveGalleryIndex((previous) => (previous !== textIndex ? textIndex : previous));

      const itemProgress =
        (galleryRawProgress - textIndex * itemSegmentLength) /
        itemSegmentLength;

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

      if (whatWeDoRef.current) {
        whatWeDoRef.current.style.opacity = `${whatWeDoOpacity}`;
      }

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

      ABOUT_US_GALLERY_ITEMS.forEach((_, idx) => {
        const imgEl = galleryImgRefs.current[idx];
        if (imgEl) {
          imgEl.style.transform = `translate3d(0, ${innerImageParallaxY}%, 0) scale(1.3)`;
        }
      });
    };

    const getTargetStageForProgress = (progress: number) => {
      if (progress >= STAGE_NODES[4].start) return 4;
      if (progress >= STAGE_NODES[3].start) return 3;
      if (progress >= STAGE_NODES[2].start) return 2;
      if (progress >= STAGE_NODES[1].start) return 1;
      return 0;
    };

    const getScrollProgress = () => {
      const container = containerRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;
      if (totalScrollableHeight <= 0) return null;
      return Math.min(Math.max(-rect.top / totalScrollableHeight, 0), 1);
    };

    const syncStageToScroll = () => {
      const progress = getScrollProgress();
      if (progress === null) return;
      const targetStage = getTargetStageForProgress(progress);
      if (targetStage !== activeStepRef.current) {
        transitionToStage(targetStage);
      }
    };

    const handleScroll = () => {
      if (scrollRafIdRef.current !== null) return;

      scrollRafIdRef.current = requestAnimationFrame(() => {
        scrollRafIdRef.current = null;
        const progress = getScrollProgress();
        if (progress === null) return;

        updateDOMForScroll(progress);
        syncStageToScroll();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const initTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
      const initialProgress = getScrollProgress();
      if (initialProgress !== null) {
        updateDOMForScroll(initialProgress);
        const targetStage = getTargetStageForProgress(initialProgress);
        activeStepRef.current = targetStage;
        if (video) {
          video.currentTime =
            targetStage === 0
              ? 0
              : ABOUT_US_STEPS[Math.min(targetStage, ABOUT_US_STEPS.length) - 1].to;
        }
      }
    }, 50);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener("scroll", handleScroll);
      if (scrollRafIdRef.current !== null) {
        cancelAnimationFrame(scrollRafIdRef.current);
      }
      cleanupTimeUpdate();
      reverseSeekCleanupRef.current?.();
      forwardLoopCleanupRef.current?.();
      galleryTransitionCleanupRef.current?.();
    };
  }, [headerRefs]);

  return {
    data: {
      galleryItems: ABOUT_US_GALLERY_ITEMS,
    },
    state: {
      activeGalleryIndex,
    },
    refs: {
      containerRef,
      galleryContainerRef,
      galleryCenterRef,
      whatWeDoRef,
      titleNumberRef,
      titleTextRef,
      descTextRef,
      galleryItemRefs,
      galleryImgRefs,
    },
  };
}

export type AboutUsGalleryViewModel = ReturnType<typeof useAboutUsGalleryViewModel>;