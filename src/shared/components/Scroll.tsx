import React from "react";
import { motion } from "framer-motion";

export default function Scroll() {
  return (
    <div className="flex flex-col items-center justify-center bg-[#DFD6C9] overflow-hidden py-24">
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
          <span className="font-['THE_BOLD_FONT'] text-[374.817px] font-bold leading-normal text-transparent [-webkit-text-stroke:2px_#4C3E39] pr-48">
            EXPLORE
          </span>
          <span className="font-['THE_BOLD_FONT'] text-[374.817px] font-bold leading-normal text-transparent [-webkit-text-stroke:2px_#4C3E39] pr-48">
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
        className="text-[#4C3E39] font-poppins text-[64px] font-[275] leading-[100%] z-10 my-[-100px]"
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
          <span className="font-['THE_BOLD_FONT'] text-[374.817px] font-bold leading-normal text-transparent [-webkit-text-stroke:2px_#4C3E39] pr-48">
            MODERN
          </span>
          <span className="font-['THE_BOLD_FONT'] text-[374.817px] font-bold leading-normal text-transparent [-webkit-text-stroke:2px_#4C3E39] pr-48">
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
        className="text-[#4C3E39] font-poppins text-[64px] font-[275] leading-[100%] z-10 my-[-100px]"
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
          <span className="font-['THE_BOLD_FONT'] text-[374.817px] font-bold leading-normal text-transparent [-webkit-text-stroke:2px_#4C3E39] pr-48">
            DESIGN
          </span>
          <span className="font-['THE_BOLD_FONT'] text-[374.817px] font-bold leading-normal text-transparent [-webkit-text-stroke:2px_#4C3E39] pr-48">
            DESIGN
          </span>
        </div>
      </motion.div>
    </div>
  );
}
