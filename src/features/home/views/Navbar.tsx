// src/features/home/views/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";

interface NavbarProps {
  activeSection: string;
  isHeaderScrolled: boolean; // Add the sync hook here
}

export function Navbar({ activeSection, isHeaderScrolled }: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else {
        if (currentScrollY > lastScrollY.current) {
          setIsVisible(false); // Hide on scroll down
        } else {
          setIsVisible(true); // Show on scroll up
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isInHeader = activeSection === "header";

  // State Styles Configurations
  let navBg = "#FFFFFF";
  let textColorClass = "text-[#4C3E39]";
  let logoSrc = "/logo-brown.svg";
  let activePillBg = "rgba(76, 62, 57, 0.1)";
  let activePillBorder = "1px solid rgba(76, 62, 57, 0.15)";
  let ctaBorderClass = "border-[#4C3E39]/30 hover:border-[#4C3E39]";
  let ctaHoverBg = "bg-[#4C3E39]/10";
  let navShadow = "0 4px 20px rgba(0, 0, 0, 0.05)";
  let navRadius = "0px 0px 16px 16px";

  if (isInHeader) {
    navBg = "transparent";
    navShadow = "none";
    navRadius = "0px";

    if (!isHeaderScrolled) {
      // 1st Layer: Header Top -> Brown elements, transparent background
      textColorClass = "text-[#4C3E39]";
      logoSrc = "/logo-brown.svg";
      activePillBg = "rgba(76, 62, 57, 0.1)";
      activePillBorder = "1px solid rgba(76, 62, 57, 0.15)";
      ctaBorderClass = "border-[#4C3E39]/30 hover:border-[#4C3E39]";
      ctaHoverBg = "bg-[#4C3E39]/10";
    } else {
      // 2nd Layer: Header Night-mode -> White elements, transparent background
      textColorClass = "text-white";
      logoSrc = "/logo.svg";
      activePillBg = "rgba(255, 255, 255, 0.15)";
      activePillBorder = "1px solid rgba(255, 255, 255, 0.2)";
      ctaBorderClass = "border-white/30 hover:border-white";
      ctaHoverBg = "bg-white/10";
    }
  }
  // 3rd Layer: Lower Content sections -> Default white background, brown elements

  const navStyle: React.CSSProperties = {
    borderRadius: navRadius,
    background: navBg,
    boxShadow: navShadow,
    transition:
      "background 0.4s ease, border-radius 0.4s ease, box-shadow 0.4s ease",
  };

  const links = [
    { name: "Services", href: "#offers", key: "services" },
    { name: "Our Process", href: "#process", key: "process" },
    { name: "Projects", href: "#projects", key: "projects" },
  ];

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      <nav
        style={navStyle}
        className={`grid grid-cols-3 items-center px-8 py-3 w-full select-none transition-colors duration-400 ${textColorClass}`}
      >
        {/* Left: Logo Container */}
        <div className="flex justify-start">
          <a
            href="#header-section"
            className="transition-transform active:scale-95"
          >
            <img
              src={logoSrc}
              alt="Create Logo"
              className="h-10 w-auto transition-all duration-300"
            />
          </a>
        </div>

        {/* Center: Tabs Container */}
        <div className="flex justify-center">
          <div className="relative flex items-center gap-1">
            {links.map((link) => {
              const isActive = activeSection === link.key;

              let activeTextClass = "";
              if (isActive) {
                activeTextClass =
                  isInHeader && isHeaderScrolled
                    ? "text-white"
                    : "text-[#4C3E39]";
              } else {
                activeTextClass =
                  isInHeader && isHeaderScrolled
                    ? "text-white/60 hover:text-white"
                    : "text-[#4C3E39]/60 hover:text-[#4C3E39]";
              }

              return (
                <a
                  key={link.key}
                  href={link.href}
                  className={`relative z-10 px-4 py-1.5 my-2 text-md font-medium tracking-wide rounded-full transition-all duration-300 ${activeTextClass}`}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {isActive && (
                    <span
                      className="absolute inset-0 -z-10 rounded-full transition-all duration-300"
                      style={{
                        background: activePillBg,
                        border: activePillBorder,
                      }}
                    />
                  )}
                  {link.name}
                </a>
              );
            })}
          </div>
        </div>

        {/* Right: CTA Button */}
        <div className="flex justify-end">
          <a
            href="#consultation"
            className={`relative group overflow-hidden border rounded-full px-5 py-2  tracking-wider uppercase transition-all duration-300 active:scale-95 ${ctaBorderClass}`}
          >
            <span
              className="relative text-md z-10 transition-colors duration-300"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Free Consultation
            </span>
            <span
              className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10 ${ctaHoverBg}`}
            />
          </a>
        </div>
      </nav>
    </div>
  );
}
