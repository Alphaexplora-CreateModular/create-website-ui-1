// src/features/home/views/Navbar.tsx
import React from "react";

interface NavbarProps {
  activeSection: string;
}

export function Navbar({ activeSection }: NavbarProps) {
  const navStyle: React.CSSProperties = {
    borderRadius: "0px 0px 16px 16px",
    background: "#FFFFFF",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", // Soft shadow for depth against light background
    transition: "all 0.3s ease",
  };

  const links = [
    { name: "Services", href: "#offers", key: "services" },
    { name: "Our Process", href: "#process", key: "process" },
    { name: "Projects", href: "#projects", key: "projects" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <nav
        style={navStyle}
        className="grid grid-cols-3 items-center px-8 py-3 w-full select-none text-[#4C3E39]"
      >
        {/* Left: Logo container using your new brown asset */}
        <div className="flex justify-start">
          <a
            href="#header-section"
            className="transition-transform active:scale-95"
          >
            <img
              src="/logo-brown.svg"
              alt="Create Logo"
              className="h-10 w-auto"
            />
          </a>
        </div>

        {/* Center: Centered navigation tabs */}
        <div className="flex justify-center">
          <div className="relative flex items-center gap-1">
            {links.map((link) => {
              const isActive = activeSection === link.key;
              return (
                <a
                  key={link.key}
                  href={link.href}
                  className={`relative z-10 px-4 py-1.5 text-md font-medium tracking-wide rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-[#4C3E39]"
                      : "text-[#4C3E39]/60 hover:text-[#4C3E39]"
                  }`}
                >
                  {/* Subtle active state pill with slight brown tint */}
                  {isActive && (
                    <span
                      className="absolute inset-0 -z-10 rounded-full transition-all duration-300"
                      style={{
                        background: "rgba(76, 62, 57, 0.1)", // 10% opacity brown
                        border: "1px solid rgba(76, 62, 57, 0.15)",
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
            className="relative group overflow-hidden border border-[#4C3E39]/30 hover:border-[#4C3E39] rounded-full px-5 py-2 font-semibold tracking-wider uppercase transition-all duration-300 active:scale-95"
          >
            <span className="relative text-sm z-10 transition-colors duration-300 group-hover:text-[#4C3E39]">
              Free Consultation
            </span>
            {/* Hover fill using a soft brown overlay */}
            <span className="absolute inset-0 bg-[#4C3E39]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
          </a>
        </div>
      </nav>
    </div>
  );
}
