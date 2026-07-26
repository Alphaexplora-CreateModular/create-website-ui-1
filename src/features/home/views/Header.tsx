// src/features/home/views/Header.tsx
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Mimics `object-fit: cover` + `object-position` for a canvas drawImage call.
 * Keep objectPositionX/Y in sync with the CSS `object-position` values used
 * elsewhere for the couch artwork (currently `center 20.29%`).
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  objectPositionXPercent: number,
  objectPositionYPercent: number,
) {
  if (!img.complete || !img.naturalWidth || !img.naturalHeight) return;

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const scale = Math.max(canvasW / imgW, canvasH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;

  const offsetX = (canvasW - drawW) * (objectPositionXPercent / 100);
  const offsetY = (canvasH - drawH) * (objectPositionYPercent / 100);

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

function easeOutCubic(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - clamped, 3);
}

function easeInOutCubic(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

type NightState = {
  progress: number; // 0 (day) to 1 (night), eased over NIGHT_TRANSITION_MS
  origin: { x: number; y: number } | null; // click point, in viewport (client) coordinates
  isNight: boolean;
};

type CouchRevealCanvasProps = {
  daySrc: string;
  nightSrc: string;
  /** Must match the `object-position` used for the day/night couch art. */
  objectPositionX?: number;
  objectPositionY?: number;
  className?: string;
  /** Shared, mutable night-transition state — written here, read by SpotlightColorReveal. */
  nightStateRef: React.RefObject<NightState>;
  onToggleNight?: (isNight: boolean) => void;
};

/** Imperative handle so other elements (e.g. the headline text) can drive
 * the exact same night-toggle transition as clicking the couch itself. */
export type CouchRevealCanvasHandle = {
  triggerNightToggle: (clientX: number, clientY: number) => void;
};

/**
 * Renders the day couch image on top of the night couch image and reveals
 * the night layer underneath with a fluid streak mask.
 */
const CouchRevealCanvas = forwardRef<
  CouchRevealCanvasHandle,
  CouchRevealCanvasProps
>(function CouchRevealCanvas(
  {
    daySrc,
    nightSrc,
    objectPositionX = 50,
    objectPositionY = 20.29,
    className,
    nightStateRef,
    onToggleNight,
  },
  ref,
) {
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

  // --- Hover streak tunables ---
  const POINTER_EASE = 0.09;
  const BASE_RADIUS = 60;
  const STRETCH_FACTOR = 2.6;
  const MAX_LENGTH_RADIUS = 260;
  const WIDTH_SHRINK_FACTOR = 0.9;
  const MIN_WIDTH_RADIUS = 26;
  const MASK_BLUR_PX = 16;
  const TRAIL_HOLD_MS = 2000;
  const TRAIL_FADE_MS = 1200;

  // --- Click-to-night tunables ---
  const NIGHT_TRANSITION_MS = 1000;
  const triggerNightToggle = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);

      nightOriginRef.current = { x, y };
      isNightRef.current = !isNightRef.current;
      nightFromRef.current = nightProgressRef.current;
      nightTargetRef.current = isNightRef.current ? 1 : 0;
      nightTransitionStartRef.current = performance.now();

      if (nightStateRef.current) {
        nightStateRef.current.isNight = isNightRef.current;
        nightStateRef.current.origin = { x: clientX, y: clientY };
      }

      onToggleNight?.(isNightRef.current);
    },
    [nightStateRef, onToggleNight],
  );

  useImperativeHandle(ref, () => ({ triggerNightToggle }), [
    triggerNightToggle,
  ]);

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
    };

    const handleClick = (e: MouseEvent) => {
      triggerNightToggle(e.clientX, e.clientY);
    };

    // Listen on window, not the canvas element: the text overlay sits on top
    // of this canvas and now has pointer-events: auto (so its own hover
    // spotlight works), which means it swallows pointermove while the cursor
    // is over the letters. Tracking on window keeps the couch trail following
    // the cursor everywhere, instead of freezing at the text's edge.
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
          maskCtx.filter = `blur(${MASK_BLUR_PX * dpr}px)`;
          maskCtx.fillStyle = "#ffffff";

          if (nightOriginRef.current && nightProgressRef.current > 0.001) {
            const maxRadius = Math.hypot(width, height);
            const radius = maxRadius * nightProgressRef.current;
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

          if (headRef.current && holdFade > 0.001) {
            const head = headRef.current;
            const prevHead = prevHeadRef.current ?? head;
            const speed = Math.hypot(head.x - prevHead.x, head.y - prevHead.y);

            if (speed > 0.4 * dpr) {
              angleRef.current = Math.atan2(
                head.y - prevHead.y,
                head.x - prevHead.x,
              );
            }

            const lengthRadius = Math.min(
              MAX_LENGTH_RADIUS * dpr,
              BASE_RADIUS * dpr + speed * STRETCH_FACTOR,
            );
            const widthRadius = Math.max(
              MIN_WIDTH_RADIUS * dpr,
              BASE_RADIUS * dpr - speed * WIDTH_SHRINK_FACTOR,
            );

            maskCtx.globalAlpha = holdFade;
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

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "pointer",
        }}
      />
    </div>
  );
});

type SpotlightColorRevealProps = {
  children: React.ReactNode;
  accentColor: string;
  nightStateRef: React.RefObject<NightState>;
  className?: string;
};

/**
 * Renders a base copy of `children` in standard base color (#4C3E39), and an
 * identical top overlay copy in `accentColor` (#FFCC73). The top layer is
 * dynamically masked by mouse movement and night progress, cleanly transforming
 * subtitle AND CREATE text simultaneously.
 */
function SpotlightColorReveal({
  children,
  accentColor,
  nightStateRef,
  className,
}: SpotlightColorRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const SPOT_EASE = 0.09;
  const SPOT_RADIUS = 130;

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Use real hit-testing (pointerenter/pointerleave) instead of manually
    // comparing coordinates against container.getBoundingClientRect(). A
    // transformed descendant (e.g. the CREATE <motion.h1> animating to
    // `y: -115`) renders outside its parent's untransformed layout box, so a
    // manual rect comparison never matches where the text actually is.
    // pointerenter/pointerleave fire based on the browser's real hit-test,
    // which correctly accounts for transforms on any descendant.
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

      // Priority 1: Clicked state (Night Mode expansion/reversion)
      if (night && night.origin && night.progress > 0.0001) {
        const localX = night.origin.x - rect.left;
        const localY = night.origin.y - rect.top;

        const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);
        const currentRadius = maxRadius * night.progress;

        const mask = `radial-gradient(circle ${currentRadius}px at ${localX}px ${localY}px, black 0%, black 90%, transparent 100%)`;

        overlay.style.maskImage = mask;
        overlay.style.webkitMaskImage = mask;
        overlay.style.opacity = "1";
      }
      // Priority 2: Hover state spotlight
      else if (targetRef.current) {
        if (!posRef.current) {
          posRef.current = { ...targetRef.current };
        } else {
          posRef.current.x +=
            (targetRef.current.x - posRef.current.x) * SPOT_EASE;
          posRef.current.y +=
            (targetRef.current.y - posRef.current.y) * SPOT_EASE;
        }

        const mask = `radial-gradient(circle ${SPOT_RADIUS}px at ${posRef.current.x}px ${posRef.current.y}px, black 0%, transparent 100%)`;

        overlay.style.maskImage = mask;
        overlay.style.webkitMaskImage = mask;
        overlay.style.opacity = isHoveredRef.current ? "1" : "0";
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

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className ?? ""}`}
    >
      {/* Base Layer (#4C3E39) */}
      <div className="relative z-0 text-[#4C3E39] [&_*]:!text-inherit transition-colors duration-300">
        {children}
      </div>

      {/* Synchronized Accent Layer (#FFCC73) */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none [&_*]:!text-inherit transition-opacity duration-300"
        style={{
          color: accentColor,
          opacity: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Header() {
  const isFirstMount = useRef(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const couchCanvasRef = useRef<CouchRevealCanvasHandle | null>(null);

  const [fadeToCouch, setFadeToCouch] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);

  const nightStateRef = useRef<NightState>({
    progress: 0,
    origin: null,
    isNight: false,
  });

  const { scrollY } = useScroll();

  const couchYOffset = useTransform(scrollY, [0, 320], [0, 90]);
  const textOpacity = useTransform(scrollY, [0, 280], [1, 0]);
  const textYOffset = useTransform(scrollY, [0, 280], [0, 24]);

  const scrollHintOpacity = useTransform(scrollY, [0, 120], [1, 0]);
  const scrollHintY = useTransform(scrollY, [0, 120], [0, 20]);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (!videoFinished) {
        e.preventDefault();
      }
    };

    const preventTouch = (e: TouchEvent) => {
      if (!videoFinished) {
        e.preventDefault();
      }
    };

    const preventKeys = (e: KeyboardEvent) => {
      if (
        !videoFinished &&
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventTouch, { passive: false });
    window.addEventListener("keydown", preventKeys);

    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventTouch);
      window.removeEventListener("keydown", preventKeys);
    };
  }, [videoFinished]);

  const handleVideoEnded = () => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = videoRef.current.duration;
    videoRef.current.pause();

    setVideoFinished(true);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || fadeToCouch) return;

    const { duration, currentTime } = videoRef.current;

    if (!Number.isFinite(duration) || duration <= 0) return;

    if (duration - currentTime <= 0.5) {
      setFadeToCouch(true);
    }
  };

  return (
    <section className="home-header">
      {/* Couch behind video */}
      <div className="home-header__ending-couch-shell">
        <motion.div
          className="home-header__ending-couch-motion"
          style={{ y: couchYOffset }}
        >
          <CouchRevealCanvas
            ref={couchCanvasRef}
            daySrc="/couch-extended.png"
            nightSrc="/couch-night-extended.png"
            objectPositionX={50}
            objectPositionY={20.29}
            className="home-header__ending-couch"
            nightStateRef={nightStateRef}
          />
        </motion.div>
      </div>

      <video
        ref={videoRef}
        className={`home-header__video ${
          fadeToCouch ? "home-header__video--fade-out" : ""
        }`}
        src="/video/home.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleVideoTimeUpdate}
        onEnded={handleVideoEnded}
      />

      <motion.div
        className="home-header__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5, duration: 2, ease: "easeOut" }}
      >
        <div className="home-header__inner flex flex-col items-center justify-center">
          <motion.div
            className="home-header__text-shell flex flex-col items-center justify-center cursor-pointer"
            onClick={(e) =>
              couchCanvasRef.current?.triggerNightToggle(e.clientX, e.clientY)
            }
            style={{
              opacity: textOpacity,
              y: textYOffset,
            }}
          >
            <SpotlightColorReveal
              accentColor="#FFCC73"
              nightStateRef={nightStateRef}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                className="home-header__subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: isFirstMount.current ? 1.9 : 0,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                Designed for living. built for you.
              </motion.div>

              <motion.h1
                className="text-[200px] font-bold"
                initial={{ opacity: 0, y: -65 }}
                animate={{ opacity: 1, y: -115 }}
                transition={{
                  delay: 5.3,
                  duration: 2,
                  ease: "easeOut",
                }}
              >
                CREATE
              </motion.h1>
            </SpotlightColorReveal>
          </motion.div>
        </div>

        {/* Scroll Down Instruction */}
        {videoFinished && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-[#4C3E39]"
            style={{
              opacity: scrollHintOpacity,
              y: scrollHintY,
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm tracking-[0.3em] uppercase">
              Scroll Down
            </span>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mt-2 text-2xl"
            >
              ↓
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
