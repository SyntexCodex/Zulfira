"use client";

import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import Reveal, { SectionHeading } from "@/components/Reveal";
import { CONTACT } from "@/lib/site";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Get in touch"
        title={<>We'd love to hear from you.</>}
        copy="Questions about your hair, your order, or the ritual? Reach us by phone or email — we reply within one business day."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="card-soft h-full p-8">
            <h3 className="section-title text-xl">Contact details</h3>
            <ul className="mt-5 space-y-4 text-[14.5px]">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-coal" />
                <a href={`tel:${CONTACT.phoneDisplay.replace(/-/g, "")}`} className="font-semibold hover:underline">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-coal" />
                <a href={`mailto:${CONTACT.email}`} className="hover:underline">{CONTACT.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-coal" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-coal" />
                <span>{CONTACT.hours}</span>
              </li>
            </ul>
            <div className="mt-6 rounded-2xl bg-gold-soft p-4 text-sm text-ink/75">
              For order queries, please include your order number and phone number so we can help faster.
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card-soft h-full p-8">
            <h3 className="section-title text-xl">Send us a message</h3>
            <p className="mt-2 text-sm text-muted">Fill this in and it opens your email app with the message ready to send.</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const subject = encodeURIComponent(`Website enquiry from ${fd.get("name")}`);
                const body = encodeURIComponent(String(fd.get("message") ?? ""));
                window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
              }}
            >
              <input name="name" required placeholder="Your name" className="input-clean w-full rounded-xl px-5 py-3.5 text-[15px]" />
              <textarea name="message" required rows={4} placeholder="How can we help?" className="input-clean w-full resize-none rounded-xl px-5 py-3.5 text-[15px]" />
              <button type="submit" className="btn-coal flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold">
                <Send className="h-4 w-4" /> Send via Email
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
