import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { drawCover, easeInOutCubic, easeOutCubic } from "../../../shared/utils/canvas";

export type NightState = {
  progress: number;
  origin: { x: number; y: number } | null;
  isNight: boolean;
};

// --- Couch reveal canvas ----------------------------------------------------

type UseCouchRevealCanvasOptions = {
  daySrc: string;
  nightSrc: string;
  objectPositionX?: number;
  objectPositionY?: number;
  nightStateRef: React.RefObject<NightState>;
  onToggleNight?: (isNight: boolean) => void;
};

const POINTER_EASE = 0.09;
const BASE_RADIUS = 150;
const STRETCH_FACTOR = 2.6;
const MAX_LENGTH_RADIUS = 260;
const WIDTH_SHRINK_FACTOR = 0.9;
const MIN_WIDTH_RADIUS = 26;
const MASK_BLUR_PX = 10;
const TRAIL_HOLD_MS = 2000;
const TRAIL_FADE_MS = 1200;
const NIGHT_TRANSITION_MS = 1000;
const NAV_HOVER_SELECTOR = ".site-navbar";
const NAV_SCALE_EASE = 0.15;

export function useCouchRevealCanvasViewModel({
  daySrc,
  nightSrc,
  objectPositionX = 50,
  objectPositionY = 20.29,
  nightStateRef,
  onToggleNight,
}: UseCouchRevealCanvasOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const dayImgRef = useRef<HTMLImageElement | null>(null);
  const nightImgRef = useRef<HTMLImageElement | null>(null);

  const targetPointerRef = useRef<{ x: number; y: number } | null>(null);
  const headRef = useRef<{ x: number; y: number } | null>(null);
  const prevHeadRef = useRef<{ x: number; y: number } | null>(null);
  const angleRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const rafRef = useRef<number | null>(null);

  const isNightRef = useRef(false);
  const nightProgressRef = useRef(0);
  const nightTargetRef = useRef(0);
  const nightFromRef = useRef(0);
  const nightTransitionStartRef = useRef(0);
  const nightOriginRef = useRef<{ x: number; y: number } | null>(null);

  const scrollScaleRef = useRef(1);
  const isOverNavRef = useRef(false);
  const navScaleRef = useRef(1);

  const triggerNightToggle = useCallback(
    (clientX?: number, clientY?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const defaultX = rect.width / 2;
      const defaultY = rect.height / 2;

      const posX = clientX !== undefined ? clientX - rect.left : defaultX;
      const posY = clientY !== undefined ? clientY - rect.top : defaultY;

      const x = posX * (canvas.width / rect.width);
      const y = posY * (canvas.height / rect.height);

      nightOriginRef.current = { x, y };
      isNightRef.current = !isNightRef.current;
      nightFromRef.current = nightProgressRef.current;
      nightTargetRef.current = isNightRef.current ? 1 : 0;
      nightTransitionStartRef.current = performance.now();

      if (nightStateRef.current) {
        nightStateRef.current.isNight = isNightRef.current;
        nightStateRef.current.origin = {
          x: clientX ?? window.innerWidth / 2,
          y: clientY ?? window.innerHeight / 2,
        };
      }

      onToggleNight?.(isNightRef.current);
    },
    [nightStateRef, onToggleNight],
  );

  useEffect(() => {
    if (!maskCanvasRef.current)
      maskCanvasRef.current = document.createElement("canvas");
    if (!tempCanvasRef.current)
      tempCanvasRef.current = document.createElement("canvas");

    const dayImg = new Image();
    dayImg.src = daySrc;
    dayImgRef.current = dayImg;

    const nightImg = new Image();
    nightImg.src = nightSrc;
    nightImgRef.current = nightImg;
  }, [daySrc, nightSrc]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      sizeRef.current = { width, height, dpr };

      canvas.width = width;
      canvas.height = height;

      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = width;
        maskCanvasRef.current.height = height;
      }
      if (tempCanvasRef.current) {
        tempCanvasRef.current.width = width;
        tempCanvasRef.current.height = height;
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const currentScroll = Math.max(0, -rect.top);

      const OFFSET_PX = 20;
      const targetScrollDistance = Math.max(1, rect.height - OFFSET_PX);

      const progress = Math.min(
        1,
        Math.max(0, currentScroll / targetScrollDistance),
      );
      scrollScaleRef.current = 1 - progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mainCtx = canvas.getContext("2d");
    if (!mainCtx) return;

    const getLocalPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      return { x, y };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const { x, y } = getLocalPoint(e.clientX, e.clientY);
      targetPointerRef.current = { x, y };
      lastMoveTimeRef.current = performance.now();
      isOverNavRef.current =
        e.target instanceof Element && !!e.target.closest(NAV_HOVER_SELECTOR);
    };

    const handleClick = (e: MouseEvent) => {
      triggerNightToggle(e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("click", handleClick);

    const render = () => {
      const { width, height } = sizeRef.current;
      const maskCanvas = maskCanvasRef.current;
      const tempCanvas = tempCanvasRef.current;
      const dayImg = dayImgRef.current;
      const nightImg = nightImgRef.current;
      const now = performance.now();
      const dpr = sizeRef.current.dpr || 1;
      const scrollScale = scrollScaleRef.current;

      const target = targetPointerRef.current;
      if (target) {
        if (!headRef.current) {
          headRef.current = { x: target.x, y: target.y };
        } else {
          headRef.current.x += (target.x - headRef.current.x) * POINTER_EASE;
          headRef.current.y += (target.y - headRef.current.y) * POINTER_EASE;
        }
      }

      const sinceMove = now - lastMoveTimeRef.current;
      const holdFade =
        sinceMove <= TRAIL_HOLD_MS
          ? 1
          : 1 - easeOutCubic((sinceMove - TRAIL_HOLD_MS) / TRAIL_FADE_MS);

      const navScaleTarget = isOverNavRef.current ? 0 : 1;
      navScaleRef.current +=
        (navScaleTarget - navScaleRef.current) * NAV_SCALE_EASE;

      const nightElapsed = now - nightTransitionStartRef.current;
      const nightT = easeInOutCubic(
        Math.min(1, Math.max(0, nightElapsed / NIGHT_TRANSITION_MS)),
      );
      nightProgressRef.current =
        nightFromRef.current +
        (nightTargetRef.current - nightFromRef.current) * nightT;

      if (nightStateRef.current) {
        nightStateRef.current.progress = nightProgressRef.current;
      }

      if (maskCanvas && width && height) {
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          maskCtx.clearRect(0, 0, width, height);
          maskCtx.save();
          maskCtx.filter = `blur(${MASK_BLUR_PX * dpr * scrollScale}px)`;

          const currentNightProgress = nightProgressRef.current;

          if (nightOriginRef.current && currentNightProgress > 0.001) {
            const maxRadius = Math.hypot(width, height);
            const radius = maxRadius * currentNightProgress;
            maskCtx.fillStyle = "#ffffff";
            maskCtx.globalAlpha = 1;
            maskCtx.beginPath();
            maskCtx.arc(
              nightOriginRef.current.x,
              nightOriginRef.current.y,
              radius,
              0,
              Math.PI * 2,
            );
            maskCtx.fill();
          }

          if (
            headRef.current &&
            holdFade > 0.001 &&
            scrollScale > 0.001 &&
            navScaleRef.current > 0.001
          ) {
            const head = headRef.current;
            const prevHead = prevHeadRef.current ?? head;
            const speed = Math.hypot(head.x - prevHead.x, head.y - prevHead.y);

            if (speed > 0.4 * dpr) {
              angleRef.current = Math.atan2(
                head.y - prevHead.y,
                head.x - prevHead.x,
              );
            }

            const navScale = navScaleRef.current;
            const baseRadiusScaled = BASE_RADIUS * dpr * scrollScale;
            const maxLengthScaled = MAX_LENGTH_RADIUS * dpr * scrollScale;
            const minWidthScaled = MIN_WIDTH_RADIUS * dpr * scrollScale;

            const lengthRadius =
              Math.min(
                maxLengthScaled,
                baseRadiusScaled + speed * STRETCH_FACTOR * scrollScale,
              ) * navScale;
            const widthRadius =
              Math.max(
                minWidthScaled,
                baseRadiusScaled - speed * WIDTH_SHRINK_FACTOR * scrollScale,
              ) * navScale;

            maskCtx.globalAlpha = holdFade * scrollScale * navScale;

            if (currentNightProgress > 0.5) {
              maskCtx.globalCompositeOperation = "destination-out";
              maskCtx.fillStyle = "#ffffff";
            } else {
              maskCtx.globalCompositeOperation = "source-over";
              maskCtx.fillStyle = "#ffffff";
            }

            maskCtx.beginPath();
            maskCtx.ellipse(
              head.x,
              head.y,
              lengthRadius,
              widthRadius,
              angleRef.current,
              0,
              Math.PI * 2,
            );
            maskCtx.fill();
          }

          maskCtx.restore();
        }
      }

      if (headRef.current) {
        prevHeadRef.current = { x: headRef.current.x, y: headRef.current.y };
      }

      mainCtx.clearRect(0, 0, width, height);

      if (nightImg) {
        drawCover(
          mainCtx,
          nightImg,
          width,
          height,
          objectPositionX,
          objectPositionY,
        );
      }

      if (tempCanvas && dayImg) {
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.clearRect(0, 0, width, height);
          drawCover(
            tempCtx,
            dayImg,
            width,
            height,
            objectPositionX,
            objectPositionY,
          );

          if (maskCanvasRef.current) {
            tempCtx.globalCompositeOperation = "destination-out";
            tempCtx.drawImage(maskCanvasRef.current, 0, 0);
            tempCtx.globalCompositeOperation = "source-over";
          }

          mainCtx.drawImage(tempCanvas, 0, 0);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("click", handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [objectPositionX, objectPositionY, nightStateRef, triggerNightToggle]);

  return {
    refs: { containerRef, canvasRef },
    triggerNightToggle,
  };
}

export type CouchRevealCanvasViewModel = ReturnType<
  typeof useCouchRevealCanvasViewModel
>;

// --- Spotlight logo reveal ---------------------------------------------------

type UseSpotlightLogoRevealOptions = {
  nightStateRef: React.RefObject<NightState>;
};

const SPOT_EASE = 0.09;
const SPOT_RADIUS = 130;

export function useSpotlightLogoRevealViewModel({
  nightStateRef,
}: UseSpotlightLogoRevealOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const nightPunchOverlayRef = useRef<HTMLDivElement | null>(null);

  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const nightPunchOverlay = nightPunchOverlayRef.current;
    if (!container || !overlay) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handlePointerEnter = () => {
      isHoveredRef.current = true;
    };

    const handlePointerLeave = () => {
      isHoveredRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);

    const render = () => {
      const night = nightStateRef.current;
      const rect = container.getBoundingClientRect();

      if (targetRef.current) {
        if (!posRef.current) {
          posRef.current = { ...targetRef.current };
        } else {
          posRef.current.x +=
            (targetRef.current.x - posRef.current.x) * SPOT_EASE;
          posRef.current.y +=
            (targetRef.current.y - posRef.current.y) * SPOT_EASE;
        }
      }

      if (night && night.origin && night.progress > 0.0001) {
        const localX = night.origin.x - rect.left;
        const localY = night.origin.y - rect.top;

        const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);
        const currentRadius = maxRadius * night.progress;

        const mask = `radial-gradient(circle ${currentRadius}px at ${localX}px ${localY}px, black 0%, black 100%, transparent 100%)`;

        overlay.style.maskImage = mask;
        overlay.style.webkitMaskImage = mask;
        overlay.style.opacity = "1";
      } else if (posRef.current) {
        const mask = `radial-gradient(circle ${SPOT_RADIUS}px at ${posRef.current.x}px ${posRef.current.y}px, black 0%, black 100%, transparent 100%)`;

        overlay.style.maskImage = mask;
        overlay.style.webkitMaskImage = mask;
        overlay.style.opacity = isHoveredRef.current ? "1" : "0";
      }

      if (nightPunchOverlay) {
        const isFullyNight = !!night?.isNight;

        if (isFullyNight && posRef.current) {
          const mask = `radial-gradient(circle ${SPOT_RADIUS}px at ${posRef.current.x}px ${posRef.current.y}px, black 0%, black 100%, transparent 100%)`;

          nightPunchOverlay.style.maskImage = mask;
          nightPunchOverlay.style.webkitMaskImage = mask;
          nightPunchOverlay.style.opacity = isHoveredRef.current ? "1" : "0";
        } else {
          nightPunchOverlay.style.opacity = "0";
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [nightStateRef]);

  return {
    refs: { containerRef, overlayRef, nightPunchOverlayRef },
  };
}

export type SpotlightLogoRevealViewModel = ReturnType<
  typeof useSpotlightLogoRevealViewModel
>;

// --- Home header (composed) --------------------------------------------------

export type HeaderViewModelOptions = {
  isNightMode: boolean;
  playIntroVideo: boolean;
  onToggleNight: (isNight?: boolean) => void;
};

export function useHeaderViewModel({
  isNightMode,
  playIntroVideo,
  onToggleNight,
}: HeaderViewModelOptions) {
  const isFirstMount = useRef(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Phones/tablets skip the intro video entirely and land straight on the
  // couch-reveal canvas (already drawn with cover-fit math), so there's no
  // video to buffer over a slow mobile connection.
  const shouldPlayVideo = useRef(
    playIntroVideo &&
      (typeof window === "undefined" || window.innerWidth >= 1024),
  ).current;

  const [fadeToCouch, setFadeToCouch] = useState(!shouldPlayVideo);
  const [videoFinished, setVideoFinished] = useState(!shouldPlayVideo);
  const [isVideoReady, setIsVideoReady] = useState(!shouldPlayVideo);

  const nightStateRef = useRef<NightState>({
    progress: 0,
    origin: null,
    isNight: false,
  });

  const couch = useCouchRevealCanvasViewModel({
    daySrc: "/couch-extended.png",
    nightSrc: "/couch-night-extended.png",
    objectPositionX: 50,
    objectPositionY: 20.29,
    nightStateRef,
    onToggleNight: (nextNightState) => onToggleNight(nextNightState),
  });

  const spotlight = useSpotlightLogoRevealViewModel({ nightStateRef });

  const { scrollY } = useScroll();

  const couchYOffset = useTransform(scrollY, [0, 600], [0, 200]);
  const textOpacity = useTransform(scrollY, [0, 280], [1, 0]);
  const textYOffset = useTransform(scrollY, [0, 280], [0, 24]);
  const scrollHintOpacity = useTransform(scrollY, [0, 120], [1, 0]);
  const scrollHintY = useTransform(scrollY, [0, 120], [0, 20]);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  useEffect(() => {
    if (!shouldPlayVideo) return;

    const maxLoadingTimer = window.setTimeout(() => {
      setIsVideoReady(true);
    }, 4000);

    return () => window.clearTimeout(maxLoadingTimer);
  }, [shouldPlayVideo]);

  useEffect(() => {
    if (nightStateRef.current.isNight !== isNightMode) {
      couch.triggerNightToggle();
    }
  }, [isNightMode, couch]);

  useEffect(() => {
    if (!shouldPlayVideo) return;

    const preventScroll = (e: WheelEvent) => {
      if (videoFinished) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const preventTouch = (e: TouchEvent) => {
      if (videoFinished) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const preventKeys = (e: KeyboardEvent) => {
      if (
        !videoFinished &&
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
          "Spacebar",
        ].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const preventDrag = (e: DragEvent) => {
      if (videoFinished) return;
      e.preventDefault();
      e.stopPropagation();
    };

    // Scrollbar-thumb dragging fires native "scroll" events directly,
    // bypassing wheel/touch/key interception. Snap back immediately so the
    // scrollbar stays visible (no layout shift) but can't actually scroll.
    const lockedScrollY = window.scrollY;
    const preventScrollbarDrag = () => {
      if (videoFinished) return;
      if (window.scrollY !== lockedScrollY) {
        window.scrollTo(0, lockedScrollY);
      }
    };

    window.addEventListener("wheel", preventScroll, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchmove", preventTouch, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keydown", preventKeys, true);
    window.addEventListener("dragstart", preventDrag, true);
    window.addEventListener("scroll", preventScrollbarDrag, {
      passive: true,
    });

    return () => {
      window.removeEventListener("wheel", preventScroll, true);
      window.removeEventListener("touchmove", preventTouch, true);
      window.removeEventListener("keydown", preventKeys, true);
      window.removeEventListener("dragstart", preventDrag, true);
      window.removeEventListener("scroll", preventScrollbarDrag);
    };
  }, [shouldPlayVideo, videoFinished]);

  const handleVideoEnded = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = videoRef.current.duration;
    videoRef.current.pause();
    window.setTimeout(() => {
      setVideoFinished(true);
    }, 500);
  }, []);

  const handleVideoLoaded = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const handleVideoTimeUpdate = useCallback(() => {
    if (!videoRef.current || fadeToCouch) return;
    const { duration, currentTime } = videoRef.current;
    if (!Number.isFinite(duration) || duration <= 0) return;

    if (duration - currentTime <= 0.5) {
      setFadeToCouch(true);
    }
  }, [fadeToCouch]);

  const handleLogoClick = useCallback(
    (clientX: number, clientY: number) => {
      couch.triggerNightToggle(clientX, clientY);
    },
    [couch],
  );

  return {
    state: { shouldPlayVideo, fadeToCouch, videoFinished, isVideoReady },
    refs: {
      videoRef,
      couch: couch.refs,
      spotlight: spotlight.refs,
    },
    motion: {
      couchYOffset,
      textOpacity,
      textYOffset,
      scrollHintOpacity,
      scrollHintY,
    },
    actions: {
      handleVideoEnded,
      handleVideoLoaded,
      handleVideoTimeUpdate,
      handleLogoClick,
    },
  };
}

export type HomeHeaderViewModel = ReturnType<typeof useHeaderViewModel>;
