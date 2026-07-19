import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";

// FONT SETUP
// ----------
// 1) "THE BOLD FONT" (heading) — this is a real free/personal-use display
//    typeface by Sven Pels, distributed at https://the-bold-font.com and
//    dafont.com. It isn't hosted on a public CDN, so it can't be linked the
//    way Google Fonts can — download the .woff2/.woff/.ttf file yourself
//    (check the license for your use case) and add it to your project like:
//
//    public/
//      fonts/
//        TheBoldFont.woff2
//
//    Then declare it once in your global CSS (e.g. index.css):
//
//    @font-face {
//      font-family: "The Bold Font";
//      src: url("/fonts/TheBoldFont.woff2") format("woff2"),
//           url("/fonts/TheBoldFont.woff") format("woff");
//      font-weight: normal;
//      font-style: normal;
//      font-display: swap;
//    }
//
//    Note: the free version of this font is uppercase-only (no lowercase
//    glyphs), so the heading below is set in uppercase to match it.
//
// 2) Poppins (everything else) — available on Google Fonts, add to your
//    index.html <head>:
//
//    <link rel="preconnect" href="https://fonts.googleapis.com">
//    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

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
    {
      icon: Phone,
      label: "Phone",
      value: "(555) 012-3456",
    },
    {
      icon: Mail,
      label: "Email",
      value: "hello@oakhaus.com",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "18 Maple Works, Design District",
    },
    {
      icon: Clock,
      label: "Hours",
      value: "Mon – Sat · 8:00 AM – 5:00 PM",
    },
  ];

  return (
    <section
      className="w-full py-16 px-6 md:px-12"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* Left column */}
        <div>
          <p
            className="text-xs font-semibold tracking-[0.15em] mb-3"
            style={{ color: "#4C3E39" }}
          >
            LET'S TALK
          </p>

          <h2
            className="text-4xl md:text-5xl leading-tight mb-5 uppercase"
            style={{
              fontFamily: "'The Bold Font', sans-serif",
              fontWeight: 400,
              letterSpacing: "0.01em",
              color: "#4C3E39",
            }}
          >
            Let's build your
            <br />
            dream interior
          </h2>

          <p
            className="text-base leading-relaxed mb-10 max-w-md"
            style={{ color: "#4C3E39" }}
          >
            Whether you're planning a home renovation or a commercial fit-out,
            we're ready to help. Contact us today to schedule your consultation
            and receive a personalized quotation.
          </p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8">
            {contactDetails.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
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
              </div>
            ))}
          </div>
        </div>

        {/* Right column - form card */}
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #4C3E39" }}
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
        </div>
      </div>
    </section>
  );
}
