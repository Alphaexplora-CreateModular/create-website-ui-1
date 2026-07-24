// src/features/home/views/Contact.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";

type ContactForm = {
  name: string;
  phone: string;
  email: string;
  project: string;
};

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    phone: "",
    email: "",
    project: "",
  });

  const handleChange =
    (field: keyof ContactForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Consultation request:", form);
  };

  const contactDetails = [
    { icon: Phone, label: "Phone", value: "(555) 012-3456" },
    { icon: Mail, label: "Email", value: "hello@oakhaus.com" },
    {
      icon: MapPin,
      label: "Address",
      value: "18 Maple Works, Design District",
    },
    { icon: Clock, label: "Hours", value: "Mon – Sat · 8:00 AM – 5:00 PM" },
  ];

  // Shared scroll viewport settings matching ServiceOverview
  const viewportSettings = { once: false, amount: 0.35 };

  return (
    <section
      className="w-full py-16 px-6 md:px-12 overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* Left column */}
        <div>
          <motion.p
            className="text-xs font-semibold tracking-[0.15em] mb-3"
            style={{ color: "#4C3E39" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportSettings}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            LET'S TALK
          </motion.p>

          <motion.h2
            className="text-4xl md:text-5xl leading-tight mb-5 uppercase"
            style={{
              fontFamily: "'The Bold Font', sans-serif",
              fontWeight: 400,
              letterSpacing: "0.01em",
              color: "#4C3E39",
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportSettings}
            transition={{ delay: 0.05, duration: 0.8, ease: "easeOut" }}
          >
            Let's build your
            <br />
            dream interior
          </motion.h2>

          <motion.p
            className="text-base leading-relaxed mb-10 max-w-md"
            style={{ color: "#4C3E39" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportSettings}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          >
            Whether you're planning a home renovation or a commercial fit-out,
            we're ready to help. Contact us today to schedule your consultation
            and receive a personalized quotation.
          </motion.p>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-8">
            {contactDetails.map(({ icon: Icon, label, value }, index) => (
              <motion.div
                key={label}
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportSettings}
                transition={{
                  delay: 0.15 + index * 0.05, // Subtle stagger sequence for grid items
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#F0E4D6" }}
                >
                  <Icon size={18} style={{ color: "#4C3E39" }} />
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: "#4C3E39" }}>
                    {label}
                  </p>
                  <p
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "#4C3E39" }}
                  >
                    {value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column - form card */}
        <motion.div
          className="rounded-2xl p-8 md:p-10"
          style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #4C3E39" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#4C3E39" }}
                >
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange("name")}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    backgroundColor: "#FAF6F0",
                    border: "1px solid #EDE2D3",
                    color: "#4C3E39",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#4C3E39" }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    backgroundColor: "#FAF6F0",
                    border: "1px solid #EDE2D3",
                    color: "#4C3E39",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#4C3E39" }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange("email")}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: "#FAF6F0",
                  border: "1px solid #EDE2D3",
                  color: "#4C3E39",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#4C3E39" }}
              >
                Tell us about your project
              </label>
              <textarea
                rows={5}
                placeholder="Kitchen renovation, wardrobe, office fit-out..."
                value={form.project}
                onChange={handleChange("project")}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: "#FAF6F0",
                  border: "1px solid #EDE2D3",
                  color: "#4C3E39",
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#3D2A1D", color: "#FBF2E9" }}
            >
              Request Free Consultation
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
