import { Navbar } from "../../../shared/components/Navbar";
import Footer from "../../home/views/Footer";

export function Contact() {
  return (
    <div className="relative min-h-screen pt-24">
      <Navbar />
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#4C3E39]">Contact</h1>
        <p className="mt-4 text-lg text-gray-700">Get in touch with us.</p>
      </main>
      <Footer />
    </div>
  );
}
