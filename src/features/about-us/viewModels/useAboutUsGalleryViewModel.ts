import { useLayoutEffect, useRef } from "react";
import { ABOUT_US_STEPS } from "./aboutUsContent";
import type { AboutUsHeaderRefs } from "./useAboutUsHeaderViewModel";

const STAGE_NODES = [
  { start: 0.0, end: 0.15 },
  { start: 0.15, end: 0.43 },
  { start: 0.43, end: 0.71 },
  { start: 0.71, end: 1.0 },
];

export function useAboutUsGalleryViewModel(headerRefs: AboutUsHeaderRefs) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const activeTimeUpdateHandler = useRef<(() => void) | null>(null);
  const reverseSeekCleanupRef = useRef<(() => void) | null>(null);
  const forwardLoopCleanupRef = useRef<(() => void) | null>(null);
  const scrollRafIdRef = useRef<number | null>(null);

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

    const updateDOMForScroll = (progress: number) => {
      const node0 = STAGE_NODES[0];

      let introOpacity = 0;
      let introTranslateY = 0;

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
    };

    const getTargetStageForProgress = (progress: number) => {
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

    // Re-syncs the video/DOM to wherever the user actually is once layout has
    // settled (fonts/video metadata can shift container height right after
    // mount). Must not force scroll back to 0 here - the page-level effect
    // already owns "start at top", and forcing it a second time mid-flight
    // snaps the user back and resets the video if they've scrolled in the
    // meantime (most visible right after a refresh).
    const initTimeout = setTimeout(() => {
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
        scrollRafIdRef.current = null;
      }
      cleanupTimeUpdate();
      reverseSeekCleanupRef.current?.();
      forwardLoopCleanupRef.current?.();
    };
  }, [headerRefs]);

  return {
    refs: {
      containerRef,
    },
  };
}

export type AboutUsGalleryViewModel = ReturnType<typeof useAboutUsGalleryViewModel>;
