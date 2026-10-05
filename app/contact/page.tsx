"use client";

import Image from "next/image";
import { MessageCircle, Mail, MapPin, Clock, Send } from "lucide-react";
import Reveal, { SectionHeading } from "@/components/Reveal";
import { WHATSAPP_LINK, CONTACT } from "@/lib/site";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Get in touch"
        title={<>We'd love to hear from you.</>}
        copy="Questions about your hair, your order, or the ritual? The fastest way to reach us is WhatsApp."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Reveal>
          <div className="card-soft flex h-full flex-col items-center p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/12">
              <MessageCircle className="h-7 w-7 text-[#1da851]" />
            </span>
            <h3 className="section-title mt-5 text-xl">WhatsApp</h3>
            <p className="mt-2 text-sm text-muted">Fastest response — usually within minutes during business hours.</p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-[15px] font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" /> Start Chat
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card-soft flex h-full flex-col items-center p-8 text-center">
            <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-line bg-white p-2">
              <Image src="/images/qr-whatsapp.png" alt="Zulfira WhatsApp QR code" fill className="object-contain" />
            </div>
            <h3 className="section-title mt-5 text-xl">Scan to chat</h3>
            <p className="mt-2 text-sm text-muted">Point your phone camera at the QR code to open WhatsApp instantly.</p>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="card-soft h-full p-8">
            <h3 className="section-title text-xl">Contact details</h3>
            <ul className="mt-5 space-y-4 text-[14.5px]">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-coal" />
                <span>{CONTACT.email}</span>
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
              For order queries, please include your order name and phone number so we can help faster.
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-10">
        <div className="card-soft mx-auto max-w-2xl p-8 sm:p-10">
          <h3 className="section-title text-2xl">Send us a message</h3>
          <p className="mt-2 text-sm text-muted">Fill this in and it opens WhatsApp with your message ready to send.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const msg = `Hello Zulfira!%0A%0AName: ${fd.get("name")}%0AQuery: ${fd.get("message")}`;
              window.open(`${WHATSAPP_LINK}?text=${msg}`, "_blank");
            }}
          >
            <input name="name" required placeholder="Your name" className="input-clean w-full rounded-xl px-5 py-3.5 text-[15px]" />
            <textarea name="message" required rows={4} placeholder="How can we help?" className="input-clean w-full resize-none rounded-xl px-5 py-3.5 text-[15px]" />
            <button type="submit" className="btn-coal flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold">
              <Send className="h-4 w-4" /> Send via WhatsApp
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  );
}
