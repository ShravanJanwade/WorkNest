"use client";

import ContactForm from "./Contact";
import Footer from "./Footer";
import CallToAction from "./CTA";
import TrustedBySection from "./Clients";
import FeaturesUltra from "./Features";
import Hero from "./Hero";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden scroll-smooth">
      <Hero />
      <FeaturesUltra />

      {}
      <TrustedBySection />
      <CallToAction />

      {}
      <ContactForm />
      <Footer />
    </div>
  );
}
