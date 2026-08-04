import { Navbar } from "../../../shared/components/Navbar";
import Footer from "../../../shared/components/Footer";
import { ContactForm } from "./ContactForm";
import { ContactHero } from "./ContactHero";

export function Contact() {
  return (
    <div className="relative min-h-screen pt-24 font-poppins bg-[#E3DACF]">
      <Navbar />

      <main className="container mx-auto px-6 py-10 md:py-20 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <ContactHero />
          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
