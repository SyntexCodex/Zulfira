import type { Metadata } from "next";
import Reveal, { SectionHeading } from "@/components/Reveal";
import { FaqAccordion } from "@/components/home/FaqSection";
import { FAQS } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Zulfira",
  description: "Frequently asked questions about Zulfira products, ordering, delivery and payments.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Help Center"
        title={<>Frequently asked questions.</>}
        copy="Everything about ordering, delivery, payments and using the products."
      />
      <Reveal delay={0.1} className="mt-10">
        <FaqAccordion items={FAQS} />
      </Reveal>
      <Reveal delay={0.15} className="mt-10">
        <div className="card bg-cream p-8 text-center">
          <p className="font-display text-xl font-semibold">Still have a question?</p>
          <p className="mt-2 text-sm text-muted">Message us on WhatsApp — we reply fast.</p>
          <a href="/contact" className="btn-primary mt-5 inline-block rounded-full px-8 py-3 text-sm font-semibold">
            Contact Us
          </a>
        </div>
      </Reveal>
    </div>
  );
}
