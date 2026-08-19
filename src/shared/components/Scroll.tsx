import { motion } from "framer-motion";

export default function Scroll() {
  return (
    <div className="flex flex-col items-center justify-center bg-[#DFD6C9] overflow-hidden py-10 sm:py-14 md:py-20 lg:py-24">
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left { animation: scrollLeft 25s linear infinite; }
        .animate-scroll-right { animation: scrollRight 25s linear infinite; }
        .scroll-outline-text {
          color: transparent;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 2px #4C3E39;
        }
        .home-page-shell--night .scroll-outline-text,
        .about-us-page-shell--night .scroll-outline-text {
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          -webkit-text-stroke-color: #ffffff;
        }
        @media (max-width: 639px) {
          .scroll-outline-text {
            -webkit-text-stroke-width: 1px;
          }
        }
      `}</style>

      {/* Row 1 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ amount: 0.3 }}
        className="w-full overflow-hidden whitespace-nowrap"
      >
        <div className="inline-flex animate-scroll-right">
          <span className="scroll-outline-text font-['THE_BOLD_FONT'] text-[104px] sm:text-[168px] md:text-[248px] lg:text-[374.817px] font-bold leading-normal pr-14 sm:pr-24 md:pr-32 lg:pr-48">
            EXPLORE
          </span>
          <span className="scroll-outline-text font-['THE_BOLD_FONT'] text-[104px] sm:text-[168px] md:text-[248px] lg:text-[374.817px] font-bold leading-normal pr-14 sm:pr-24 md:pr-32 lg:pr-48">
            EXPLORE
          </span>
        </div>
      </motion.div>

      {/* Subtitle 1 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ amount: 0.5 }}
        className="text-[#4C3E39] font-poppins text-xl sm:text-3xl md:text-5xl lg:text-[64px] font-[275] leading-[120%] lg:leading-[100%] z-10 text-center px-6 -my-7 sm:-my-11 md:-my-17 lg:-my-25"
      >
        Designed for Living. Built for You.
      </motion.div>

      {/* Row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ amount: 0.3 }}
        className="w-full overflow-hidden whitespace-nowrap"
      >
        <div className="inline-flex animate-scroll-left">
          <span className="scroll-outline-text font-['THE_BOLD_FONT'] text-[104px] sm:text-[168px] md:text-[248px] lg:text-[374.817px] font-bold leading-normal pr-14 sm:pr-24 md:pr-32 lg:pr-48">
            MODERN
          </span>
          <span className="scroll-outline-text font-['THE_BOLD_FONT'] text-[104px] sm:text-[168px] md:text-[248px] lg:text-[374.817px] font-bold leading-normal pr-14 sm:pr-24 md:pr-32 lg:pr-48">
            MODERN
          </span>
        </div>
      </motion.div>

      {/* Subtitle 2 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ amount: 0.5 }}
        className="text-[#4C3E39] font-poppins text-xl sm:text-3xl md:text-5xl lg:text-[64px] font-[275] leading-[120%] lg:leading-[100%] z-10 text-center px-6 -my-7 sm:-my-11 md:-my-17 lg:-my-25"
      >
        Turning Your Vision into Reality.
      </motion.div>

      {/* Row 3 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ amount: 0.3 }}
        className="w-full overflow-hidden whitespace-nowrap"
      >
        <div className="inline-flex animate-scroll-right">
          <span className="scroll-outline-text font-['THE_BOLD_FONT'] text-[104px] sm:text-[168px] md:text-[248px] lg:text-[374.817px] font-bold leading-normal pr-14 sm:pr-24 md:pr-32 lg:pr-48">
            DESIGN
          </span>
          <span className="scroll-outline-text font-['THE_BOLD_FONT'] text-[104px] sm:text-[168px] md:text-[248px] lg:text-[374.817px] font-bold leading-normal pr-14 sm:pr-24 md:pr-32 lg:pr-48">
            DESIGN
          </span>
        </div>
      </motion.div>
    </div>
  );
}
