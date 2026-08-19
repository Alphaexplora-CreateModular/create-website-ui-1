import { useEffect } from "react";
import { FlyInWords } from "../../../shared/components/FlyInWords";
import type { AboutUsHeaderViewModel } from "../viewModels/useAboutUsHeaderViewModel";

export function Header({
  viewModel,
  isNightMode,
}: {
  viewModel: AboutUsHeaderViewModel;
  isNightMode: boolean;
}) {
  const { data, refs } = viewModel;
  const videoSrc = isNightMode
    ? "/video/about_us_night.mp4"
    : "/video/about_us.mp4";

  useEffect(() => {
    const video = refs.videoRef.current;
    if (!video) return;

    const savedTime = video.currentTime;
    const shouldResumePlayback = !video.paused;

    const restorePlaybackPosition = () => {
      if (Number.isFinite(savedTime)) {
        const maxTime = Number.isFinite(video.duration)
          ? video.duration
          : savedTime;
        video.currentTime = Math.min(savedTime, Math.max(0, maxTime));
      }

      if (shouldResumePlayback) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener("loadedmetadata", restorePlaybackPosition, {
      once: true,
    });

    if (video.readyState >= 1) {
      restorePlaybackPosition();
    }

    return () => {
      video.removeEventListener("loadedmetadata", restorePlaybackPosition);
    };
  }, [isNightMode, refs.videoRef]);

  return (
    <>
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

      <div
        ref={refs.videoContainerRef}
        className="absolute inset-0 h-full w-full pointer-events-none transform-gpu"
      >
        <video
          ref={refs.videoRef}
          src={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
        />
      </div>

      <div
        ref={refs.introRef}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 transform-gpu"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs tracking-[0.3em] uppercase mb-3 block text-white/70 font-sans">
            <FlyInWords
              text={data.introLabel}
              baseDelay={data.timing.labelBaseDelayMs}
              stagger={data.timing.labelStaggerMs}
              duration={500}
              flyDistance={14}
            />
          </span>
          <h1 className="text-3xl md:text-6xl font-bold mb-4 max-w-3xl text-white tracking-tight">
            <FlyInWords
              text={data.introHeading}
              baseDelay={data.timing.headingBaseDelayMs}
              stagger={data.timing.headingStaggerMs}
              duration={700}
              flyDistance={30}
            />
          </h1>
          <p className="text-sm md:text-base max-w-xl leading-relaxed text-white/80 font-sans">
            <FlyInWords
              text={data.introParagraph}
              baseDelay={data.timing.paragraphBaseDelayMs}
              stagger={data.timing.paragraphStaggerMs}
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
              animationDelay: `${data.timing.scrollIndicatorDelayMs}ms`,
              animationFillMode: "both",
            }}
          >
            <span className="inline-block animate-bounce">
              Scroll down to step through
            </span>
          </div>
        </div>
      </div>

      {data.steps.map((step, index) => (
        <div
          key={step.number}
          ref={(el) => {
            refs.stepRefs.current[index] = el;
          }}
          className={`absolute top-1/2 z-20 inset-x-0 mx-auto w-[88%] max-w-md px-6 text-center transform-gpu sm:inset-x-auto sm:mx-0 sm:px-0 ${
            step.side === "left"
              ? "sm:left-16 sm:text-left"
              : "sm:right-16 sm:text-right"
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
    </>
  );
}
