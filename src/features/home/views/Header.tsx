// src/features/home/views/Header.tsx
import { useEffect, useRef, useState } from "react";
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

  // Same as CSS `cover`: scale so the image fully covers the box, cropping overflow.
  const scale = Math.max(canvasW / imgW, canvasH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;

  // Same as CSS `object-position`: distribute the overflow according to the %.
  const offsetX = (canvasW - drawW) * (objectPositionXPercent / 100);
  const offsetY = (canvasH - drawH) * (objectPositionYPercent / 100);

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

type CouchRevealCanvasProps = {
  daySrc: string;
  nightSrc: string;
  /** Must match the `object-position` used for the day/night couch art. */
  objectPositionX?: number;
  objectPositionY?: number;
  className?: string;
};

/**
 * Renders the day couch image on top of the night couch image and "scratches"
 * a soft, fading trail into the day layer wherever the pointer moves —
 * revealing the night image underneath. Both images are drawn with the exact
 * same cover/position math so the reveal lines up perfectly between the two.
 */
function CouchRevealCanvas({
  daySrc,
  nightSrc,
  objectPositionX = 50,
  objectPositionY = 20.29,
  className,
}: CouchRevealCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const dayImgRef = useRef<HTMLImageElement | null>(null);
  const nightImgRef = useRef<HTMLImageElement | null>(null);

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const rafRef = useRef<number | null>(null);

  // --- Tunables for the trail effect ---
  const BRUSH_RADIUS = 110; // in CSS px; scaled internally by devicePixelRatio
  const TRAIL_DECAY = 0.965; // per-frame alpha retention (lower = fades faster)

  // Load the two source images once.
  useEffect(() => {
    if (!trailCanvasRef.current) {
      trailCanvasRef.current = document.createElement("canvas");
    }
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement("canvas");
    }

    const dayImg = new Image();
    dayImg.src = daySrc;
    dayImgRef.current = dayImg;

    const nightImg = new Image();
    nightImg.src = nightSrc;
    nightImgRef.current = nightImg;
  }, [daySrc, nightSrc]);

  // Keep canvas pixel buffers in sync with the rendered size (and DPR).
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

      if (trailCanvasRef.current) {
        trailCanvasRef.current.width = width;
        trailCanvasRef.current.height = height;
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

  // Pointer trail painting + render loop.
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

    const paintTrailAt = (x: number, y: number) => {
      const trailCanvas = trailCanvasRef.current;
      const trailCtx = trailCanvas?.getContext("2d");
      if (!trailCanvas || !trailCtx) return;

      const { dpr } = sizeRef.current;
      const radius = BRUSH_RADIUS * dpr;

      // Interpolate between the last point and this one so fast swipes don't
      // leave gaps in the trail.
      const from = lastPointRef.current ?? { x, y };
      const dist = Math.hypot(x - from.x, y - from.y);
      const steps = Math.max(1, Math.ceil(dist / (radius * 0.25)));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = from.x + (x - from.x) * t;
        const py = from.y + (y - from.y) * t;

        const gradient = trailCtx.createRadialGradient(
          px,
          py,
          0,
          px,
          py,
          radius,
        );
        gradient.addColorStop(0, "rgba(255,255,255,0.9)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        trailCtx.fillStyle = gradient;
        trailCtx.beginPath();
        trailCtx.arc(px, py, radius, 0, Math.PI * 2);
        trailCtx.fill();
      }

      lastPointRef.current = { x, y };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const { x, y } = getLocalPoint(e.clientX, e.clientY);
      paintTrailAt(x, y);
    };

    const handlePointerLeave = () => {
      lastPointRef.current = null;
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    const render = () => {
      const { width, height } = sizeRef.current;
      const trailCanvas = trailCanvasRef.current;
      const tempCanvas = tempCanvasRef.current;
      const dayImg = dayImgRef.current;
      const nightImg = nightImgRef.current;

      if (trailCanvas && width && height) {
        const trailCtx = trailCanvas.getContext("2d");
        if (trailCtx) {
          // Fade the trail slightly every frame so revealed areas heal back over.
          trailCtx.globalCompositeOperation = "destination-in";
          trailCtx.fillStyle = `rgba(0,0,0,${TRAIL_DECAY})`;
          trailCtx.fillRect(0, 0, width, height);
          trailCtx.globalCompositeOperation = "source-over";
        }
      }

      mainCtx.clearRect(0, 0, width, height);

      // Bottom layer: night couch, always fully drawn.
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

      // Top layer: day couch, with the trail punched out as transparent holes.
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

          if (trailCanvas) {
            tempCtx.globalCompositeOperation = "destination-out";
            tempCtx.drawImage(trailCanvas, 0, 0);
            tempCtx.globalCompositeOperation = "source-over";
          }

          mainCtx.drawImage(tempCanvas, 0, 0);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [objectPositionX, objectPositionY]);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

export function Header() {
  const isFirstMount = useRef(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [fadeToCouch, setFadeToCouch] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);

  const { scrollY } = useScroll();

  const couchYOffset = useTransform(scrollY, [0, 320], [0, 90]);
  const textOpacity = useTransform(scrollY, [0, 280], [1, 0]);
  const textYOffset = useTransform(scrollY, [0, 280], [0, 24]);

  // Fade out the "Scroll Down" instruction as the user scrolls.
  const scrollHintOpacity = useTransform(scrollY, [0, 120], [1, 0]);
  const scrollHintY = useTransform(scrollY, [0, 120], [0, 20]);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  // Disable scrolling while the intro video is playing,
  // but keep the scrollbar visible.
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

    // Freeze on the last frame.
    videoRef.current.currentTime = videoRef.current.duration;
    videoRef.current.pause();

    setVideoFinished(true);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || fadeToCouch) return;

    const { duration, currentTime } = videoRef.current;

    if (!Number.isFinite(duration) || duration <= 0) return;

    // Fade only the video during the last 0.5 seconds.
    if (duration - currentTime <= 0.5) {
      setFadeToCouch(true);
    }
  };

  return (
    <section className="home-header">
      {/* Couch behind video — day/night reveal follows the mouse trail */}
      <div className="home-header__ending-couch-shell">
        <motion.div
          className="home-header__ending-couch-motion"
          style={{ y: couchYOffset }}
        >
          <CouchRevealCanvas
            daySrc="/couch-extended.png"
            nightSrc="/couch-night-extended.png"
            objectPositionX={50}
            objectPositionY={
              20.29
            } /* Consider this always when making adjustments */
            className="home-header__ending-couch"
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
            className="home-header__text-shell flex flex-col items-center justify-center"
            style={{
              opacity: textOpacity,
              y: textYOffset,
            }}
          >
            <motion.div
              className="home-header__subtitle text-[#4C3E39] transition-colors duration-400"
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
              className="text-[200px] font-bold text-[#4C3E39] transition-colors duration-400"
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
