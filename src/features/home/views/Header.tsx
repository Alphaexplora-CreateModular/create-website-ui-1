import { AnimatePresence, motion } from "framer-motion";
import {
  useHeaderViewModel,
  type CouchRevealCanvasViewModel,
  type SpotlightLogoRevealViewModel,
} from "../viewModels/useHeaderViewModel";

type CouchRevealCanvasProps = {
  refs: CouchRevealCanvasViewModel["refs"];
  className?: string;
};

function CouchRevealCanvas({ refs, className }: CouchRevealCanvasProps) {
  return (
    <div ref={refs.containerRef} className={className}>
      <canvas
        ref={refs.canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

type SpotlightLogoRevealProps = {
  refs: SpotlightLogoRevealViewModel["refs"];
  logoSrc: string;
  accentColor: string;
  className?: string;
  heightClassName?: string;
  nightHoverColor?: string;
};

function SpotlightLogoReveal({
  refs,
  logoSrc,
  accentColor,
  className,
  heightClassName = "h-50",
  nightHoverColor = "#4C3E39",
}: SpotlightLogoRevealProps) {
  const shapeMask: React.CSSProperties = {
    WebkitMaskImage: `url(${logoSrc})`,
    maskImage: `url(${logoSrc})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };

  return (
    <div
      ref={refs.containerRef}
      className={`relative inline-block ${heightClassName} ${className ?? ""}`}
    >
      <img
        src={logoSrc}
        alt="Logo"
        className={`relative z-0 ${heightClassName} w-auto object-contain select-none pointer-events-none transition-opacity duration-300`}
      />

      <div
        ref={refs.overlayRef}
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
        style={{ opacity: 0 }}
      >
        <div
          className={`${heightClassName} w-full`}
          style={{
            backgroundColor: accentColor,
            ...shapeMask,
          }}
        />
      </div>

      <div
        ref={refs.nightPunchOverlayRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300"
        style={{ opacity: 0 }}
      >
        <div
          className={`${heightClassName} w-full`}
          style={{
            backgroundColor: nightHoverColor,
            ...shapeMask,
          }}
        />
      </div>
    </div>
  );
}

interface HeaderProps {
  isNightMode: boolean;
  playIntroVideo: boolean;
  onToggleNight: (isNight?: boolean) => void;
}

export function Header({
  isNightMode,
  playIntroVideo,
  onToggleNight,
}: HeaderProps) {
  const { state, refs, motion: motionValues, actions } = useHeaderViewModel({
    isNightMode,
    playIntroVideo,
    onToggleNight,
  });
  const { shouldPlayVideo, fadeToCouch, videoFinished, isVideoReady } = state;

  return (
    <section className="home-header relative overflow-hidden">
      <div className="home-header__ending-couch-shell">
        <motion.div
          className="home-header__ending-couch-motion"
          style={{ y: motionValues.couchYOffset }}
        >
          <CouchRevealCanvas
            refs={refs.couch}
            className="home-header__ending-couch"
          />
        </motion.div>
      </div>

      {shouldPlayVideo && (
        <video
          ref={refs.videoRef}
          className={`home-header__video ${
            fadeToCouch ? "home-header__video--fade-out" : ""
          }`}
          src="/video/home.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          draggable={false}
          onLoadedData={actions.handleVideoLoaded}
          onTimeUpdate={actions.handleVideoTimeUpdate}
          onEnded={actions.handleVideoEnded}
        />
      )}

      {shouldPlayVideo && (
        <AnimatePresence>
          {!isVideoReady && (
            <motion.div
              key="header-loading"
              className="home-header__loading home-header__inner flex flex-col items-center justify-center mt-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: "#4C3E39" }}
                    animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <motion.div
        className="home-header__overlay"
        initial={shouldPlayVideo ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={
          shouldPlayVideo
            ? { delay: 5, duration: 2, ease: "easeOut" }
            : { duration: 0 }
        }
      >
        <div className="home-header__inner flex flex-col items-center justify-center mt-20">
          <motion.div
            className="home-header__text-shell flex flex-col items-center justify-center cursor-pointer"
            onClick={(e) => actions.handleLogoClick(e.clientX, e.clientY)}
            style={{
              opacity: motionValues.textOpacity,
              y: motionValues.textYOffset,
            }}
          >
            <motion.div
              initial={shouldPlayVideo ? { opacity: 0, y: -65 } : false}
              animate={{ opacity: 1, y: -115 }}
              transition={
                shouldPlayVideo
                  ? {
                      delay: 5.3,
                      duration: 2,
                      ease: "easeOut",
                    }
                  : { duration: 0 }
              }
            >
              <SpotlightLogoReveal
                refs={refs.spotlight}
                logoSrc="/logo-brown.svg"
                accentColor="#FFCC73"
                heightClassName="h-24 sm:h-32 md:h-40 lg:h-50"
              />
            </motion.div>
          </motion.div>
        </div>

        {videoFinished && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-[#4C3E39]"
            style={{
              opacity: motionValues.scrollHintOpacity,
              y: motionValues.scrollHintY,
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
